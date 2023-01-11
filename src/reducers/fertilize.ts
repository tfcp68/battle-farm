import { TTurnBasedReducer, TTurnPhase } from '~/src/types/fsm';
import {
	CONTEXT_FERTILIZE,
	TFertilizeAction,
	TFertilizePhase,
} from '~/src/types/fsm/fertilize';

const reducer_Fertilize_IDLE: TTurnBasedReducer<
	TTurnPhase.FERTILIZE,
	TFertilizePhase.IDLE
> = (params) => {
	let {
		subPhase,
		game,
		context = CONTEXT_FERTILIZE,
		payload,
		action,
	} = params;
	switch (action) {
		case TFertilizeAction.HOVER:
			return {
				subPhase,
				game,
				context: {
					...context,
					index: payload.index,
				},
			};
			break;
		case TFertilizeAction.SKIP:
			game.turns.currentTurnSubPhase = TFertilizePhase.FINISHED;
			return {
				subPhase: TFertilizePhase.FINISHED,
				context: null,
				game,
			};
		case TFertilizeAction.CHOOSE_CROP:
			return {
				subPhase: TFertilizePhase.PICK_CROP,
				context: { index: payload.index },
				game,
			};
		default:
			return {
				subPhase,
				game,
				context,
			};
	}
};

export const turnPhaseReducer_Fertilize: TTurnBasedReducer<
	TTurnPhase.FERTILIZE
> = (params) => {
	let {
		subPhase = null,
		game = null,
		context = CONTEXT_FERTILIZE,
		payload = null,
		action = null,
	} = params;
	game = JSON.parse(JSON.stringify(game));
	context = JSON.parse(JSON.stringify(context));
	if (null === action)
		throw new Error(`Missing action: ${JSON.stringify(params)}`);
	if (null === subPhase)
		throw new Error(`Missing action: ${JSON.stringify(params)}`);
	if (null === game)
		throw new Error(`Missing action: ${JSON.stringify(params)}`);
	if (null === payload)
		throw new Error(`Missing action: ${JSON.stringify(params)}`);
	switch (subPhase) {
		case TFertilizePhase.IDLE:
			return reducer_Fertilize_IDLE({
				game,
				context,
				payload,
				action,
				subPhase,
			});
		default:
			return {
				subPhase,
				game,
				context,
			};
	}
};
