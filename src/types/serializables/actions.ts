import {
	TCard,
	TCardType,
	TGenericCard,
} from '~/src/types/serializables/cards';
import { TTargetMode } from '~/src/types/fsm/slices/target';
import { TPlayer } from '~/src/types/serializables/players';
import { TBed, TCrop } from '~/src/types/serializables/crops';

export const ActionCardId = {
	GARDEN_GOURMET: 1,
	FERTILIZER_FRENZY: 2,
	RECYCLE: 3,
	LUCKY_FIND: 4,
	GREEN_DAY: 5,
	RED_HEAT: 6,
	YELLOW_GOLD: 7,
	WEED_WHACKER: 8,
	PEST_CONTROL: 9,
	SUPERNATURAL_SELECTION: 10,
	FLOWER_POWER: 11,
	FUNGUS_FLAY: 12,
	SURGING_SEEDLINGS: 13,
	THORNY_FENCE: 14,
	SOIL_ENRICHMENT: 15,
	SEED_SPROUT: 16,
	POLLEN_PARADISE: 17,
	RETRACTABLE_GREENHOUSE: 18,
	GARDEN_GNOME: 19,
	TRELLIS_BED: 20,
	VERTICAL_BED: 21,
	ROTATIONAL_BED: 22,
	WASTE_DISPOSAL: 23,
	CARTEL_AGREEMENT: 24,
	CHEMICAL_BLISS: 25,
	DROUGHT: 26,
	CLONE: 27,
	WITHER: 28,
	DEMON_OF_HARVEST: 29,
};

export type TActionId = keyof typeof ActionCardId;
export type TActionCard = TGenericCard<TCardType.ACTION>;

export type TAction = {
	target: TTargetMode;
};
