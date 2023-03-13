import { TTargetModeContext } from '~/src/types/fsm/slices/target';
import { TCrop } from '~/src/types/serializables/crops';

export enum THarvestPhase {
	IDLE,
	TARGET_MODE,
	FINISHED,
}

export enum THarvestAction {
	RESET,
	CROP_HARVESTED,
	EFFECT_APPLIED,
	SKIP_TARGET_MODE,
}

export type THarvestContext<T extends THarvestPhase> = T extends THarvestPhase.TARGET_MODE
	? TTargetModeContext<any>
	: never;

export type THarvestPayload<T extends THarvestAction> = T extends THarvestAction.CROP_HARVESTED
	? { crop: TCrop; targetContext?: TTargetModeContext<any> }
	: T extends THarvestAction.EFFECT_APPLIED
	? { crop: TCrop }
	: never;
