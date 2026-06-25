import { CURRENT_PLAYER_ID_KEY } from '~/entities/auth/queries';

export function getPlayerId(): string | null {
	if (typeof window === 'undefined') return null;
	return window.localStorage.getItem(CURRENT_PLAYER_ID_KEY);
}

type RipeCrop = { readonly reapTimer: number };
type EffectfulCrop = { readonly hasEffect?: boolean };
type GameCard = { readonly type?: string };

const isNonEmptyArray = (value: unknown): value is readonly unknown[] => Array.isArray(value) && value.length > 0;

/** Shopping: a card is affordable when the player has coins for at least one market slot. */
export function hasCoinsForTrade(coins: number, marketPrices: readonly number[]): boolean {
	return Array.isArray(marketPrices) && marketPrices.some((price) => coins >= price);
}

/** Harvest: there is at least one crop whose Reap Timer has reached 0 (ready to harvest). */
export function hasRipeCrops(crops: readonly RipeCrop[]): boolean {
	return Array.isArray(crops) && crops.some((crop) => crop.reapTimer <= 0);
}

/** Harvest: the just-harvested crop carries an effect that forces the player into Target Mode. */
export function hasHarvestEffect(crop: EffectfulCrop | null | undefined): boolean {
	return Boolean(crop?.hasEffect);
}

/** Trading / Playing: the player still holds cards. */
export function hasCardsInHand(hand: readonly unknown[]): boolean {
	return isNonEmptyArray(hand);
}

/** Playing Cards: the player has cards left to keep the play loop going. */
export function hasAvailableMoves(hand: readonly unknown[]): boolean {
	return isNonEmptyArray(hand);
}

/** Trading: at least one other player sent back a trade offer. */
export function hasTradeOffers(offers: readonly unknown[]): boolean {
	return isNonEmptyArray(offers);
}

/** Playing Cards: the chosen card is a Crop Card (planted), as opposed to an Action Card (targeted). */
export function isCropCard(card: GameCard | null | undefined): boolean {
	return card?.type === 'crop';
}

/** Playing Cards: the freshly planted crop triggers an after-planting effect. */
export function hasPlantingEffect(crop: EffectfulCrop | null | undefined): boolean {
	return Boolean(crop?.hasEffect);
}

/** Fertilizing: the player has at least one fertilizer and at least one crop to apply it to. */
export function canFertilize(fertilizers: number, crops: readonly unknown[]): boolean {
	return fertilizers > 0 && isNonEmptyArray(crops);
}

/** Fertilizing: the fertilized crop triggers an effect requiring a target. */
export function hasFertilizeEffect(crop: EffectfulCrop | null | undefined): boolean {
	return Boolean(crop?.hasEffect);
}

/** Waiting: the player has coins to place a trade offer. */
export function hasCoins(coins: number): boolean {
	return coins > 0;
}

/** Waiting: the player is targeted by an effect they are eligible to respond to. */
export function hasEligibleEffectConditions(eligibleEffects: readonly unknown[]): boolean {
	return isNonEmptyArray(eligibleEffects);
}

/** Game Loop: a player has reached the Win Limit of coins (see docs/rules.md#win-limit). */
export function isLimitReached(coins: number, winLimit: number): boolean {
	return coins >= winLimit;
}

/** Turn Loop: the current turn is the last one (set once the Win Limit / deck-empty trigger fired). */
export function isLastTurn(lastTurn: number | boolean): boolean {
	return Boolean(lastTurn);
}
