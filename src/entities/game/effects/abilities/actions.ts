import { isCropDefinition, MARKET_SIZE } from '../../data';
import {
	addToHand,
	adjustCardValue,
	adjustCoins,
	adjustFertilizers,
	adjustReapTimer,
	type CardInstanceId,
	cropsOf,
	type GameModel,
	definitionOf,
	discard,
	drawFromDeck,
	growingCrops,
	marketPriceOf,
	opponentsOf,
	plantableBeds,
	type PlayerId,
	rarityGradeOf,
	refillMarket,
	removeFromHand,
	returnToDeck,
	setBedType,
	setCardValue,
	takeFromMarket,
	valueOf,
} from '../../model';
import {
	adjustCropValues,
	destroyCrop,
	drawSpecificFromDeck,
	drawToHand,
	handOf,
	pickOne,
	resolveTargetCrop,
	roll,
} from '../helpers';
import type { CardAbility } from '../types';
import { collectAllCropsOf } from './crops';

/**
 * Action Card abilities (`docs/rules.md` → Action Cards and Classes). Playing
 * the card — paying its fertilizer cost and discarding it — is the PLAYING phase
 * effect's job; these functions are only what the card *does*.
 *
 * A card that needs a target and was given none returns the model untouched: an
 * unplayable card must not be a half-played one.
 */

/**
 * Kills whatever grows in a bed, re-reading it from the model so a caller can
 * chain destructions without stale indices.
 */
function destroyAt(model: GameModel, playerId: PlayerId, bedIndex: number): GameModel {
	const crop = growingCrops(model).find(
		(candidate) => candidate.playerId === playerId && candidate.bedIndex === bedIndex,
	);
	return crop ? destroyCrop(model, crop, 'discard') : model;
}

/** Four cards do nothing but retype a bed. */
const transformBed =
	(type: 'GREENHOUSE' | 'TRELLIS' | 'VERTICAL' | 'ROTATIONAL'): CardAbility =>
	(model, ctx) => {
		const { playerId, bedIndex } = ctx.target ?? {};
		if (!playerId || bedIndex === undefined) return model;
		return setBedType(model, playerId, bedIndex, type);
	};

/** Three cards pump one colour of crop card in hand. */
const boostColorInHand =
	(color: 'RED' | 'GREEN' | 'YELLOW'): CardAbility =>
	(model, ctx) =>
		handOf(model, ctx.playerId)
			.filter((card) => isCropDefinition(card.definition) && card.definition.color === color)
			.reduce((acc, card) => adjustCardValue(acc, card.cardId, 1), model);

export const ACTION_ABILITIES = {
	/** Garden Gourmet — this card's value is added to a crop. */
	GARDEN_GOURMET: (model, ctx) => {
		const crop = resolveTargetCrop(model, ctx.target);
		if (!crop) return model;
		return adjustCardValue(model, crop.cardId, valueOf(model, ctx.cardId));
	},

	/** Fertilizer Frenzy — a crop loses value by its own rarity grade. */
	FERTILIZER_FRENZY: (model, ctx) => {
		const crop = resolveTargetCrop(model, ctx.target);
		if (!crop || crop.isProtected) return model;
		return adjustCardValue(model, crop.cardId, -rarityGradeOf(crop.definition));
	},

	/** Recycle — a card in hand is scrapped for fertilizers by its rarity. */
	RECYCLE: (model, ctx) => {
		const scrapped = ctx.target?.cardId;
		if (!scrapped) return model;
		const player = model.players[ctx.playerId];
		if (!player?.hand.includes(scrapped)) return model;

		const gained = rarityGradeOf(definitionOf(model, scrapped)) + 1;
		const removed = discard(removeFromHand(model, ctx.playerId, scrapped), [scrapped]);
		return adjustFertilizers(removed, ctx.playerId, gained);
	},

	/** Lucky Find. */
	LUCKY_FIND: (model, ctx) => {
		const [coins, afterRoll] = roll(model, 4);
		return adjustCoins(afterRoll, ctx.playerId, coins);
	},

	GREEN_DAY: boostColorInHand('GREEN'),
	RED_HEAT: boostColorInHand('RED'),
	YELLOW_GOLD: boostColorInHand('YELLOW'),

	/** Weed Whacker — a coin for every card still in hand. */
	WEED_WHACKER: (model, ctx) => adjustCoins(model, ctx.playerId, model.players[ctx.playerId]?.hand.length ?? 0),

	/** Pest Control. */
	PEST_CONTROL: (model, ctx) => adjustCropValues(model, (crop) => crop.playerId === ctx.playerId, 1),

	/** Supernatural Selection — one other card in hand gains 4 value. */
	SUPERNATURAL_SELECTION: (model, ctx) => {
		const chosen = ctx.target?.cardId;
		if (!chosen || chosen === ctx.cardId) return model;
		if (!model.players[ctx.playerId]?.hand.includes(chosen)) return model;
		return adjustCardValue(model, chosen, 4);
	},

	/** Flower Power — a fertilizer per distinct kind of crop on the whole field. */
	FLOWER_POWER: (model, ctx) => {
		const unique = new Set(growingCrops(model).map((crop) => crop.definition.id));
		return adjustFertilizers(model, ctx.playerId, unique.size);
	},

	/** Fungus Flay — a whole colour withers, Greenhouses excepted. */
	FUNGUS_FLAY: (model, ctx) => {
		const color = ctx.target?.color;
		if (!color) return model;
		return adjustCropValues(model, (crop) => crop.definition.color === color && !crop.isProtected, -1);
	},

	/** Surging Seedlings — a card for every bed standing empty. */
	SURGING_SEEDLINGS: (model, ctx) => drawToHand(model, ctx.playerId, plantableBeds(model, ctx.playerId).length),

	/** Thorny Fence — everything in one player's hand is worth a little less. */
	THORNY_FENCE: (model, ctx) => {
		const victim = ctx.target?.playerId;
		if (!victim) return model;
		return handOf(model, victim).reduce((acc, card) => adjustCardValue(acc, card.cardId, -1), model);
	},

	/** Soil Enrichment — your whole garden ripens a turn sooner. */
	SOIL_ENRICHMENT: (model, ctx) =>
		cropsOf(model, ctx.playerId).reduce(
			(acc, crop) => adjustReapTimer(acc, crop.playerId, crop.bedIndex, -1),
			model,
		),

	/** Seed Sprout — a card per colour you are growing, three at most. */
	SEED_SPROUT: (model, ctx) => {
		const colors = new Set(cropsOf(model, ctx.playerId).map((crop) => crop.definition.color));
		return drawToHand(model, ctx.playerId, Math.min(3, colors.size));
	},

	/**
	 * Pollen Paradise — two cards drawn, one kept.
	 *
	 * The rulebook lets the player choose; with no interactive step yet, the
	 * higher-value card is kept, which is what a player would almost always do.
	 */
	POLLEN_PARADISE: (model, ctx) => {
		const [drawn, afterDraw] = drawFromDeck(model, 2);
		if (drawn.length === 0) return model;

		const sorted = [...drawn].sort((a, b) => valueOf(afterDraw, b) - valueOf(afterDraw, a));
		const kept = sorted[0] as CardInstanceId;
		const returned = sorted.slice(1);

		let next = addToHand(afterDraw, ctx.playerId, [kept]);
		next = returnToDeck(next, returned);

		const keptDef = definitionOf(next, kept);
		if (!isCropDefinition(keptDef)) return next;
		const matching = handOf(next, ctx.playerId).filter(
			(card) => isCropDefinition(card.definition) && card.definition.color === keptDef.color,
		).length;
		return adjustFertilizers(next, ctx.playerId, matching);
	},

	RETRACTABLE_GREENHOUSE: transformBed('GREENHOUSE'),

	/** Garden Gnome — every opponent sheds random cards. */
	GARDEN_GNOME: (model, ctx) => {
		const count = valueOf(model, ctx.cardId);
		return opponentsOf(model, ctx.playerId).reduce((acc, opponent) => {
			let next = acc;
			for (let i = 0; i < count; i++) {
				const hand = next.players[opponent]?.hand ?? [];
				if (hand.length === 0) break;
				const [victim, afterPick] = pickOne(next, hand);
				if (!victim) break;
				next = discard(removeFromHand(afterPick, opponent, victim), [victim]);
			}
			return next;
		}, model);
	},

	TRELLIS_BED: transformBed('TRELLIS'),
	VERTICAL_BED: transformBed('VERTICAL'),
	ROTATIONAL_BED: transformBed('ROTATIONAL'),

	/** Waste Disposal — a full hand costs that player their harvest. */
	WASTE_DISPOSAL: (model, ctx) => {
		const victim = ctx.target?.playerId;
		if (!victim) return model;
		const penalty = model.players[victim]?.hand.length ?? 0;
		return adjustCropValues(model, (crop) => crop.playerId === victim, -penalty);
	},

	/** Cartel Agreement — one Market card taken, the rest churned back through the Deck. */
	CARTEL_AGREEMENT: (model, ctx) => {
		const filled = model.market
			.map((cardId, index) => ({ cardId, index }))
			.filter((slot): slot is { cardId: CardInstanceId; index: number } => slot.cardId !== null);
		if (filled.length === 0) return model;

		const [taken, afterPick] = pickOne(model, filled);
		if (!taken) return model;

		let next = afterPick;
		const [takenCard, afterTake] = takeFromMarket(next, taken.index);
		next = takenCard ? addToHand(afterTake, ctx.playerId, [takenCard]) : afterTake;

		const rest: CardInstanceId[] = [];
		for (let slot = 0; slot < MARKET_SIZE; slot++) {
			const [cardId, afterClear] = takeFromMarket(next, slot);
			next = afterClear;
			if (cardId) rest.push(cardId);
		}
		return refillMarket(returnToDeck(next, rest));
	},

	/** Chemical Bliss — a d6 of fertilizers per point of this card's value. */
	CHEMICAL_BLISS: (model, ctx) => {
		let next = model;
		let gained = 0;
		for (let i = 0; i < valueOf(model, ctx.cardId); i++) {
			const [value, afterRoll] = roll(next, 6);
			gained += value;
			next = afterRoll;
		}
		return adjustFertilizers(next, ctx.playerId, gained);
	},

	/** Drought — everything on the field takes two turns longer. */
	DROUGHT: (model) =>
		growingCrops(model).reduce((acc, crop) => adjustReapTimer(acc, crop.playerId, crop.bedIndex, 2), model),

	/** Clone — a copy of any growing crop, taken out of the Deck. */
	CLONE: (model, ctx) => {
		const crop = resolveTargetCrop(model, ctx.target);
		// The instance, not the definition, carries the `CardDefId`-typed id.
		const defId = crop ? model.cards[crop.cardId]?.defId : undefined;
		if (!defId) return model;
		return drawSpecificFromDeck(model, ctx.playerId, defId);
	},

	/** Wither — a crop simply dies. */
	WITHER: (model, ctx) => {
		const crop = resolveTargetCrop(model, ctx.target);
		if (!crop || crop.isProtected) return model;
		return destroyAt(model, crop.playerId, crop.bedIndex);
	},

	/**
	 * Demon of Harvest — a 1 in 20 chance to reap the whole world.
	 *
	 * Otherwise the roll is a fertilizer price: pay it and shop the Market for
	 * free up to the same number of coins' worth, or lose your entire garden.
	 * The rulebook lets the player choose which cards to take; here they are
	 * taken cheapest first, which maximises the count.
	 */
	DEMON: (model, ctx) => {
		const [value, afterRoll] = roll(model, 20);
		if (value === 20) return collectAllCropsOf(afterRoll, null);

		const fertilizers = afterRoll.players[ctx.playerId]?.fertilizers ?? 0;
		if (fertilizers < value) {
			return cropsOf(afterRoll, ctx.playerId).reduce(
				(acc, crop) => destroyAt(acc, crop.playerId, crop.bedIndex),
				afterRoll,
			);
		}

		let next = adjustFertilizers(afterRoll, ctx.playerId, -value);
		let budget = value;
		const priced = next.market
			.map((cardId, index) => ({ cardId, index }))
			.filter((slot): slot is { cardId: CardInstanceId; index: number } => slot.cardId !== null)
			.map((slot) => ({ ...slot, price: marketPriceOf(definitionOf(next, slot.cardId)) ?? Number.MAX_SAFE_INTEGER }))
			.sort((a, b) => a.price - b.price);

		for (const slot of priced) {
			if (slot.price > budget) break;
			const [cardId, afterTake] = takeFromMarket(next, slot.index);
			if (!cardId) continue;
			next = addToHand(afterTake, ctx.playerId, [cardId]);
			budget -= slot.price;
		}
		return refillMarket(next);
	},

	// ── Class Cards ───────────────────────────────────────────────────────────

	/**
	 * Land Reclamation — a discarded card comes back doubled. The second copy is
	 * pulled from the Deck, so it only arrives if one is still in there.
	 */
	LAND_RECLAMATION: (model, ctx) => {
		const chosen = ctx.target?.cardId;
		if (!chosen) return model;
		const defId = model.cards[chosen]?.defId;
		const index = model.discard.indexOf(chosen);
		if (!defId || index < 0) return model;

		const discardPile = model.discard.slice();
		discardPile.splice(index, 1);
		const next = addToHand({ ...model, discard: discardPile }, ctx.playerId, [chosen]);
		return drawSpecificFromDeck(next, ctx.playerId, defId);
	},

	/** Reap And Sow — every opponent hands over a whole colour. */
	REAP_AND_SOW: (model, ctx) => {
		const color = ctx.target?.color;
		if (!color) return model;
		return opponentsOf(model, ctx.playerId).reduce((acc, opponent) => {
			const taken = handOf(acc, opponent)
				.filter((card) => isCropDefinition(card.definition) && card.definition.color === color)
				.map((card) => card.cardId);
			const stripped = taken.reduce((inner, cardId) => removeFromHand(inner, opponent, cardId), acc);
			return addToHand(stripped, ctx.playerId, taken);
		}, model);
	},

	/** Early Bird — the whole garden comes in at once, plus a card. */
	EARLY_BIRD: (model, ctx) => drawToHand(collectAllCropsOf(model, ctx.playerId), ctx.playerId, 1),

	/** Genetic Modification. */
	GENETIC_MODIFICATION: (model, ctx) =>
		cropsOf(model, ctx.playerId).reduce((acc, crop) => setCardValue(acc, crop.cardId, crop.value * 2), model),

	/** Black Friday — every hand and the Market are wiped, and paid for. */
	BLACK_FRIDAY: (model, ctx) => {
		let next = model;
		let affected = 0;

		for (const playerId of next.order) {
			const hand = next.players[playerId]?.hand ?? [];
			affected += hand.length;
			next = hand.reduce((acc, cardId) => removeFromHand(acc, playerId, cardId), next);
			next = returnToDeck(next, hand);
		}

		const swept: CardInstanceId[] = [];
		for (let slot = 0; slot < MARKET_SIZE; slot++) {
			const [cardId, afterClear] = takeFromMarket(next, slot);
			next = afterClear;
			if (cardId) swept.push(cardId);
		}
		affected += swept.length;

		next = refillMarket(discard(next, swept));
		return adjustCoins(next, ctx.playerId, affected);
	},

	/** Cloud Cover — an opponent's garden stalls. */
	CLOUD_COVER: (model, ctx) => {
		const victim = ctx.target?.playerId;
		if (!victim || victim === ctx.playerId) return model;
		return cropsOf(model, victim).reduce((acc, crop) => {
			const [delay, afterRoll] = roll(acc, 4);
			return adjustReapTimer(afterRoll, crop.playerId, crop.bedIndex, delay);
		}, model);
	},
} satisfies Record<string, CardAbility>;

export type ActionAbilityId = keyof typeof ACTION_ABILITIES;
