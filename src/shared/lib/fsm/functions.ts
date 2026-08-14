import { getCurrentPlayerId } from '~/entities/profile/currentProfile';
// The Win Limit rule belongs to the game entity; this module only makes it
// reachable from a diagram guard rather than reimplementing it.
import { isLimitReached } from '~/entities/game';

/**
 * The two things a diagram genuinely cannot reach on its own.
 *
 * Everything else that used to live here — `hasRipeCrops`, `hasCardsInHand`,
 * `canFertilize`, `hasCoinsForTrade`, `needsTarget` and friends — was a
 * built-in of `@yantrix/functions` rewritten in TypeScript, and now lives as a
 * `define/` in the diagram that uses it. Six more were dead on arrival: nothing
 * ever referenced `hasHarvestEffect`, `hasPlantingEffect`, `hasFertilizeEffect`,
 * `hasAvailableMoves`, `hasTradeOffers` or `hasEligibleEffectConditions`, and
 * the first three shared one byte-identical body.
 */

/**
 * Injected into the turn and window FSMs, which call it synchronously while
 * computing a transition — hence the in-memory mirror rather than a storage read.
 */
export function getPlayerId(): string | null {
	return getCurrentPlayerId();
}

export { isLimitReached };
