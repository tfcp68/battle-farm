import { TReducerTestCase } from '../../../types';
import { TTurnPhase } from '~/src/types/fsm';
import { TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { setupFixtures } from '../../../fixtures/turnPhases/fertilize';

export const testCasesCROP_CONFIRM: Array<
	TReducerTestCase<TTurnPhase.FERTILIZE, TFertilizePhase.CROP_CONFIRM, TFertilizeAction>
> = [
	{
		msg: 'CROP_CONFIRM-->FINISHED: SKIP',
		...(() => {
			const { defaultInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.SKIP,
				TFertilizePhase.CROP_CONFIRM
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
		msg: 'CROP_CONFIRM-->IDLE CANCEL_SELECTION',
		...(() => {
			const { defaultInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.CANCEL_SELECTION,
				TFertilizePhase.CROP_CONFIRM
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
		msg: 'CROP_CONFIRM-->CROP_CONFIRM: RESET ignored',
		...(() => {
			const { defaultInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.RESET,
				TFertilizePhase.CROP_CONFIRM
			);
			return {
				input: defaultInput,
				output: originalContext,
			};
		})(),
	},
	{
		msg: 'CROP_CONFIRM-->CROP_CONFIRM: CANCEL_SELECTION ignored',
		...(() => {
			const { defaultInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.CANCEL_SELECTION,
				TFertilizePhase.CROP_CONFIRM
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
		msg: 'CROP_CONFIRM-->CROP_CONFIRM: CHOOSE_CROP (index)',
		...(() => {
			const { defaultInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.SELECT_CROP,
				TFertilizePhase.CROP_CONFIRM
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					subPhase: TFertilizePhase.CROP_CONFIRM,
				}),
			};
		})(),
	},
	{
		msg: 'CROP_CONFIRM-->IDLE: FERTILIZE (index)',
		...(() => {
			const { defaultInput, originalContext } = setupFixtures(
				TTurnPhase.FERTILIZE,
				TFertilizeAction.FERTILIZE,
				TFertilizePhase.CROP_CONFIRM
			);
			return {
				input: defaultInput,
				output: Object.assign({}, originalContext, {
					context: {
						index: defaultInput[0].payload?.index,
					},
					subPhase: TFertilizePhase.IDLE,
				}),
			};
		})(),
	},
];
