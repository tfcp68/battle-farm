import { isCropDefinition } from '../data';
import {
	adjustCardValue,
	adjustFertilizers,
	type CardInstanceId,
	definitionOf,
	discard,
	type GameModel,
	plantableBeds,
	plantedCropValue,
	plantedReapTimer,
	plantInBed,
	type PlayerId,
	removeFromHand,
	valueOf,
} from '../model';
import { applyCardAbility } from './abilities';
import type { EffectTarget } from './types';

/**
 * PLAYING (`docs/rules.md` → Playing Cards): the active player plays cards one
 * at a time. A Crop Card is planted into an empty bed; an Action Card costs
 * fertilizers equal to its `Card Value` and is then discarded.
 */

export interface PlayCardIntent {
	playerId: PlayerId;
	cardId: CardInstanceId;
	/** Where a Crop Card goes. Ignored by Action Cards. */
	bedIndex?: number;
	target?: EffectTarget;
}

export function playCard(model: GameModel, intent: PlayCardIntent): GameModel {
	const { playerId, cardId, bedIndex, target } = intent;
	if (model.turn.phase !== 'PLAYING' || model.turn.activePlayerId !== playerId) return model;
	if (!model.players[playerId]?.hand.includes(cardId)) return model;

	const definition = definitionOf(model, cardId);
	return isCropDefinition(definition)
		? plantCrop(model, playerId, cardId, bedIndex, target)
		: playAction(model, playerId, cardId, target);
}

function plantCrop(
	model: GameModel,
	playerId: PlayerId,
	cardId: CardInstanceId,
	bedIndex: number | undefined,
	target: EffectTarget | undefined,
): GameModel {
	if (bedIndex === undefined || !plantableBeds(model, playerId).includes(bedIndex)) return model;

	const definition = definitionOf(model, cardId);
	if (!isCropDefinition(definition)) return model;

	const bedType = model.players[playerId]?.beds[bedIndex]?.type;
	if (!bedType) return model;

	// The bed's bonus is folded into the crop's value once, at planting: later
	// effects edit the planted value directly, so recomputing it would undo them.
	const planted = plantedCropValue(valueOf(model, cardId), definition, bedType);
	const timer = plantedReapTimer(definition, bedType);

	let next = removeFromHand(model, playerId, cardId);
	next = adjustCardValue(next, cardId, planted - valueOf(next, cardId));
	next = plantInBed(next, playerId, bedIndex, cardId, timer);

	return applyCardAbility(next, { playerId, cardId, bedIndex, target, trigger: 'on_plant' });
}

function playAction(
	model: GameModel,
	playerId: PlayerId,
	cardId: CardInstanceId,
	target: EffectTarget | undefined,
): GameModel {
	const cost = valueOf(model, cardId);
	if ((model.players[playerId]?.fertilizers ?? 0) < cost) return model;

	// The ability resolves while the card is already spent — `Weed Whacker`
	// counts the hand without itself, which is what "every Card in Hand" means
	// once this one has been played.
	let next = adjustFertilizers(model, playerId, -cost);
	next = discard(removeFromHand(next, playerId, cardId), [cardId]);

	return applyCardAbility(next, { playerId, cardId, target, trigger: 'on_play' });
}
