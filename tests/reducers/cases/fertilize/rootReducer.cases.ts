import { TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { TReducerTestCase } from '../../../types';
import { TTurnPhase } from '~/src/types/fsm';
import { testCasesIDLE } from './idle.cases';
import { testCasesFINISHED } from './finished.cases';
import { testCasesCROP_CONFIRM } from './crop_confirm.cases';
import { setupFixtures } from '../../../fixtures/turnPhases/fertilize';
import { isFertilizeSubphase } from '~/src/types/guards/turnPhases';

export const stateReducerCases: Partial<{
	[T in TFertilizePhase]: Array<TReducerTestCase<TTurnPhase.FERTILIZE, T, TFertilizeAction>>;
}> = {
	[TFertilizePhase.IDLE]: testCasesIDLE,
	[TFertilizePhase.FINISHED]: testCasesFINISHED,
	[TFertilizePhase.CROP_CONFIRM]: testCasesCROP_CONFIRM,
};

export const stateReducerLabels: Record<TFertilizePhase, string> = {
	[TFertilizePhase.IDLE]: 'IDLE',
	[TFertilizePhase.FINISHED]: 'FINISHED',
	[TFertilizePhase.CROP_CONFIRM]: 'CROP_CONFIRM',
	[TFertilizePhase.CROP_FERTILIZED]: 'CROP_FERTILIZED',
	[TFertilizePhase.CROP_SELECTION]: 'CROP_SELECTION',
	[TFertilizePhase.EFFECT_APPLIANCE]: 'EFFECT_APPLIANCE',
	[TFertilizePhase.EFFECT_TARGETING]: 'EFFECT_TARGETING   ',
};

export const getStateLabel = (t: any) => (isFertilizeSubphase()(t) ? stateReducerLabels[t] : '--UNKNOWN--');

export const rootReducerCases = Object.entries(stateReducerCases).reduce(
	(a, [phase, cases]) =>
		a.concat(
			...cases.map((t) => ({
				...t,
				label: parseInt(phase) as TFertilizePhase,
				numberOfFunctionCalls: 1,
			})),
			...Object.keys(stateReducerCases)
				.filter((currentPhase) => currentPhase !== phase)
				.map((t) => parseInt(t))
				.map((otherPhase) => ({
					msg: `in ${getStateLabel(parseInt(phase))} state`,
					label: otherPhase as TFertilizePhase,
					numberOfFunctionCalls: 0,
					...(() => {
						const { defaultInput, originalContext } = setupFixtures(
							TTurnPhase.FERTILIZE,
							TFertilizeAction.SKIP,
							parseInt(phase) as TFertilizePhase
						);
						return {
							input: defaultInput,
							output: originalContext,
						};
					})(),
				}))
		),
	[] as Array<TReducerTestCase<TTurnPhase.FERTILIZE, TFertilizePhase, TFertilizeAction>>
);
