import {
	BED_DEFINITIONS,
	type BedTypeId,
	type CardDefinition,
	type CropDefinition,
	DECK_TOTAL_CROP_VALUE,
	MARKET_PRICE_BY_RARITY,
	RARITY_GRADE,
	REAP_TIMER_BY_RARITY,
} from '../data';
import type { TurnPhase } from './types';

/**
 * Rule arithmetic: the numbers `docs/rules.md` states as formulas rather than
 * tables. Pure reads over definitions — no model, no side effects — so the
 * Effect Matrix (phase 3) can call them freely.
 */

export const MIN_PLAYERS = 2;
/** The rulebook caps a game at 6 players — one per Class, and there are six. */
export const MAX_PLAYERS = 6;

/**
 * How long a phase may be thought about, in ms — the rulebook's own timings
 * (Buying Seeds 15 s, Playing Cards 30 s, Using Fertilizers 15 s).
 *
 * A duration, not a deadline. An epoch stamped into the model would make two
 * peers that byte-compare their snapshots disagree on the first field, and the
 * model is replicated by replaying events, not by trusting a clock — so the wall
 * clock stays outside it, in the host's phase clock and the viewer's countdown.
 *
 * `CALCULATION` is transient — the driver closes the turn the moment it is
 * entered — and `WAITING` belongs to nobody.
 *
 * **The phases nobody acts in are the ones that were cut.** A turn used to run
 * 110 s, and on a table of two that is 110 s of "Waiting…" before your first
 * move. The cuts are all in time the rules never asked for or that this
 * implementation cannot spend:
 *
 * - `HARVEST` had 10 s and *no player action at all* — `harvest.mermaid` has no
 *   event out of `HARVESTING`, and `runHarvest` has already run inside
 *   `startTurn` before the phase opens. The rulebook's step 1 is instantaneous.
 *   What is left is a beat long enough to watch the coins land.
 * - `TRADE` had the rules' three windows (offer 15 s, bid 15 s, accept 10 s)
 *   added up, but the model has one TRADE phase and not three, so a seller with
 *   nothing to offer burned all forty seconds of it.
 * - `FERTILIZE` is a 1d4 of clicks and has no timing in the rulebook at all.
 *
 * `SHOPPING` and `PLAYING` keep the rulebook's own numbers: those are the two
 * phases where something is actually decided.
 */
export const PHASE_DURATION_MS: Record<TurnPhase, number | null> = {
	WAITING: null,
	HARVEST: 2_000,
	SHOPPING: 15_000,
	TRADE: 20_000,
	PLAYING: 30_000,
	FERTILIZE: 10_000,
	CALCULATION: null,
};

export const STARTING_COINS = 3;
export const STARTING_FERTILIZERS = 3;
export const STARTING_HAND_SIZE = 3;

/**
 * `44 + 6 × players + ceil(total Crop Card value in the Deck ÷ (1 + players))`.
 *
 * Reproduces the rulebook table exactly (2 players → 250 … 6 players → 164),
 * which `tests/game/rules.test.ts` checks row by row.
 */
export function winLimitFor(playerCount: number, deckCropValue: number = DECK_TOTAL_CROP_VALUE): number {
	return 44 + 6 * playerCount + Math.ceil(deckCropValue / (1 + playerCount));
}

/**
 * A player has reached the Win Limit (`docs/rules.md` → Win Limit) — one of the
 * two endgame triggers, the other being an empty Deck.
 */
export function isLimitReached(coins: number, winLimit: number): boolean {
	return coins >= winLimit;
}

/** Coins to buy this card from the Market, or `null` for a Class Card, which never enters it. */
export function marketPriceOf(def: CardDefinition): number | null {
	return def.rarity === null ? null : MARKET_PRICE_BY_RARITY[def.rarity];
}

/**
 * Rarity as a 1-based number, which `Recycle` and `Fertilizer Frenzy` scale by.
 * A Class Card has no rarity grade, hence 0.
 */
export function rarityGradeOf(def: CardDefinition): number {
	return def.rarity === null ? 0 : RARITY_GRADE[def.rarity];
}

/** Extra `Crop Value` this bed grants that crop, or 0. */
export function bedCropValueBonus(bedType: BedTypeId, crop: CropDefinition): number {
	const { bonus } = BED_DEFINITIONS[bedType];
	if (bonus.kind !== 'crop_value') return 0;
	if (bonus.rarities && !bonus.rarities.includes(crop.rarity)) return 0;
	if (bonus.colors && !bonus.colors.includes(crop.color)) return 0;
	return bonus.amount;
}

/** Reap Timer adjustment this bed grants that crop — negative ripens it sooner. */
export function bedReapTimerBonus(bedType: BedTypeId, crop: CropDefinition): number {
	const { bonus } = BED_DEFINITIONS[bedType];
	if (bonus.kind !== 'reap_timer') return 0;
	if (bonus.rarities && !bonus.rarities.includes(crop.rarity)) return 0;
	return bonus.amount;
}

/** The Reap Timer a crop starts with when planted into this bed. Never below 0. */
export function plantedReapTimer(crop: CropDefinition, bedType: BedTypeId): number {
	return Math.max(0, REAP_TIMER_BY_RARITY[crop.rarity] + bedReapTimerBonus(bedType, crop));
}

/**
 * The Crop Value a crop is planted with: its current `Card Value` plus the bed
 * bonus. Later effects modify the planted value directly, so this is the
 * starting point, not a recomputation.
 */
export function plantedCropValue(cardValue: number, crop: CropDefinition, bedType: BedTypeId): number {
	return cardValue + bedCropValueBonus(bedType, crop);
}

/** Greenhouse crops cannot be picked as a target by negative abilities. */
export function isBedTargetable(bedType: BedTypeId): boolean {
	return BED_DEFINITIONS[bedType].bonus.kind !== 'targeting_immunity';
}
