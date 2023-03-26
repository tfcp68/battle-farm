import { TTurnBasedReducer, TTurnPhase } from '~/src/types/fsm';
import { CONTEXT_FERTILIZE, TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { isFertilizeAction, isFertilizeSubphase } from '~/src/types/guards/turnPhases';

export const reducer_Fertilize_IDLE: TTurnBasedReducer<TTurnPhase.FERTILIZE, TFertilizePhase.IDLE> = (params) => {
	const { subPhase, context = CONTEXT_FERTILIZE, payload, action } = params;
	if (!isFertilizeAction(action)) throw new Error(`Invalid action: ${action}`);
	if (subPhase !== TFertilizePhase.IDLE)
		throw new Error(`Fertilize/IDLE reducer is called in invalid state: ${subPhase}`);
	switch (action) {
		case TFertilizeAction.SKIP:
			return {
				subPhase: TFertilizePhase.FINISHED,
				context: null,
			};
		case TFertilizeAction.HOVER:
			if (!payload) throw new Error(`Invalid HOVER payload: ${payload}`);
			return {
				subPhase: TFertilizePhase.IDLE,
				context: {
					...context,
					index: payload?.index,
				},
			};
		case TFertilizeAction.CHOOSE_CROP:
			if (!payload) throw new Error(`Invalid CHOOSE_CROP payload: ${payload}`);
			return {
				subPhase: TFertilizePhase.CROP_CONFIRM,
				context: {
					index: payload?.index,
				},
			};
		default:
			return {
				subPhase,
				context,
			};
	}
};
export const reducer_Fertilize_FINISHED: TTurnBasedReducer<TTurnPhase.FERTILIZE, TFertilizePhase.FINISHED> = (
	params
) => {
	const { action, context } = params;
	if (!isFertilizeAction(action)) throw new Error(`Invalid action: ${action}`);
	switch (action) {
		case TFertilizeAction.RESET:
			throw new Error(`invalid  ACTION  at this stage ${action}`);
		default:
			return {
				context,
				subPhase: TFertilizePhase.FINISHED,
			};
	}
};
export const turnPhaseReducer_Fertilize: TTurnBasedReducer<TTurnPhase.FERTILIZE> = (params) => {
	const { context, payload = null, action = null, subPhase } = params;
	if (null === action) throw new Error(`Missing action: ${JSON.stringify(params)}`);
	if (undefined === context) throw new Error(`Missing turn context: ${JSON.stringify(params)}`);
	if (undefined === payload) throw new Error(`Missing payload: ${JSON.stringify(params)}`);

	if (isFertilizeSubphase(TFertilizePhase.IDLE)(subPhase))
		return reducer_Fertilize_IDLE({
			context,
			payload,
			action,
			subPhase,
		});
	if (isFertilizeSubphase(TFertilizePhase.FINISHED)(subPhase))
		return reducer_Fertilize_FINISHED({
			context: undefined as never,
			subPhase,
			action,
			payload,
		});
	return {
		subPhase,
		context,
	};
};
