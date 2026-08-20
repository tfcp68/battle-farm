import {
	BED_DEFINITIONS,
	CROP_COLORS,
	cropsOf,
	definitionOf,
	type EffectTarget,
	type GameModel,
	growingCrops,
	opponentsOf,
	type PlayerId,
	type TargetKind,
	valueOf,
} from '~/entities/game';

/**
 * "Choose a growing Crop", "choose an Opponent" — the card's `TargetKind` made
 * clickable.
 *
 * The *kind* being picked is `TargetModeAutomata`'s state, handed down as a
 * prop; this component only turns it into options. An earlier note here argued
 * the choice should stay out of the FSM layer because "putting it on the bus
 * would replicate a hover to every peer" — which was wrong about this bus:
 * `emitDomainEvent` is local, and only `submitMatchIntent` leaves the tab.
 */

interface Option {
	key: string;
	label: string;
	target: EffectTarget;
}

function optionsFor(match: GameModel, viewerId: PlayerId, kind: TargetKind): Option[] {
	const nameOf = (playerId: PlayerId) => match.players[playerId]?.nickname ?? playerId;

	switch (kind) {
		case 'any_crop':
		case 'own_crop': {
			const crops = kind === 'own_crop' ? cropsOf(match, viewerId) : growingCrops(match);
			return crops.map((crop) => ({
				key: `${crop.playerId}:${crop.bedIndex}`,
				label: `${definitionOf(match, crop.cardId).name} (${valueOf(match, crop.cardId)}) — ${nameOf(crop.playerId)}${crop.isProtected ? ' · greenhouse' : ''}`,
				target: { playerId: crop.playerId, bedIndex: crop.bedIndex },
			}));
		}
		case 'any_bed':
			return match.order.flatMap((playerId) =>
				(match.players[playerId]?.beds ?? []).map((bed, bedIndex) => ({
					key: `${playerId}:${bedIndex}`,
					label: `${BED_DEFINITIONS[bed.type].name} — ${nameOf(playerId)}${bed.crop ? ' · growing' : ' · empty'}`,
					target: { playerId, bedIndex },
				})),
			);
		case 'any_player':
			return match.order.map((playerId) => ({
				key: playerId,
				label: nameOf(playerId),
				target: { playerId },
			}));
		case 'opponent':
			return opponentsOf(match, viewerId).map((playerId) => ({
				key: playerId,
				label: nameOf(playerId),
				target: { playerId },
			}));
		case 'card_in_hand':
			return (match.players[viewerId]?.hand ?? []).map((cardId) => ({
				key: cardId,
				label: `${definitionOf(match, cardId).name} (${valueOf(match, cardId)})`,
				target: { cardId },
			}));
		case 'card_in_discard':
			return match.discard.map((cardId) => ({
				key: cardId,
				label: `${definitionOf(match, cardId).name} (${valueOf(match, cardId)})`,
				target: { cardId },
			}));
		case 'crop_color':
			return CROP_COLORS.map((color) => ({ key: color, label: color, target: { color } }));
		case 'none':
			return [];
	}
}

export function TargetOverlay(props: {
	match: GameModel;
	viewerId: PlayerId;
	kind: TargetKind;
	cardName: string;
	onPick: (target: EffectTarget) => void;
	onCancel: () => void;
}) {
	const { match, viewerId, kind, cardName, onPick, onCancel } = props;
	const options = optionsFor(match, viewerId, kind);

	return (
		<div className="overlay" onClick={onCancel}>
			<div className="overlay-card" onClick={(event) => event.stopPropagation()}>
				<div className="row" style={{ justifyContent: 'space-between' }}>
					<h4 className="section-title">{cardName} — choose a target</h4>
					<button type="button" onClick={onCancel}>
						Cancel
					</button>
				</div>

				<div className="grid">
					{options.map((option) => (
						<button key={option.key} type="button" onClick={() => onPick(option.target)}>
							{option.label}
						</button>
					))}
					{options.length === 0 ? (
						<small className="muted">Nothing to target — the card would do nothing.</small>
					) : null}
				</div>
			</div>
		</div>
	);
}
