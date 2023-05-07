import { TTurnBasedReducer, TTurnPhase } from '~/src/types/fsm';
import { CONTEXT_FERTILIZE, TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { isFertilizeAction, isFertilizeSubphase } from '~/src/types/guards/turnPhases';

export const reducer_Fertilize_IDLE: TTurnBasedReducer<TTurnPhase.FERTILIZE, TFertilizePhase.IDLE> = (params) => {
	const { subPhase, context = CONTEXT_FERTILIZE, payload, action } = params;
	if (!isFertilizeAction()(action)) throw new Error(`Invalid action: ${action}`);
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
		case TFertilizeAction.SELECT_CROP:
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
	const { action, context, subPhase } = params;
	if (!isFertilizeAction()(action)) throw new Error(`Invalid action: ${action}`);
	switch (action) {
		case TFertilizeAction.RESET:
			return {
				subPhase: TFertilizePhase.IDLE,
				context,
			};
		default:
			return {
				context,
				subPhase,
			};
	}
};
export const reducer_Fertilize_CROP_CONFIRM: TTurnBasedReducer<TTurnPhase.FERTILIZE, TFertilizePhase.CROP_CONFIRM> = (
	params
) => {
	const { subPhase, context = CONTEXT_FERTILIZE, payload, action } = params;
	if (!isFertilizeAction()(action)) throw new Error(`Invalid action: ${action}`);
	if (subPhase !== TFertilizePhase.CROP_CONFIRM)
		throw new Error(`Fertilize/CROP_CONFIRM reducer is called in invalid state: ${subPhase}`);
	switch (action) {
		case TFertilizeAction.SKIP:
			return {
				subPhase: TFertilizePhase.FINISHED,
				context: null,
			};
		case TFertilizeAction.CANCEL_SELECTION:
			return {
				subPhase: TFertilizePhase.IDLE,
				context,
			};
		case TFertilizeAction.FERTILIZE:
			if (!payload) throw new Error(`Invalid FERTILIZE_ACTION payload: ${payload}`);
			return {
				subPhase: TFertilizePhase.IDLE,
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

/**
 * Reducer that does not mutate incoming state+context
 * @param params { subPhase, context, action, payload}
 */
const defaultReducer: TTurnBasedReducer<TTurnPhase.FERTILIZE> = (params) => {
	const { subPhase, context = CONTEXT_FERTILIZE, payload, action } = params;
	if (!isFertilizeAction()(action)) throw new Error(`Invalid action: ${action}`);
	return {
		subPhase,
		context,
	};
};

export const reducersMap: {
	[T in TFertilizePhase]: TTurnBasedReducer<TTurnPhase.FERTILIZE, T>;
} = {
	[TFertilizePhase.IDLE]: reducer_Fertilize_IDLE,
	[TFertilizePhase.CROP_CONFIRM]: reducer_Fertilize_CROP_CONFIRM,
	[TFertilizePhase.FINISHED]: reducer_Fertilize_FINISHED,
	// @TODO
	[TFertilizePhase.CROP_SELECTION]: defaultReducer,
	[TFertilizePhase.EFFECT_APPLIANCE]: defaultReducer,
	[TFertilizePhase.EFFECT_TARGETING]: defaultReducer,
	[TFertilizePhase.CROP_FERTILIZED]: defaultReducer,
};
export const getFertilizeReducer = <T extends TFertilizePhase>(p: T): TTurnBasedReducer<TTurnPhase.FERTILIZE, T> =>
	reducersMap[p];

export const turnPhaseReducer_Fertilize: TTurnBasedReducer<TTurnPhase.FERTILIZE> = (params) => {
	const { context, payload = null, action = null, subPhase } = params;
	if (!isFertilizeAction()(action)) throw new Error(`Invalid action: ${JSON.stringify(params)}`);
	if (!isFertilizeSubphase()(subPhase)) throw new Error(`Invalid phase: ${JSON.stringify(params)}`);
	if (undefined === context) throw new Error(`Missing turn context: ${JSON.stringify(params)}`);
	if (undefined === payload) throw new Error(`Missing payload: ${JSON.stringify(params)}`);

	const reducer = getFertilizeReducer(subPhase);
	if (!reducer)
		return {
			subPhase,
			context,
		};
	return reducer(params);
};
