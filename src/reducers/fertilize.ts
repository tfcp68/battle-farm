import { TTurnBasedReducer, TTurnPhase } from '~/src/types/fsm';
import {
	CONTEXT_FERTILIZE,
	TFertilizeAction,
	TFertilizePhase,
} from '~/src/types/fsm/slices/fertilize';
import { isFertilizeContext } from '~/src/types/typeGuards';
import { TGameContainer } from '~/src/types/serializables/game';

const reducer_Fertilize_IDLE: TTurnBasedReducer<
	TTurnPhase.FERTILIZE,
	TFertilizePhase.IDLE
> = (params) => {
	let {
		game,
		context = { subPhase: TFertilizePhase.IDLE, ...CONTEXT_FERTILIZE },
		payload,
		action,
	} = params;
	switch (action) {
		case TFertilizeAction.HOVER:
			return {
				game,
				context: {
					...context,
					index: payload.index,
				},
			};
		case TFertilizeAction.SKIP:
			return {
				subPhase: TFertilizePhase.FINISHED,
				context: null,
				game,
			};
		case TFertilizeAction.CHOOSE_CROP:
			return {
				context: {
					index: payload.index,
					subPhase: TFertilizePhase.CROP_CONFIRM,
				},
				game,
			};
		default:
			return {
				game,
				context,
			};
	}
};

export const turnPhaseReducer_Fertilize: TTurnBasedReducer<
	TTurnPhase.FERTILIZE
> = (params) => {
	let { game = null, context, payload = null, action = null } = params;
	game = JSON.parse(JSON.stringify(game));
	context = JSON.parse(JSON.stringify(context));
	if (null === action)
		throw new Error(`Missing action: ${JSON.stringify(params)}`);
	if (null === context)
		throw new Error(`Missing turn context: ${JSON.stringify(params)}`);
	if (null === game)
		throw new Error(`Missing game: ${JSON.stringify(params)}`);
	if (null === payload)
		throw new Error(`Missing payload: ${JSON.stringify(params)}`);
	if (isFertilizeContext(TFertilizePhase.IDLE)(context))
		return reducer_Fertilize_IDLE({
			game: game as TGameContainer<
				TTurnPhase.FERTILIZE,
				TFertilizePhase.IDLE
			>,
			context,
			payload,
			action,
		});
	return {
		game,
		context,
	};
};
