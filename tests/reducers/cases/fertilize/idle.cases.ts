import { TReducerTestCase } from '../../../types';
import { TTurnPhase } from '~/src/types/fsm';
import { TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { setupFixtures } from '../../../fixtures/turnPhases/fertilize';

export const testCasesIDLE: Array<TReducerTestCase<TTurnPhase.FERTILIZE, TFertilizePhase.IDLE, TFertilizeAction>> = [
	{
		msg: 'IDLE-->IDLE: HOVER (index)',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.HOVER,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					context: {
						...originalContext.context,
						index: originalInput[0].payload?.index,
					},
				}),
			};
		})(),
	},
	{
		msg: 'IDLE-->FINISHED: SKIP',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.SKIP,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					context: null,
					subPhase: TFertilizePhase.FINISHED,
				}),
			};
		})(),
	},
	{
		msg: 'IDLE-->CROP_CONFIRM: CHOOSE_CROP (index)',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.CHOOSE_CROP,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					context: {
						index: defaultInput[0].payload?.index,
					},
					subPhase: TFertilizePhase.CROP_CONFIRM,
				}),
			};
		})(),
	},
	{
		msg: 'IDLE-->IDLE: FERTILIZE ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.FERTILIZE,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'IDLE-->IDLE: CANCEL_SELECTION ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.CANCEL_SELECTION,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'IDLE-->IDLE: RESET ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.IDLE
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
];
