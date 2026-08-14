import { describe, expect, it } from '@jest/globals';
import {
	ACTION_DEFINITIONS,
	ACTION_IDS,
	CARD_DEF_IDS,
	CARD_DEFINITIONS,
	CLASS_DEFINITIONS,
	CROP_DEFINITIONS,
	CROP_IDS,
	DECK_SIZE,
	DECK_TOTAL_CROP_VALUE,
	isCropDefinition,
	PLAYER_CLASS_IDS,
	RARITIES,
} from '~/entities/game';

/**
 * The rulebook states its totals independently of the per-card tables, which
 * makes them a checksum: if a quantity or a value was mistyped while
 * transcribing `docs/rules.md`, one of these totals stops matching.
 */
describe('deck composition matches the rulebook totals', () => {
	it('holds 204 cards', () => {
		expect(DECK_SIZE).toBe(204);
	});

	it('holds 105 Crop Cards', () => {
		const cropCards = CROP_IDS.reduce((total, id) => total + CROP_DEFINITIONS[id].deckCount, 0);
		expect(cropCards).toBe(105);
	});

	it('holds 99 Action Cards', () => {
		const actionCards = ACTION_IDS.reduce((total, id) => total + ACTION_DEFINITIONS[id].deckCount, 0);
		expect(actionCards).toBe(99);
	});

	it('holds 582 total Crop Value, the term the Win Limit formula uses', () => {
		expect(DECK_TOTAL_CROP_VALUE).toBe(582);
	});

	it('counts per rarity as the rulebook lists them', () => {
		const perRarity = Object.fromEntries(RARITIES.map((rarity) => [rarity, 0])) as Record<string, number>;
		for (const id of CARD_DEF_IDS) {
			const def = CARD_DEFINITIONS[id];
			if (def.rarity === null) continue;
			perRarity[def.rarity] += def.deckCount;
		}
		// Crops: 8/6/4/2/1 per kind × 6/6/3/3/3 kinds. Actions: 6/4/3/2/1 × 7/6/6/5/5 kinds.
		expect(perRarity).toEqual({
			COMMON: 48 + 42,
			UNCOMMON: 36 + 24,
			RARE: 12 + 18,
			EPIC: 6 + 10,
			MYTHIC: 3 + 5,
		});
	});
});

describe('card definitions', () => {
	it('gives every crop a color, a rarity and an ability', () => {
		for (const id of CROP_IDS) {
			const def = CROP_DEFINITIONS[id];
			expect(def.color).toBeTruthy();
			expect(def.rarity).toBeTruthy();
			expect(def.ability.key).toBeTruthy();
			expect(def.ability.triggers.length).toBeGreaterThan(0);
			expect(def.ability.text).toBeTruthy();
		}
	});

	it('keys every definition by its own id', () => {
		for (const id of CARD_DEF_IDS) {
			expect(CARD_DEFINITIONS[id].id).toBe(id);
		}
	});

	it('gives every crop ability a distinct key, so the Effect Matrix cannot collide', () => {
		const keys = CROP_IDS.map((id) => CROP_DEFINITIONS[id].ability.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('keeps Class Cards out of the deck and off the rarity ladder', () => {
		const classCards = ACTION_IDS.filter((id) => ACTION_DEFINITIONS[id].isClassCard);
		expect(classCards).toHaveLength(6);
		for (const id of classCards) {
			expect(ACTION_DEFINITIONS[id].deckCount).toBe(0);
			expect(ACTION_DEFINITIONS[id].rarity).toBeNull();
		}
	});

	it('narrows a definition by its kind', () => {
		expect(isCropDefinition(CARD_DEFINITIONS.WHEAT)).toBe(true);
		expect(isCropDefinition(CARD_DEFINITIONS.LUCKY_FIND)).toBe(false);
	});
});

describe('classes', () => {
	it('has one class per Class Card, and every card exists', () => {
		expect(PLAYER_CLASS_IDS).toHaveLength(6);
		const cardIds = PLAYER_CLASS_IDS.map((id) => CLASS_DEFINITIONS[id].classCardId);
		expect(new Set(cardIds).size).toBe(6);
		for (const cardId of cardIds) {
			expect(ACTION_DEFINITIONS[cardId].isClassCard).toBe(true);
		}
	});

	it('starts every class with exactly one Common Bed', () => {
		for (const id of PLAYER_CLASS_IDS) {
			const commons = CLASS_DEFINITIONS[id].beds.filter((bed) => bed === 'COMMON');
			expect(commons).toHaveLength(1);
		}
	});

	it('gives Master Gardener the extra bed its bonus promises', () => {
		expect(CLASS_DEFINITIONS.MASTER_GARDENER.beds).toHaveLength(4);
		for (const id of PLAYER_CLASS_IDS.filter((classId) => classId !== 'MASTER_GARDENER')) {
			expect(CLASS_DEFINITIONS[id].beds).toHaveLength(3);
		}
	});
});
