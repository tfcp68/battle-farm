import { turnPhaseReducer_Fertilize } from '~/reducers/fertilize';
import { TFertilizePhase } from '~/types/fsm/slices/fertilize';
import { isFertilizeAction, isFertilizeSubphase } from '~/types/guards/turnPhases';
import { isGameEvent } from '~/types/typeGuards';
import { GenericAutomata } from '@yantrix/core';

class TurnPhaseAutomata_Fertilize extends GenericAutomata {
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
