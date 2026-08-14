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
}) {
	const { match, playerId, selected = [], selectable, onSelect, hint, droppable = false } = props;
	const player = match.players[playerId];
	if (!player) return null;

	return (
		<div className="panel">
			<div className="row" style={{ justifyContent: 'space-between' }}>
				<h4 className="section-title">Your hand ({player.hand.length})</h4>
				{hint ? <small className="muted">{hint}</small> : null}
			</div>

			<DropTarget
				zone={{ kind: 'hand' }}
				accept={DRAG_TYPES.marketCard}
				disabled={!droppable}
				className="hand">
				{player.hand.map((cardId) => {
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
				{player.hand.length === 0 ? <small className="muted">No cards.</small> : null}
			</DropTarget>
		</div>
	);
}
