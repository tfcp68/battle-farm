import { BED_DEFINITIONS } from '../../data';
import {
	adjustCardValue,
	adjustCoins,
	adjustFertilizers,
	cropsOf,
	type GameModel,
	growingCrops,
	opponentsOf,
	type PlayerId,
	returnToDeck,
	removeFromHand,
	setBedType,
	setCardValue,
} from '../../model';
import {
	adjustCropValues,
	biggestCardInHand,
	collectCrop,
	cropCardsInHand,
	destroyCrop,
	drawSpecificFromDeck,
	growingOfColor,
	handOf,
	pickOne,
	resolveTargetCrop,
	roll,
	swapWithDeck,
} from '../helpers';
import type { CardAbility } from '../types';

/**
 * Crop Card abilities (`docs/rules.md` → Crop Cards), one function per named
 * ability. Each is the rules text made executable; the text itself is on the
 * definition in `../../data/crops.ts`.
 *
 * On-harvest abilities fire *after* the crop has paid out and left its bed, so
 * "every other growing Crop" already excludes it.
 *
 * `Tomato / Catch up` has no entry: the rulebook phrases it as always-on rather
 * than as a trigger, so it is applied to the payout by `passiveCropValueBonus`.
 */

/** Common pattern: one coin per other growing crop of the ability's colour. */
const coinPerGrowingOfColor =
	(color: 'RED' | 'GREEN' | 'YELLOW'): CardAbility =>
	(model, ctx) =>
		adjustCoins(model, ctx.playerId, growingOfColor(model, color, ctx.cardId).length);

export const CROP_ABILITIES = {
	/** Bake it Up — when fertilized, this crop is worth 2 more. */
	WHEAT: (model, ctx) => adjustCardValue(model, ctx.cardId, 2),

	/** Cherry Picking — every Common card left in hand gains a point of value. */
	CHERRY: (model, ctx) =>
		handOf(model, ctx.playerId)
			.filter((card) => card.definition.rarity === 'COMMON')
			.reduce((acc, card) => adjustCardValue(acc, card.cardId, 1), model),

	/** Head of Green — a coin for every other Green crop still in the ground. */
	CABBAGE: coinPerGrowingOfColor('GREEN'),

	/** Yellow Patch. */
	CORN: coinPerGrowingOfColor('YELLOW'),

	/** Red Alert. */
	CARROTS: coinPerGrowingOfColor('RED'),

	/**
	 * Onion Ring — a fertilizer per other Onion in hand, a coin per Onion
	 * growing. The rulebook says "every other Onion in your Hand" but plain
	 * "every Onion Crop you have growing", so the one just planted counts.
	 */
	ONION: (model, ctx) => {
		const onionsInHand = handOf(model, ctx.playerId).filter((card) => card.definition.id === 'ONION').length;
		const onionsGrowing = cropsOf(model, ctx.playerId).filter((crop) => crop.definition.id === 'ONION').length;
		return adjustCoins(adjustFertilizers(model, ctx.playerId, onionsInHand), ctx.playerId, onionsGrowing);
	},

	/**
	 * Mango Madness — the chosen opponent swaps one card per crop they have
	 * growing.
	 */
	MANGO: (model, ctx) => {
		const victim = ctx.target?.playerId;
		if (!victim || victim === ctx.playerId) return model;
		const swaps = cropsOf(model, victim).length;
		let next = model;
		for (let i = 0; i < swaps; i++) next = swapWithDeck(next, victim, null);
		return next;
	},

	/** Root Rot — a 1 in 4 chance of another Potato, otherwise a fertilizer. */
	POTATO: (model, ctx) => {
		const [value, afterRoll] = roll(model, 4);
		return value === 4
			? drawSpecificFromDeck(afterRoll, ctx.playerId, 'POTATO')
			: adjustFertilizers(afterRoll, ctx.playerId, 1);
	},

	/**
	 * Melon Mania — a bonus from the second Melon on. Counted from the discard
	 * pile, which by now holds this one; no extra bookkeeping in the model.
	 */
	MELON: (model, ctx) => {
		const harvested = model.discard.filter((id) => model.cards[id]?.defId === 'MELON').length;
		if (harvested < 2) return model;
		const [bonus, afterRoll] = roll(model, 4);
		return adjustCoins(afterRoll, ctx.playerId, bonus);
	},

	/** Beanstalk — trade a card in hand for an unknown one. */
	BEANS: (model, ctx) => swapWithDeck(model, ctx.playerId, null),

	/** Radish Rally — only pays off while a second Wasabi is still in hand. */
	WASABI: (model, ctx) => {
		const victim = ctx.target?.playerId;
		if (!victim || victim === ctx.playerId) return model;
		const hasSecond = handOf(model, ctx.playerId).some((card) => card.definition.id === 'WASABI');
		if (!hasSecond) return model;

		const [amount, afterRoll] = roll(model, 4);
		const stolen = Math.min(amount, afterRoll.players[victim]?.coins ?? 0);
		return adjustCoins(adjustCoins(afterRoll, victim, -stolen), ctx.playerId, stolen);
	},

	/** Pineapple Punch — a crop of your choice goes back into the Deck. */
	PINEAPPLE: (model, ctx) => {
		const victim = resolveTargetCrop(model, ctx.target);
		if (!victim || victim.isProtected) return model;
		return destroyCrop(model, victim, 'deck');
	},

	/** Eggplant Emoji — a coin off the target for every card they are holding. */
	EGGPLANT: (model, ctx) => {
		const victim = ctx.target?.playerId;
		if (!victim) return model;
		return adjustCoins(model, victim, -(model.players[victim]?.hand.length ?? 0));
	},

	/** Spicy Sprinkle — 1d6 points of value scattered over the crop cards in hand. */
	PEPPER: (model, ctx) => {
		const [points, afterRoll] = roll(model, 6);
		let next = afterRoll;
		for (let i = 0; i < points; i++) {
			const candidates = cropCardsInHand(next, ctx.playerId);
			if (candidates.length === 0) break;
			const [card, afterPick] = pickOne(next, candidates);
			next = card ? adjustCardValue(afterPick, card.cardId, 1) : afterPick;
		}
		return next;
	},

	/** Sweet and Sour — fires on both planting and harvest. */
	TANGERINE: (model, ctx) =>
		adjustCropValues(model, (crop) => crop.playerId === ctx.playerId && crop.cardId !== ctx.cardId, 1),

	/** Trick or Treat — everyone pays a coin per fertilizer they are sitting on. */
	PUMPKIN: (model, ctx) =>
		opponentsOf(model, ctx.playerId).reduce((acc, opponent) => {
			const owed = acc.players[opponent]?.fertilizers ?? 0;
			const paid = Math.min(owed, acc.players[opponent]?.coins ?? 0);
			return adjustCoins(adjustCoins(acc, opponent, -paid), ctx.playerId, paid);
		}, model),

	/** Grapevine — upgrades a plain bed, or pays out if the bed is already special. */
	GRAPE: (model, ctx) => {
		if (ctx.bedIndex === undefined) return model;
		const bedType = model.players[ctx.playerId]?.beds[ctx.bedIndex]?.type;
		if (bedType === 'COMMON' || bedType === 'RAISED') {
			return setBedType(model, ctx.playerId, ctx.bedIndex, 'HYDROPONIC');
		}
		return adjustCoins(model, ctx.playerId, 4);
	},

	/** Berry Blitz — every opponent loses their best card to the Deck. */
	CLOUDBERRY: (model, ctx) =>
		opponentsOf(model, ctx.playerId).reduce((acc, opponent) => {
			const cardId = biggestCardInHand(acc, opponent);
			if (!cardId) return acc;
			const devalued = setCardValue(acc, cardId, 1);
			return returnToDeck(removeFromHand(devalued, opponent, cardId), [cardId]);
		}, model),

	/** Ripe for the Picking — cash in the value of any other crop on the field. */
	STRAWBERRY: (model, ctx) => {
		const chosen = resolveTargetCrop(model, ctx.target);
		if (!chosen || chosen.cardId === ctx.cardId) return model;
		return adjustCoins(model, ctx.playerId, chosen.value);
	},

	/**
	 * Blueberry Boom — a bed is knocked back to Common and its crop destroyed,
	 * unless the bed was a Greenhouse, which saves the crop.
	 */
	BLUEBERRY: (model, ctx) => {
		const { playerId: victim, bedIndex } = ctx.target ?? {};
		if (!victim || bedIndex === undefined) return model;
		const bed = model.players[victim]?.beds[bedIndex];
		if (!bed) return model;

		const wasGreenhouse = BED_DEFINITIONS[bed.type].bonus.kind === 'targeting_immunity';
		const downgraded = setBedType(model, victim, bedIndex, 'COMMON');
		if (wasGreenhouse || !bed.crop) return downgraded;

		const crop = growingCrops(downgraded).find(
			(candidate) => candidate.playerId === victim && candidate.bedIndex === bedIndex,
		);
		return crop ? destroyCrop(downgraded, crop, 'discard') : downgraded;
	},
} satisfies Record<string, CardAbility>;

/**
 * `Early Bird` and `Demon of Harvest` collect the whole field at once. Crops are
 * paid out without firing their own on-harvest abilities — see `collectCrop`.
 */
export function collectAllCropsOf(model: GameModel, playerId: PlayerId | null): GameModel {
	const crops = playerId === null ? growingCrops(model) : cropsOf(model, playerId);
	return crops.reduce((acc, crop) => {
		// Re-read the crop: an earlier payout may have moved coins around.
		const current = growingCrops(acc).find(
			(candidate) => candidate.playerId === crop.playerId && candidate.bedIndex === crop.bedIndex,
		);
		return current ? collectCrop(acc, current) : acc;
	}, model);
}

export type CropAbilityId = keyof typeof CROP_ABILITIES;
