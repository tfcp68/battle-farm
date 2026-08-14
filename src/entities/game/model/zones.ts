import { type BedTypeId, type CardDefinition, getCardDefinition, MARKET_SIZE } from '../data';
import { shuffle } from './rng';
import type { Bed, CardInstanceId, GameModel, PlayerId, PlayerState } from './types';

/**
 * The primitives every effect is built from: moving a card between zones,
 * changing a resource, editing a card's value.
 *
 * All of them are pure and return a new model with structural sharing — the
 * Effect Layer commits one snapshot per event, and guests diff snapshots by
 * reference, so mutating in place would break both.
 *
 * None of them validate *rules* (can this player afford it? is it their turn?).
 * That is the phase effects' job; a primitive only refuses what would corrupt
 * the model, and returns it unchanged in that case.
 */

// ── internal updaters ────────────────────────────────────────────────────────

function updatePlayer(model: GameModel, playerId: PlayerId, fn: (player: PlayerState) => PlayerState): GameModel {
	const player = model.players[playerId];
	if (!player) return model;
	return { ...model, players: { ...model.players, [playerId]: fn(player) } };
}

function updateBed(
	model: GameModel,
	playerId: PlayerId,
	bedIndex: number,
	fn: (bed: Bed) => Bed,
): GameModel {
	return updatePlayer(model, playerId, (player) => {
		const bed = player.beds[bedIndex];
		if (!bed) return player;
		const beds = player.beds.slice();
		beds[bedIndex] = fn(bed);
		return { ...player, beds };
	});
}

// ── lookups ──────────────────────────────────────────────────────────────────

/** The definition behind a card instance. Throws on an id the model does not hold. */
export function definitionOf(model: GameModel, cardId: CardInstanceId): CardDefinition {
	const card = model.cards[cardId];
	if (!card) throw new Error(`Card ${cardId} is not in the match`);
	return getCardDefinition(card.defId);
}

/** Current `Card Value` of a card, wherever it sits. */
export function valueOf(model: GameModel, cardId: CardInstanceId): number {
	return model.cards[cardId]?.value ?? 0;
}

// ── deck ─────────────────────────────────────────────────────────────────────

/**
 * Takes up to `count` cards off the top of the Deck. Returns fewer when the Deck
 * runs short — an empty Deck is a legal, and in fact game-ending, state.
 */
export function drawFromDeck(model: GameModel, count: number): [CardInstanceId[], GameModel] {
	if (count <= 0) return [[], model];
	const drawn = model.deck.slice(0, count);
	if (drawn.length === 0) return [[], model];
	return [drawn, { ...model, deck: model.deck.slice(drawn.length) }];
}

/** Returns cards to the Deck and reshuffles it, as `Beanstalk` and `Cartel Agreement` do. */
export function returnToDeck(model: GameModel, cardIds: readonly CardInstanceId[]): GameModel {
	if (cardIds.length === 0) return model;
	const [deck, rng] = shuffle([...model.deck, ...cardIds], model.rng);
	return { ...model, deck, rng };
}

// ── hand ─────────────────────────────────────────────────────────────────────

export function addToHand(model: GameModel, playerId: PlayerId, cardIds: readonly CardInstanceId[]): GameModel {
	if (cardIds.length === 0) return model;
	return updatePlayer(model, playerId, (player) => ({ ...player, hand: [...player.hand, ...cardIds] }));
}

/** Removes one copy of the card from the hand. No-op when the player does not hold it. */
export function removeFromHand(model: GameModel, playerId: PlayerId, cardId: CardInstanceId): GameModel {
	return updatePlayer(model, playerId, (player) => {
		const index = player.hand.indexOf(cardId);
		if (index < 0) return player;
		const hand = player.hand.slice();
		hand.splice(index, 1);
		return { ...player, hand };
	});
}

/** Whoever currently holds this card in hand, if anyone. */
export function holderOf(model: GameModel, cardId: CardInstanceId): PlayerId | null {
	for (const player of Object.values(model.players)) {
		if (player.hand.includes(cardId)) return player.playerId;
	}
	return null;
}

// ── discard ──────────────────────────────────────────────────────────────────

export function discard(model: GameModel, cardIds: readonly CardInstanceId[]): GameModel {
	if (cardIds.length === 0) return model;
	return { ...model, discard: [...model.discard, ...cardIds] };
}

// ── market ───────────────────────────────────────────────────────────────────

/** Empties one Market slot and hands back what was in it. */
export function takeFromMarket(model: GameModel, slotIndex: number): [CardInstanceId | null, GameModel] {
	const cardId = model.market[slotIndex] ?? null;
	if (cardId === null) return [null, model];
	const market = model.market.slice();
	market[slotIndex] = null;
	return [cardId, { ...model, market }];
}

/**
 * Refills every empty slot from the Deck. Slots the Deck can no longer cover
 * stay `null`, which is what triggers the endgame.
 */
export function refillMarket(model: GameModel): GameModel {
	const empty = model.market.reduce((count, slot) => (slot === null ? count + 1 : count), 0);
	if (empty === 0) return model;

	const [drawn, afterDraw] = drawFromDeck(model, empty);
	if (drawn.length === 0) return model;

	const market = afterDraw.market.slice();
	let next = 0;
	for (let slot = 0; slot < MARKET_SIZE && next < drawn.length; slot++) {
		if (market[slot] === null) market[slot] = drawn[next++];
	}
	return { ...afterDraw, market };
}

// ── beds and crops ───────────────────────────────────────────────────────────

/** Puts a crop into a bed with its starting Reap Timer. Refuses an occupied bed. */
export function plantInBed(
	model: GameModel,
	playerId: PlayerId,
	bedIndex: number,
	cardId: CardInstanceId,
	reapTimer: number,
): GameModel {
	return updateBed(model, playerId, bedIndex, (bed) =>
		bed.crop ? bed : { ...bed, crop: { cardId, reapTimer } },
	);
}

/**
 * Empties a bed. `onTurn` records the turn it happened on — a bed emptied early
 * by a Fertilizer cannot be replanted the same turn.
 */
export function clearBed(model: GameModel, playerId: PlayerId, bedIndex: number, onTurn: number): GameModel {
	return updateBed(model, playerId, bedIndex, (bed) => ({ ...bed, crop: null, emptiedOnTurn: onTurn }));
}

export function setBedType(model: GameModel, playerId: PlayerId, bedIndex: number, type: BedTypeId): GameModel {
	return updateBed(model, playerId, bedIndex, (bed) => ({ ...bed, type }));
}

/** Moves a growing crop's Reap Timer, never below 0. */
export function adjustReapTimer(model: GameModel, playerId: PlayerId, bedIndex: number, delta: number): GameModel {
	return updateBed(model, playerId, bedIndex, (bed) =>
		bed.crop ? { ...bed, crop: { ...bed.crop, reapTimer: Math.max(0, bed.crop.reapTimer + delta) } } : bed,
	);
}

// ── resources ────────────────────────────────────────────────────────────────

/** Moves a player's coins, never below 0 — a player cannot owe coins. */
export function adjustCoins(model: GameModel, playerId: PlayerId, delta: number): GameModel {
	return updatePlayer(model, playerId, (player) => ({ ...player, coins: Math.max(0, player.coins + delta) }));
}

/** Moves a player's fertilizers, never below 0. */
export function adjustFertilizers(model: GameModel, playerId: PlayerId, delta: number): GameModel {
	return updatePlayer(model, playerId, (player) => ({
		...player,
		fertilizers: Math.max(0, player.fertilizers + delta),
	}));
}

// ── card values ──────────────────────────────────────────────────────────────

/** Moves a card's `Card Value` (or a planted crop's `Crop Value`), never below 0. */
export function adjustCardValue(model: GameModel, cardId: CardInstanceId, delta: number): GameModel {
	const card = model.cards[cardId];
	if (!card || delta === 0) return model;
	return {
		...model,
		cards: { ...model.cards, [cardId]: { ...card, value: Math.max(0, card.value + delta) } },
	};
}

export function setCardValue(model: GameModel, cardId: CardInstanceId, value: number): GameModel {
	const card = model.cards[cardId];
	if (!card) return model;
	return { ...model, cards: { ...model.cards, [cardId]: { ...card, value: Math.max(0, value) } } };
}
