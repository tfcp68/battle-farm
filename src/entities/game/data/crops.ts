import type { EffectTrigger, TargetKind } from './effects';
import type { Rarity } from './rarity';

/**
 * Crop Cards (`docs/rules.md` → Crop Cards). 21 kinds, 105 cards, 582 total
 * `Crop Value` — all three totals are asserted in `tests/game/data.test.ts`.
 *
 * `Market Price` and `Reap Timer` are not stored here: both follow from rarity
 * (see `./rarity.ts`).
 */

export const CROP_COLORS = ['RED', 'GREEN', 'YELLOW'] as const;

export type CropColor = (typeof CROP_COLORS)[number];

export interface CropAbility {
	/** Stable id the Effect Matrix maps to a function in phase 3. */
	key: string;
	/** The name the rulebook gives the ability, for the card face. */
	name: string;
	triggers: readonly EffectTrigger[];
	target: TargetKind;
	/** Rules text — the specification the phase-3 effect must implement. */
	text: string;
}

export interface CropDefinition {
	kind: 'crop';
	id: string;
	name: string;
	color: CropColor;
	rarity: Rarity;
	/** Base `Card Value`, which becomes `Crop Value` before bed and card modifiers. */
	value: number;
	/** Copies in the standard deck. */
	deckCount: number;
	ability: CropAbility;
}

export const CROP_DEFINITIONS = {
	WHEAT: {
		kind: 'crop',
		id: 'WHEAT',
		name: 'Wheat',
		color: 'YELLOW',
		rarity: 'COMMON',
		value: 2,
		deckCount: 8,
		ability: {
			key: 'bake_it_up',
			name: 'Bake it Up',
			triggers: ['on_fertilize'],
			target: 'none',
			text: 'When fertilized, increases its Crop Value by 2.',
		},
	},
	CHERRY: {
		kind: 'crop',
		id: 'CHERRY',
		name: 'Cherry',
		color: 'RED',
		rarity: 'COMMON',
		value: 2,
		deckCount: 8,
		ability: {
			key: 'cherry_picking',
			name: 'Cherry Picking',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'When harvested, all other Common Cards in your Hand gain 1 extra Card Value.',
		},
	},
	CABBAGE: {
		kind: 'crop',
		id: 'CABBAGE',
		name: 'Cabbage',
		color: 'GREEN',
		rarity: 'COMMON',
		value: 2,
		deckCount: 8,
		ability: {
			key: 'head_of_green',
			name: 'Head of Green',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'When harvested, gain 1 Coin for every other growing Green Crop in the game.',
		},
	},
	CORN: {
		kind: 'crop',
		id: 'CORN',
		name: 'Corn',
		color: 'YELLOW',
		rarity: 'COMMON',
		value: 3,
		deckCount: 8,
		ability: {
			key: 'yellow_patch',
			name: 'Yellow Patch',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'When harvested, gain 1 Coin for every other growing Yellow Crop in the game.',
		},
	},
	CARROTS: {
		kind: 'crop',
		id: 'CARROTS',
		name: 'Carrots',
		color: 'RED',
		rarity: 'COMMON',
		value: 3,
		deckCount: 8,
		ability: {
			key: 'red_alert',
			name: 'Red Alert',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'When harvested, gain 1 Coin for every other growing Red Crop in the game.',
		},
	},
	ONION: {
		kind: 'crop',
		id: 'ONION',
		name: 'Onions',
		color: 'GREEN',
		rarity: 'COMMON',
		value: 3,
		deckCount: 8,
		ability: {
			key: 'onion_ring',
			name: 'Onion Ring',
			triggers: ['on_plant'],
			target: 'none',
			text: 'When planted, gain 1 Fertilizer for every other Onion in your Hand and 1 Coin for every Onion Crop you have growing.',
		},
	},
	MANGO: {
		kind: 'crop',
		id: 'MANGO',
		name: 'Mango',
		color: 'YELLOW',
		rarity: 'UNCOMMON',
		value: 5,
		deckCount: 6,
		ability: {
			key: 'mango_madness',
			name: 'Mango Madness',
			triggers: ['on_plant'],
			target: 'opponent',
			text: 'When planted, pick an Opponent. Per every Crop they have growing, they must swap a Card from their Hand with a random Card from the Deck.',
		},
	},
	TOMATO: {
		kind: 'crop',
		id: 'TOMATO',
		name: 'Tomato',
		color: 'RED',
		rarity: 'UNCOMMON',
		value: 5,
		deckCount: 6,
		ability: {
			key: 'catch_up',
			name: 'Catch up',
			triggers: ['passive'],
			target: 'none',
			text: 'Gains +1 Crop Value for every Opponent with more Coins than you.',
		},
	},
	POTATO: {
		kind: 'crop',
		id: 'POTATO',
		name: 'Potato',
		color: 'GREEN',
		rarity: 'UNCOMMON',
		value: 5,
		deckCount: 6,
		ability: {
			key: 'root_rot',
			name: 'Root Rot',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'When harvested, roll 1d4. If you roll 4, get a Potato Card, otherwise gain 1 Fertilizer.',
		},
	},
	MELON: {
		kind: 'crop',
		id: 'MELON',
		name: 'Melon',
		color: 'YELLOW',
		rarity: 'UNCOMMON',
		value: 6,
		deckCount: 6,
		ability: {
			key: 'melon_mania',
			name: 'Melon Mania',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'Gain 1d4 extra Coins for the 2nd and every following Melon harvested.',
		},
	},
	BEANS: {
		kind: 'crop',
		id: 'BEANS',
		name: 'Beans',
		color: 'RED',
		rarity: 'UNCOMMON',
		value: 6,
		deckCount: 6,
		ability: {
			key: 'beanstalk',
			name: 'Beanstalk',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'When harvested, swap a Card from your Hand with a random one from the Deck.',
		},
	},
	WASABI: {
		kind: 'crop',
		id: 'WASABI',
		name: 'Wasabi',
		color: 'GREEN',
		rarity: 'UNCOMMON',
		value: 6,
		deckCount: 6,
		ability: {
			key: 'radish_rally',
			name: 'Radish Rally',
			triggers: ['on_plant'],
			target: 'opponent',
			text: 'When planted, steal 1d4 Coins from a chosen Opponent, if you have another Wasabi in Hand.',
		},
	},
	PINEAPPLE: {
		kind: 'crop',
		id: 'PINEAPPLE',
		name: 'Pineapple',
		color: 'YELLOW',
		rarity: 'RARE',
		value: 9,
		deckCount: 4,
		ability: {
			key: 'pineapple_punch',
			name: 'Pineapple Punch',
			triggers: ['on_harvest'],
			target: 'any_crop',
			text: 'When harvested, destroy a Crop of your choice and return its Card to the Deck.',
		},
	},
	EGGPLANT: {
		kind: 'crop',
		id: 'EGGPLANT',
		name: 'Eggplant',
		color: 'RED',
		rarity: 'RARE',
		value: 9,
		deckCount: 4,
		ability: {
			key: 'eggplant_emoji',
			name: 'Eggplant Emoji',
			triggers: ['on_plant'],
			target: 'any_player',
			text: 'When planted, pick a Player. They lose 1 Coin per every Card in their Hand.',
		},
	},
	PEPPER: {
		kind: 'crop',
		id: 'PEPPER',
		name: 'Peppers',
		color: 'GREEN',
		rarity: 'RARE',
		value: 9,
		deckCount: 4,
		ability: {
			key: 'spicy_sprinkle',
			name: 'Spicy Sprinkle',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'When harvested, roll 1d6. That many Card Value is distributed randomly among the Crop Cards in your Hand.',
		},
	},
	TANGERINE: {
		kind: 'crop',
		id: 'TANGERINE',
		name: 'Tangerine',
		color: 'YELLOW',
		rarity: 'EPIC',
		value: 15,
		deckCount: 2,
		ability: {
			key: 'sweet_and_sour',
			name: 'Sweet and Sour',
			triggers: ['on_plant', 'on_harvest'],
			target: 'none',
			text: 'When planted and when harvested, all your other Crops gain 1 Value.',
		},
	},
	PUMPKIN: {
		kind: 'crop',
		id: 'PUMPKIN',
		name: 'Pumpkin',
		color: 'RED',
		rarity: 'EPIC',
		value: 15,
		deckCount: 2,
		ability: {
			key: 'trick_or_treat',
			name: 'Trick or Treat',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'When harvested, all Players give you 1 Coin for every Fertilizer they have.',
		},
	},
	GRAPE: {
		kind: 'crop',
		id: 'GRAPE',
		name: 'Grapes',
		color: 'GREEN',
		rarity: 'EPIC',
		value: 15,
		deckCount: 2,
		ability: {
			key: 'grapevine',
			name: 'Grapevine',
			triggers: ['on_harvest'],
			target: 'none',
			text: 'When harvested from a Common Bed or a Raised Bed, transform it into Hydroponic. Otherwise gain 4 extra Coins.',
		},
	},
	CLOUDBERRY: {
		kind: 'crop',
		id: 'CLOUDBERRY',
		name: 'Cloudberry',
		color: 'YELLOW',
		rarity: 'MYTHIC',
		value: 21,
		deckCount: 1,
		ability: {
			key: 'berry_blitz',
			name: 'Berry Blitz',
			triggers: ['on_plant'],
			target: 'none',
			text: 'When planted, the Card with the biggest Card Value in each Opponent Hand has its Card Value reduced to 1 and is returned to the Deck.',
		},
	},
	STRAWBERRY: {
		kind: 'crop',
		id: 'STRAWBERRY',
		name: 'Strawberry',
		color: 'RED',
		rarity: 'MYTHIC',
		value: 23,
		deckCount: 1,
		ability: {
			key: 'ripe_for_the_picking',
			name: 'Ripe for the Picking',
			triggers: ['on_harvest'],
			target: 'any_crop',
			text: 'When harvested, pick any other Crop on the field. Gain its Crop Value in Coins.',
		},
	},
	BLUEBERRY: {
		kind: 'crop',
		id: 'BLUEBERRY',
		name: 'Blueberry',
		color: 'GREEN',
		rarity: 'MYTHIC',
		value: 22,
		deckCount: 1,
		ability: {
			key: 'blueberry_boom',
			name: 'Blueberry Boom',
			triggers: ['on_plant'],
			target: 'any_bed',
			text: 'When planted, pick an Opponent Bed. It is downgraded to a Common Bed and its Crop, if any, is destroyed. If the Bed was a Greenhouse, the Crop is preserved.',
		},
	},
} as const satisfies Record<string, CropDefinition>;

export type CropId = keyof typeof CROP_DEFINITIONS;

export const CROP_IDS = Object.keys(CROP_DEFINITIONS) as CropId[];

/** Every ability key a Crop can carry — phase 3 maps this union to functions. */
export type CropAbilityKey = (typeof CROP_DEFINITIONS)[CropId]['ability']['key'];
