import { type CardDefId, type CardDefinition, type CropColor, isCropDefinition } from '../data';
import {
	addToHand,
	adjustCardValue,
	adjustCoins,
	type CardInstanceId,
	clearBed,
	definitionOf,
	discard,
	drawFromDeck,
	type GameModel,
	type GrowingCrop,
	growingCrops,
	pickIndex,
	type PlayerId,
	removeFromHand,
	returnToDeck,
	rollDie,
} from '../model';

/**
 * Building blocks shared by the card abilities and the phase effects.
 *
 * Two things live here that are easy to get wrong anywhere else: threading the
 * RNG state back into the model after every roll, and collecting a crop without
 * re-triggering abilities.
 */

/** Rolls a die and hands back the model with its RNG state advanced. */
export function roll(model: GameModel, sides: number): [number, GameModel] {
	const [value, rng] = rollDie(model.rng, sides);
	return [value, { ...model, rng }];
}

/** Picks a random element of a non-empty list, advancing the model's RNG. */
export function pickOne<T>(model: GameModel, items: readonly T[]): [T | null, GameModel] {
	if (items.length === 0) return [null, model];
	const [index, rng] = pickIndex(model.rng, items.length);
	return [items[index] ?? null, { ...model, rng }];
}

/** A player's hand as definitions, for abilities that filter by colour or rarity. */
export function handOf(
	model: GameModel,
	playerId: PlayerId,
): Array<{ cardId: CardInstanceId; definition: CardDefinition; value: number }> {
	const player = model.players[playerId];
	if (!player) return [];
	return player.hand.map((cardId) => ({
		cardId,
		definition: definitionOf(model, cardId),
		value: model.cards[cardId]?.value ?? 0,
	}));
}

/** Adds `delta` to the `Card Value` of every card in hand the filter accepts. */
export function adjustHandValues(
	model: GameModel,
	playerId: PlayerId,
	accept: (card: { cardId: CardInstanceId; definition: CardDefinition; value: number }) => boolean,
	delta: number,
): GameModel {
	return handOf(model, playerId)
		.filter(accept)
		.reduce((acc, card) => adjustCardValue(acc, card.cardId, delta), model);
}

/** Adds `delta` to the `Crop Value` of every growing crop the filter accepts. */
export function adjustCropValues(
	model: GameModel,
	accept: (crop: GrowingCrop) => boolean,
	delta: number,
): GameModel {
	return growingCrops(model)
		.filter(accept)
		.reduce((acc, crop) => adjustCardValue(acc, crop.cardId, delta), model);
}

/** Crops of a colour growing anywhere, optionally excluding one card. */
export function growingOfColor(model: GameModel, color: CropColor, exceptCardId?: CardInstanceId): GrowingCrop[] {
	return growingCrops(model).filter((crop) => crop.definition.color === color && crop.cardId !== exceptCardId);
}

/**
 * `Catch up` (Tomato) is the one ability the rulebook phrases as always-on
 * rather than as a trigger: "+1 Crop Value for every Opponent with more Coins
 * than you". Applied when the crop pays out, so the comparison uses the coin
 * counts at that moment.
 */
export function passiveCropValueBonus(model: GameModel, crop: GrowingCrop): number {
	if (crop.definition.id !== 'TOMATO') return 0;
	const mine = model.players[crop.playerId]?.coins ?? 0;
	return model.order.filter((id) => id !== crop.playerId && (model.players[id]?.coins ?? 0) > mine).length;
}

/**
 * Pays a crop out and empties its bed — the mechanical part of a harvest,
 * without firing the crop's own on-harvest ability.
 *
 * Kept separate because two cards (`Early Bird`, `Demon of Harvest`) collect
 * every crop on the field at once: re-triggering abilities there would chain
 * harvests in a way the rulebook never defines, and could not terminate.
 */
export function collectCrop(model: GameModel, crop: GrowingCrop): GameModel {
	const payout = crop.value + passiveCropValueBonus(model, crop);
	let next = adjustCoins(model, crop.playerId, payout);
	next = clearBed(next, crop.playerId, crop.bedIndex, next.turn.number);
	return discard(next, [crop.cardId]);
}

/** Removes a growing crop from play without paying anyone — `Wither`, `Blueberry Boom`. */
export function destroyCrop(model: GameModel, crop: GrowingCrop, to: 'discard' | 'deck'): GameModel {
	const cleared = clearBed(model, crop.playerId, crop.bedIndex, model.turn.number);
	return to === 'deck' ? returnToDeck(cleared, [crop.cardId]) : discard(cleared, [crop.cardId]);
}

/** Draws cards from the Deck straight into a player's hand. */
export function drawToHand(model: GameModel, playerId: PlayerId, count: number): GameModel {
	const [drawn, afterDraw] = drawFromDeck(model, count);
	return addToHand(afterDraw, playerId, drawn);
}

/** Swaps one card in hand for a random one off the Deck — `Beanstalk`, `Mango Madness`. */
export function swapWithDeck(model: GameModel, playerId: PlayerId, cardId: CardInstanceId | null): GameModel {
	const player = model.players[playerId];
	if (!player || player.hand.length === 0) return model;

	let target = cardId;
	let next = model;
	if (target === null || !player.hand.includes(target)) {
		const [picked, afterPick] = pickOne(model, player.hand);
		target = picked;
		next = afterPick;
	}
	if (target === null) return next;

	next = removeFromHand(next, playerId, target);
	next = returnToDeck(next, [target]);
	return drawToHand(next, playerId, 1);
}

/** Takes the first copy of a definition still sitting in the Deck, if there is one. */
export function drawSpecificFromDeck(model: GameModel, playerId: PlayerId, defId: CardDefId): GameModel {
	const index = model.deck.findIndex((id) => model.cards[id]?.defId === defId);
	if (index < 0) return model;
	const cardId = model.deck[index];
	if (!cardId) return model;
	const deck = model.deck.slice();
	deck.splice(index, 1);
	return addToHand({ ...model, deck }, playerId, [cardId]);
}

/** The highest-value card a player holds, for `Berry Blitz`. */
export function biggestCardInHand(model: GameModel, playerId: PlayerId): CardInstanceId | null {
	return handOf(model, playerId).reduce<{ cardId: CardInstanceId; value: number } | null>(
		(best, card) => (best === null || card.value > best.value ? { cardId: card.cardId, value: card.value } : best),
		null,
	)?.cardId ?? null;
}

/** Resolves an `EffectTarget` to a crop actually growing on the field. */
export function resolveTargetCrop(
	model: GameModel,
	target: { playerId?: PlayerId; bedIndex?: number } | undefined,
): GrowingCrop | null {
	if (!target || target.playerId === undefined || target.bedIndex === undefined) return null;
	return (
		growingCrops(model).find(
			(crop) => crop.playerId === target.playerId && crop.bedIndex === target.bedIndex,
		) ?? null
	);
}

/** Crop cards a player holds — several abilities only touch those. */
export function cropCardsInHand(model: GameModel, playerId: PlayerId) {
	return handOf(model, playerId).filter((card) => isCropDefinition(card.definition));
}
