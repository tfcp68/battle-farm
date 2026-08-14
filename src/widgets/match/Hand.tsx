import {
	type CardInstanceId,
	definitionOf,
	type GameModel,
	isCropDefinition,
	type PlayerId,
	valueOf,
} from '~/entities/game';
import { DRAG_TYPES } from '~/features/drag-drop/dragModel';
import { CardFace } from './CardFace';
import { DraggableCard } from './DraggableCard';
import { DropTarget } from './DropTarget';

/**
 * The viewer's hand. Only ever their own: every peer holds the whole model, so
 * rendering someone else's hand is a click away — the rules' hidden information
 * is enforced by this component and nothing else.
 *
 * A prototype-grade limitation, written down rather than papered over: real
 * secrecy needs the host to send per-peer views, which the deterministic
 * replication of phase 4 traded away on purpose.
 */
export function Hand(props: {
	match: GameModel;
	playerId: PlayerId;
	selected?: readonly CardInstanceId[];
	selectable?: (cardId: CardInstanceId) => boolean;
	onSelect?: (cardId: CardInstanceId) => void;
	hint?: string;
	/** The hand is also where a Market card lands when it is dragged out. */
	droppable?: boolean;
	/**
	 * Yours, but not in your hand right now — the cards on the trade table.
	 *
	 * The rules leave them in hand until a deal seals, and the model does too;
	 * this is only where they are *drawn*. A card in two places at once is a card
	 * the player cannot reason about — they drag it onto the table and it appears
	 * to still be where they dragged it from.
	 */
	withheld?: readonly CardInstanceId[];
}) {
	const {
		match,
		playerId,
		selected = [],
		selectable,
		onSelect,
		hint,
		droppable = false,
		withheld = [],
	} = props;
	const player = match.players[playerId];
	if (!player) return null;

	const held = player.hand.filter((cardId) => !withheld.includes(cardId));

	return (
		<div className="panel">
			<div className="row" style={{ justifyContent: 'space-between' }}>
				<h4 className="section-title">Your hand ({held.length})</h4>
				{hint ? <small className="muted">{hint}</small> : null}
			</div>

			<DropTarget
				zone={{ kind: 'hand' }}
				accept={DRAG_TYPES.marketCard}
				disabled={!droppable}
				className="hand">
				{held.map((cardId) => {
					const definition = definitionOf(match, cardId);
					const isSelectable = !!onSelect && (selectable?.(cardId) ?? false);
					const face = {
						cardId,
						definition,
						value: valueOf(match, cardId),
						footer: isCropDefinition(definition) ? 'Crop' : `${valueOf(match, cardId)} fertilizer(s)`,
						selected: selected.includes(cardId),
						disabled: !isSelectable,
						onClick: isSelectable ? () => onSelect(cardId) : undefined,
					};

					// A card only becomes draggable once something would accept it —
					// the same condition that makes it clickable.
					return isSelectable ? (
						<DraggableCard
							key={cardId}
							{...face}
							dragId={cardId}
							dragType={DRAG_TYPES.handCard}
							dragData={{ cardId }}
						/>
					) : (
						<CardFace key={cardId} {...face} />
					);
				})}
				{held.length === 0 ? (
					<small className="muted">{withheld.length > 0 ? 'All on the table.' : 'No cards.'}</small>
				) : null}
			</DropTarget>
		</div>
	);
}
