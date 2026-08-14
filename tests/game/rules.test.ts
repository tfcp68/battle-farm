import { describe, expect, it } from '@jest/globals';
import {
	bedCropValueBonus,
	CARD_DEFINITIONS,
	type CardDefId,
	CROP_DEFINITIONS,
	type CropId,
	isBedTargetable,
	marketPriceOf,
	plantedCropValue,
	plantedReapTimer,
	rarityGradeOf,
	winLimitFor,
} from '~/entities/game';

describe('win limit', () => {
	/** The table `docs/rules.md` prints, row for row. */
	it.each([
		[2, 250],
		[3, 208],
		[4, 185],
		[5, 171],
		[6, 164],
	])('is %i players → %i coins', (players, expected) => {
		expect(winLimitFor(players)).toBe(expected);
	});

	it('rounds the deck term up, as the rulebook says', () => {
		// 44 + 18 + ceil(582/4 = 145.5) = 208 — the fractional row of the table.
		expect(winLimitFor(3, 582)).toBe(208);
	});
});

describe('market price', () => {
	it.each<[CardDefId, number]>([
		['WHEAT', 1],
		['MANGO', 2],
		['PINEAPPLE', 3],
		['TANGERINE', 5],
		['CLOUDBERRY', 8],
	])('charges %s %i coins', (id, expected) => {
		expect(marketPriceOf(CARD_DEFINITIONS[id])).toBe(expected);
	});

	it('has no price for a Class Card, which never enters the Market', () => {
		expect(marketPriceOf(CARD_DEFINITIONS.CLOUD_COVER)).toBeNull();
		expect(rarityGradeOf(CARD_DEFINITIONS.CLOUD_COVER)).toBe(0);
	});
});

describe('garden bed bonuses', () => {
	it('gives a Raised Bed +2 Crop Value from Rare upwards only', () => {
		expect(bedCropValueBonus('RAISED', CROP_DEFINITIONS.PINEAPPLE)).toBe(2);
		expect(bedCropValueBonus('RAISED', CROP_DEFINITIONS.CLOUDBERRY)).toBe(2);
		expect(bedCropValueBonus('RAISED', CROP_DEFINITIONS.WHEAT)).toBe(0);
		expect(bedCropValueBonus('RAISED', CROP_DEFINITIONS.MANGO)).toBe(0);
	});

	it('gives colored beds +1 to their own color only', () => {
		expect(bedCropValueBonus('TRELLIS', CROP_DEFINITIONS.WHEAT)).toBe(1); // Yellow
		expect(bedCropValueBonus('TRELLIS', CROP_DEFINITIONS.CHERRY)).toBe(0); // Red
		expect(bedCropValueBonus('ROTATIONAL', CROP_DEFINITIONS.CHERRY)).toBe(1);
		expect(bedCropValueBonus('VERTICAL', CROP_DEFINITIONS.CABBAGE)).toBe(1); // Green
	});

	it('gives a Common Bed nothing', () => {
		expect(bedCropValueBonus('COMMON', CROP_DEFINITIONS.CLOUDBERRY)).toBe(0);
		expect(plantedCropValue(21, CROP_DEFINITIONS.CLOUDBERRY, 'COMMON')).toBe(21);
	});

	it('adds the bed bonus to the card value when planting', () => {
		// A Cloudberry (Yellow, Mythic) in a Trellis: 21 + 1.
		expect(plantedCropValue(21, CROP_DEFINITIONS.CLOUDBERRY, 'TRELLIS')).toBe(22);
		// Card value carries modifiers from other cards, so it is an input, not a lookup.
		expect(plantedCropValue(25, CROP_DEFINITIONS.PINEAPPLE, 'RAISED')).toBe(27);
	});

	it('protects only a Greenhouse crop from targeting', () => {
		expect(isBedTargetable('GREENHOUSE')).toBe(false);
		expect(isBedTargetable('COMMON')).toBe(true);
		expect(isBedTargetable('HYDROPONIC')).toBe(true);
	});
});

describe('reap timer', () => {
	it.each<[CropId, number]>([
		['WHEAT', 1],
		['MANGO', 2],
		['PINEAPPLE', 3],
		['TANGERINE', 4],
		['CLOUDBERRY', 5],
	])('starts %s at %i turns in a Common Bed', (id, expected) => {
		expect(plantedReapTimer(CROP_DEFINITIONS[id], 'COMMON')).toBe(expected);
	});

	it('shortens Rare and better by one turn in a Hydroponic', () => {
		expect(plantedReapTimer(CROP_DEFINITIONS.PINEAPPLE, 'HYDROPONIC')).toBe(2);
		expect(plantedReapTimer(CROP_DEFINITIONS.CLOUDBERRY, 'HYDROPONIC')).toBe(4);
	});

	it('leaves Common and Uncommon alone in a Hydroponic', () => {
		expect(plantedReapTimer(CROP_DEFINITIONS.WHEAT, 'HYDROPONIC')).toBe(1);
		expect(plantedReapTimer(CROP_DEFINITIONS.MANGO, 'HYDROPONIC')).toBe(2);
	});
});
