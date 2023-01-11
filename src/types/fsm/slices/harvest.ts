import { TTargetIndex, TTrade } from '~/src/types/fsm/shared';
import { TTargetContext } from '~/src/types/fsm/slices/target';
import { TPlayerTarget } from '~/src/types/serializables/players';
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

export type THarvestContext<T extends THarvestPhase> =
	T extends THarvestPhase.TARGET_MODE ? TTargetContext<any> : never;

export type THarvestPayload<T extends THarvestAction> =
	T extends THarvestAction.CROP_HARVESTED
		? { crop: TCrop; targetContext?: TTargetContext<any> }
		: T extends THarvestAction.EFFECT_APPLIED
		? { crop: TCrop }
		: never;
