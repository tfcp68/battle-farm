import { TReducerTestCase } from '../../../types';
import { TTurnPhase } from '~/src/types/fsm';
import { TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { setupFixtures } from '../../../fixtures/turnPhases/fertilize';

export const testCasesFINISHED: Array<
	TReducerTestCase<TTurnPhase.FERTILIZE, TFertilizePhase.FINISHED, TFertilizeAction>
> = [
	{
		msg: 'FINISHED-->IDLE: RESET',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					subPhase: TFertilizePhase.IDLE,
				}),
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: HOVER ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.HOVER,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: CHOOSE_CROP ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.CHOOSE_CROP,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: FERTILIZE ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.FERTILIZE,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: CANCEL_SELECTION ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.CANCEL_SELECTION,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'FINISHED-->FINISHED: SKIP ignored',
		...(() => {
			const { defaultInput, originalInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.SKIP,
				TFertilizePhase.FINISHED
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
];
