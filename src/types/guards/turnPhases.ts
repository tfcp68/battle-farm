import { TTurnPhase, TTurnSubphaseAction, TTurnSubphaseContext } from '~/src/types/fsm';
import { TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { isPositiveInteger } from '~/src/types/typeGuards';

export const isFertilizeSubphase =
	<T extends TFertilizePhase>(targetSubphase: T | null = null) =>
	(currentSubphase: any): currentSubphase is T =>
		null === targetSubphase
			? Object.values(TFertilizePhase).includes(currentSubphase) && isPositiveInteger(currentSubphase)
			: currentSubphase === targetSubphase;

export const isFertilizeContext =
	<T extends TFertilizePhase>(targetSubphase: T | null) =>
	(
		currentContext: Partial<TTurnSubphaseContext<any>>
	): currentContext is TTurnSubphaseContext<TTurnPhase.FERTILIZE, T> =>
		null === targetSubphase
			? Object.values(TFertilizePhase).includes(currentContext?.subPhase) &&
			  isPositiveInteger(currentContext?.subPhase)
			: currentContext?.subPhase === targetSubphase;

export const isFertilizeAction =
	<T extends TFertilizeAction>(targetAction: T | null = null) =>
	(currentAction: any): currentAction is T =>
		null === targetAction
			? Object.values(TFertilizeAction).includes(currentAction) && isPositiveInteger(currentAction)
			: currentAction === targetAction;

export const isFertilizePayload =
	<T extends TFertilizeAction>(targetAction: T | null) =>
	(
		currentPayload: Partial<TTurnSubphaseAction<any>>
	): currentPayload is TTurnSubphaseAction<TTurnPhase.FERTILIZE, T> =>
		null === targetAction
			? Object.values(TFertilizePhase).includes(currentPayload?.action) &&
			  isPositiveInteger(currentPayload?.action)
			: currentPayload?.action === targetAction;
