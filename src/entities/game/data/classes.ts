import type { ClassCardId } from './actions';
import type { BedTypeId } from './beds';
import type { Rarity } from './rarity';

/**
 * Player Classes (`docs/rules.md` → Classes). Each Class fixes the starting bed
 * layout, a resource or card bonus, and the unique Action Card the player may
 * activate once per game.
 *
 * **Interpretation:** `beds` is the *complete* starting layout, so it already
 * contains the Common Bed that Game Preparation step 2 grants everyone —
 * otherwise Land Baron would start with two Common Beds, which the class table
 * does not show.
 */

/** A starting card drawn from a filtered slice of the deck. */
export interface ClassBonusCard {
	kind: 'crop' | 'action';
	rarity: Rarity;
}

export interface ClassDefinition {
	id: string;
	name: string;
	/** Coins on top of the 3 every player starts with. */
	bonusCoins: number;
	/** Fertilizers on top of the 3 every player starts with. */
	bonusFertilizers: number;
	/** Drawn on top of the 3 starting cards, or `null`. */
	bonusCard: ClassBonusCard | null;
	beds: readonly BedTypeId[];
	classCardId: ClassCardId;
}

export const CLASS_DEFINITIONS = {
	LAND_BARON: {
		id: 'LAND_BARON',
		name: 'Land Baron',
		bonusCoins: 2,
		bonusFertilizers: 0,
		bonusCard: null,
		beds: ['COMMON', 'GREENHOUSE', 'GREENHOUSE'],
		classCardId: 'LAND_RECLAMATION',
	},
	GRIM_REAPER: {
		id: 'GRIM_REAPER',
		name: 'Grim Reaper',
		bonusCoins: 0,
		bonusFertilizers: 2,
		bonusCard: null,
		beds: ['COMMON', 'RAISED', 'RAISED'],
		classCardId: 'REAP_AND_SOW',
	},
	MASTER_GARDENER: {
		id: 'MASTER_GARDENER',
		name: 'Master Gardener',
		bonusCoins: 0,
		bonusFertilizers: 0,
		bonusCard: null,
		beds: ['COMMON', 'TRELLIS', 'VERTICAL', 'ROTATIONAL'],
		classCardId: 'EARLY_BIRD',
	},
	CROP_SCIENTIST: {
		id: 'CROP_SCIENTIST',
		name: 'Crop Scientist',
		bonusCoins: 0,
		bonusFertilizers: 0,
		bonusCard: { kind: 'action', rarity: 'COMMON' },
		beds: ['COMMON', 'HYDROPONIC', 'HYDROPONIC'],
		classCardId: 'GENETIC_MODIFICATION',
	},
	SEED_TRADER: {
		id: 'SEED_TRADER',
		name: 'Seed Trader',
		bonusCoins: 0,
		bonusFertilizers: 0,
		bonusCard: { kind: 'crop', rarity: 'COMMON' },
		beds: ['COMMON', 'GREENHOUSE', 'RAISED'],
		classCardId: 'BLACK_FRIDAY',
	},
	WEATHER_WATCHER: {
		id: 'WEATHER_WATCHER',
		name: 'Weather Watcher',
		bonusCoins: 1,
		bonusFertilizers: 1,
		bonusCard: null,
		beds: ['COMMON', 'GREENHOUSE', 'HYDROPONIC'],
		classCardId: 'CLOUD_COVER',
	},
} as const satisfies Record<string, ClassDefinition>;

export type PlayerClassId = keyof typeof CLASS_DEFINITIONS;

export const PLAYER_CLASS_IDS = Object.keys(CLASS_DEFINITIONS) as PlayerClassId[];
