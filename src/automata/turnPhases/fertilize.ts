import GenericAutomata from '~/src/automata/Automata';
import {
	TFertilizeAction,
	TFertilizeMappedContext,
	TFertilizeMappedPayload,
	TFertilizePhase,
} from '~/src/types/fsm/slices/fertilize';
import { TGameEvent, TMappedGameEventMeta } from '~/src/types/fsm/events';
import { turnPhaseReducer_Fertilize } from '~/src/reducers/fertilize';
import { isGameEvent } from '~/src/types/typeGuards';
import {
	isFertilizeAction,
	isFertilizeSubphase,
} from '~/src/types/guards/turnPhases';

class TurnPhaseAutomata_Fertilize extends GenericAutomata<
	TFertilizePhase,
	TFertilizeAction,
	TGameEvent,
	TFertilizeMappedContext,
	TFertilizeMappedPayload,
	TMappedGameEventMeta
> {
	constructor() {
		super();
		this.init({
			state: TFertilizePhase.IDLE,
			context: { index: -1 },
			rootReducer: ({ action, context, payload, state }) => {
				if (!action || payload === null) return { state, context };
				const ctx = turnPhaseReducer_Fertilize({
					action,
					payload,
					subPhase: state ?? TFertilizePhase.IDLE,
					context: context ?? {
						index: -1,
					},
				});
				return {
					state: ctx.subPhase,
					context: ctx.context,
				};
			},
			stateValidator: isFertilizeSubphase(),
			actionValidator: isFertilizeAction(),
			eventValidator: isGameEvent,
		});
	}
}
