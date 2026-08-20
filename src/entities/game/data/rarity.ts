/**
 * Card rarity and everything derived from it (`docs/rules.md` → Rarity, Crops).
 *
 * Market price and reap timer are *functions of rarity*, never per-card fields —
 * the rulebook states them once per grade, so duplicating them onto 21 crops
 * would create 21 chances to disagree with the rules.
 */

export const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'MYTHIC'] as const;

export type Rarity = (typeof RARITIES)[number];

/** Coins a player discards to take a card of this rarity from the Market. */
export const MARKET_PRICE_BY_RARITY: Record<Rarity, number> = {
	COMMON: 1,
	UNCOMMON: 2,
	RARE: 3,
	EPIC: 5,
	MYTHIC: 8,
};

/** Turns a freshly planted Crop of this rarity needs before it is harvested. */
export const REAP_TIMER_BY_RARITY: Record<Rarity, number> = {
	COMMON: 1,
	UNCOMMON: 2,
	RARE: 3,
	EPIC: 4,
	MYTHIC: 5,
};

/** Rarity grade as a 1-based number — several cards scale their effect by it (`Recycle`, `Fertilizer Frenzy`). */
export const RARITY_GRADE: Record<Rarity, number> = {
	COMMON: 1,
	UNCOMMON: 2,
	RARE: 3,
	EPIC: 4,
	MYTHIC: 5,
};

/** Rarities that Raised and Hydroponic beds give their bonus to. */
export const HIGH_RARITIES: readonly Rarity[] = ['RARE', 'EPIC', 'MYTHIC'];
