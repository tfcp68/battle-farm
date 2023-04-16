import { TTargetModeContext } from '~/src/types/fsm/slices/target';
import { TCrop } from '~/src/types/serializables/crops';

export enum THarvestPhase {
	IDLE,
	HARVESTING,
	EFFECT_TARGETING,
	EFFECT_APPLIANCE,
	FINISHED,
}

export enum THarvestAction {
	RESET,
	HARVEST,
	CROP_HARVESTED,
	EFFECT_APPLIED,
	SKIP,
}

export type THarvestContext<T extends THarvestPhase> = T extends THarvestPhase.EFFECT_TARGETING
	? TTargetModeContext<any>
	: never;

export type THarvestPayload<T extends THarvestAction> = T extends THarvestAction.CROP_HARVESTED
	? { crop: TCrop; targetContext?: TTargetModeContext<any> }
	: T extends THarvestAction.EFFECT_APPLIED
	? { crop: TCrop }
	: never;
