import { type CropDefinition, isCropDefinition, MARKET_SIZE } from '../data';
import { marketPriceOf } from './rules';
import type { CardInstanceId, GameModel, PlayerId } from './types';
import { definitionOf } from './zones';

/**
 * Pure reads over the match model.
 *
 * Card abilities are phrased in terms of these ("every other growing Green Crop
 * in the game", "each empty Garden Bed you have"), so having them in one place
 * keeps ~50 ability functions from each re-deriving the same walk.
 */

/** One growing crop, with everything an ability needs to reason about it. */
export interface GrowingCrop {
	playerId: PlayerId;
	bedIndex: number;
	cardId: CardInstanceId;
	/** Current `Crop Value`, already carrying every modifier applied so far. */
	value: number;
	reapTimer: number;
	definition: CropDefinition;
	/** Greenhouse crops cannot be picked by negative abilities. */
	isProtected: boolean;
}

/** Every crop growing anywhere on the field, in turn order. */
export function growingCrops(model: GameModel): GrowingCrop[] {
	const crops: GrowingCrop[] = [];
	for (const playerId of model.order) {
		const player = model.players[playerId];
		if (!player) continue;
		player.beds.forEach((bed, bedIndex) => {
			if (!bed.crop) return;
			const definition = definitionOf(model, bed.crop.cardId);
			if (!isCropDefinition(definition)) return;
			crops.push({
				playerId,
				bedIndex,
				cardId: bed.crop.cardId,
				value: model.cards[bed.crop.cardId]?.value ?? 0,
				reapTimer: bed.crop.reapTimer,
				definition,
				isProtected: bed.type === 'GREENHOUSE',
			});
		});
	}
	return crops;
}

export function cropsOf(model: GameModel, playerId: PlayerId): GrowingCrop[] {
	return growingCrops(model).filter((crop) => crop.playerId === playerId);
}

/** Crops whose Reap Timer has run out — the ones this turn's Harvest collects. */
export function ripeCropsOf(model: GameModel, playerId: PlayerId): GrowingCrop[] {
	return cropsOf(model, playerId).filter((crop) => crop.reapTimer <= 0);
}

/**
 * Beds a crop may be planted into: empty, and not emptied this very turn
 * (rules → Using Fertilizers).
 */
export function plantableBeds(model: GameModel, playerId: PlayerId): number[] {
	const player = model.players[playerId];
	if (!player) return [];
	const indices: number[] = [];
	player.beds.forEach((bed, index) => {
		if (bed.crop === null && bed.emptiedOnTurn !== model.turn.number) indices.push(index);
	});
	return indices;
}

/** Market slots the player can currently pay for, cheapest first. */
export function affordableMarketSlots(model: GameModel, playerId: PlayerId): number[] {
	const coins = model.players[playerId]?.coins ?? 0;
	const slots: Array<{ index: number; price: number }> = [];
	for (let index = 0; index < MARKET_SIZE; index++) {
		const cardId = model.market[index];
		if (!cardId) continue;
		const price = marketPriceOf(definitionOf(model, cardId));
		if (price !== null && price <= coins) slots.push({ index, price });
	}
	return slots.sort((a, b) => a.price - b.price).map((slot) => slot.index);
}

/** Everyone except the given player, in turn order. */
export function opponentsOf(model: GameModel, playerId: PlayerId): PlayerId[] {
	return model.order.filter((id) => id !== playerId);
}

/** Final standing: coins per player. Feeds the `match_ended` score board. */
export function scoreBoard(model: GameModel): Record<PlayerId, number> {
	const scores: Record<PlayerId, number> = {};
	for (const playerId of model.order) scores[playerId] = model.players[playerId]?.coins ?? 0;
	return scores;
}

/** The player with the most coins. Ties are broken by turn order, as seating is. */
export function leaderOf(model: GameModel): PlayerId | null {
	let leader: PlayerId | null = null;
	let best = -1;
	for (const playerId of model.order) {
		const coins = model.players[playerId]?.coins ?? 0;
		if (coins > best) {
			best = coins;
			leader = playerId;
		}
	}
	return leader;
}
