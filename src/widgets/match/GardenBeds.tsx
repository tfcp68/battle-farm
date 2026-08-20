import {
	BED_DEFINITIONS,
	definitionOf,
	type GameModel,
	type PlayerId,
	valueOf,
} from '~/entities/game';
import { DRAG_TYPES } from '~/features/drag-drop/dragModel';
import { CardFace } from './CardFace';
import { DropTarget } from './DropTarget';

/**
 * One player's Garden Beds.
 *
 * Dumb on purpose: which beds may be clicked is decided by whoever is running
 * the interaction — planting wants the empty ones, fertilizing the growing ones,
 * an Action Card whatever its target kind allows. Passing a predicate keeps that
 * decision in one place instead of spreading a `mode` enum through the widget.
 *
 * The same predicate governs dropping, so a bed that cannot be clicked cannot
 * be dropped on either — one rule, two gestures.
 */
export function GardenBeds(props: {
	match: GameModel;
	playerId: PlayerId;
	title?: string;
	selectable?: (bedIndex: number) => boolean;
	onSelect?: (bedIndex: number) => void;
	/**
	 * Which beds accept a dragged card. Separate from `selectable` on purpose:
	 * clicking a bed is the *second* step of planting, so `selectable` is only
	 * true once a card is already picked — while a drag carries its card with it
	 * and needs the bed open from the start.
	 */
	canDrop?: (bedIndex: number) => boolean;
}) {
	const { match, playerId, title, selectable, onSelect, canDrop } = props;
	const player = match.players[playerId];
	if (!player) return null;

	return (
		<div className="panel">
			<h4 className="section-title">{title ?? `${player.nickname} — beds`}</h4>
			<div className="beds">
				{player.beds.map((bed, bedIndex) => {
					const isSelectable = !!onSelect && (selectable?.(bedIndex) ?? false);
					const crop = bed.crop;

					return (
						<DropTarget
							key={bedIndex}
							zone={{ kind: 'bed', playerId, bedIndex }}
							accept={DRAG_TYPES.handCard}
							disabled={!canDrop?.(bedIndex)}
							className={`bed${isSelectable ? ' selectable' : ''}`}
							onClick={isSelectable ? () => onSelect(bedIndex) : undefined}>
							<div className="bed-head">
								<span>{BED_DEFINITIONS[bed.type].name}</span>
								{bed.emptiedOnTurn === match.turn.number ? (
									<span className="muted" title="Harvested this turn — cannot be replanted until the next one">
										spent
									</span>
								) : null}
							</div>

							{crop ? (
								<CardFace
									cardId={crop.cardId}
									definition={definitionOf(match, crop.cardId)}
									value={valueOf(match, crop.cardId)}
									footer={`Reap in ${crop.reapTimer}`}
								/>
							) : (
								<div className="bed-empty">empty</div>
							)}
						</DropTarget>
					);
				})}
			</div>
		</div>
	);
}
