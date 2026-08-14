import type { CropColor } from './crops';
import { HIGH_RARITIES, type Rarity } from './rarity';

/**
 * Garden Beds (`docs/rules.md` → Garden Beds).
 *
 * Note the rulebook lists **seven** bed types; the pre-Yantrix
 * `~/shared/types/serializables/crops.ts` enum is missing `HYDROPONIC`, which is
 * one reason this module does not build on it.
 */

export const BED_TYPES = [
	'COMMON',
	'RAISED',
	'GREENHOUSE',
	'HYDROPONIC',
	'TRELLIS',
	'ROTATIONAL',
	'VERTICAL',
] as const;

export type BedTypeId = (typeof BED_TYPES)[number];

/**
 * What a bed does for the crop growing in it. A discriminated union rather than
 * a bag of optional fields, so applying a bonus is an exhaustive switch.
 */
export type BedBonus =
	| { kind: 'none' }
	/** Adds to `Crop Value`, optionally only for some rarities or colors. */
	| { kind: 'crop_value'; amount: number; rarities?: readonly Rarity[]; colors?: readonly CropColor[] }
	/** Adds to `Reap Timer` — negative means the crop ripens sooner. */
	| { kind: 'reap_timer'; amount: number; rarities?: readonly Rarity[] }
	/** The crop cannot be picked as a target by negative abilities. */
	| { kind: 'targeting_immunity' };

export interface BedDefinition {
	id: BedTypeId;
	name: string;
	bonus: BedBonus;
}

export const BED_DEFINITIONS: Record<BedTypeId, BedDefinition> = {
	COMMON: {
		id: 'COMMON',
		name: 'Common Bed',
		bonus: { kind: 'none' },
	},
	RAISED: {
		id: 'RAISED',
		name: 'Raised Bed',
		bonus: { kind: 'crop_value', amount: 2, rarities: HIGH_RARITIES },
	},
	GREENHOUSE: {
		id: 'GREENHOUSE',
		name: 'Greenhouse',
		bonus: { kind: 'targeting_immunity' },
	},
	HYDROPONIC: {
		id: 'HYDROPONIC',
		name: 'Hydroponic',
		bonus: { kind: 'reap_timer', amount: -1, rarities: HIGH_RARITIES },
	},
	TRELLIS: {
		id: 'TRELLIS',
		name: 'Trellis',
		bonus: { kind: 'crop_value', amount: 1, colors: ['YELLOW'] },
	},
	ROTATIONAL: {
		id: 'ROTATIONAL',
		name: 'Rotational Bed',
		bonus: { kind: 'crop_value', amount: 1, colors: ['RED'] },
	},
	VERTICAL: {
		id: 'VERTICAL',
		name: 'Vertical Bed',
		bonus: { kind: 'crop_value', amount: 1, colors: ['GREEN'] },
	},
};
