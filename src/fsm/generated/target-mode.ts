
			import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, internalFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core';

			export const statesDictionary = {
  "~~~START~~~": 74979334,
  "FOE": 69788,
  "PLAYER": 1932423455,
  "BED_FOE": 486811582,
  "BED_OWN": 486820488,
  "BED_ANY": 486806766,
  "BED_EMPTY": 326474801,
  "CROP_FOE": 1391449491,
  "CROP_OWN": 1391440585,
  "CROP_ANY": 1391454307,
  "CARD_OWN": 775671223,
  "CARD_MARKET": 1019969611,
  "CARD_DISCARDED": 179351762,
  "CROP_COLOR": 1450893100,
  "FINISHED": 108966002,
  "~~~END~~~": 1644281759
}
export const actionsDictionary = {
  "~~~START~~~, FOE, 0": 49082254,
  "~~~START~~~, PLAYER, 1": 2134067314,
  "~~~START~~~, BED_FOE, 2": 1517943250,
  "~~~START~~~, BED_OWN, 3": 1252624603,
  "~~~START~~~, BED_ANY, 4": 1661416704,
  "~~~START~~~, BED_EMPTY, 5": 1618845440,
  "~~~START~~~, CROP_FOE, 6": 1817310215,
  "~~~START~~~, CROP_OWN, 7": 2082628862,
  "~~~START~~~, CROP_ANY, 8": 1673836761,
  "~~~START~~~, CARD_OWN, 9": 562107520,
  "~~~START~~~, CARD_MARKET, 10": 998805680,
  "~~~START~~~, CARD_DISCARDED, 11": 608715216,
  "~~~START~~~, CROP_COLOR, 12": 1223766999,
  "CHOOSE_PLAYER": 731965961,
  "HOVER": 68931868,
  "QUIT": 2497103,
  "CHOOSE_BED": 1784957383,
  "CHOOSE_CROP": 500938680,
  "CHOOSE_CARD": 500922424,
  "CHOOSE_MARKET_SLOT": 1793930745,
  "CHOOSE_COLOR": 1650862309,
  "FINISHED, ~~~END~~~, 52": 788972724
}
export const functionDictionary = new FunctionDictionary();
			const eventAdapter = new AutomataEventAdapter();
































			export function createEventBus(id, FSMs) {
const EventBus = new BasicEventBus();
EventBus.correlationId = id;
const automatas = Object.fromEntries(
		Object.entries(FSMs).map(([automataId, AutomataClass]) => {
			return [automataId, new AutomataClass()]
		})
	);
Object.entries(GlobalEventDictionary.getDictionary())
	.forEach(([eventName, eventId]) => {
	
		EventBus.subscribe(eventId, ({ event, meta }) => {

			const nextEventsToProcess = [];

			Object.values(automatas).forEach(automata => {
				const newActions = automata.eventAdapter?.handleEvent({ event, meta }) ?? [];
				for (const action of newActions) {
					automata.dispatch(action);
					const newAutomataEvents = automata.eventAdapter?.handleTransition(automata.getContext()) ?? [];
					nextEventsToProcess.push(...newAutomataEvents);
				}
			})

			EventBus.dispatch(...nextEventsToProcess);
	
			return {
				event,
				meta,
				task_id: `event_${eventName}_${eventId}`,
				result: new Promise((resolve, reject) => {
					try {
						const eventStack = EventBus.getEventStack();
						resolve(eventStack);
					} catch {
						reject(new Error('Error getting event stack'))
					}
				})
			}
		})

	});
return [EventBus, automatas];
}
			const actionsMap = {
  "~~~START~~~, FOE, 0": "~~~START~~~, FOE, 0",
  "~~~START~~~, PLAYER, 1": "~~~START~~~, PLAYER, 1",
  "~~~START~~~, BED_FOE, 2": "~~~START~~~, BED_FOE, 2",
  "~~~START~~~, BED_OWN, 3": "~~~START~~~, BED_OWN, 3",
  "~~~START~~~, BED_ANY, 4": "~~~START~~~, BED_ANY, 4",
  "~~~START~~~, BED_EMPTY, 5": "~~~START~~~, BED_EMPTY, 5",
  "~~~START~~~, CROP_FOE, 6": "~~~START~~~, CROP_FOE, 6",
  "~~~START~~~, CROP_OWN, 7": "~~~START~~~, CROP_OWN, 7",
  "~~~START~~~, CROP_ANY, 8": "~~~START~~~, CROP_ANY, 8",
  "~~~START~~~, CARD_OWN, 9": "~~~START~~~, CARD_OWN, 9",
  "~~~START~~~, CARD_MARKET, 10": "~~~START~~~, CARD_MARKET, 10",
  "~~~START~~~, CARD_DISCARDED, 11": "~~~START~~~, CARD_DISCARDED, 11",
  "~~~START~~~, CROP_COLOR, 12": "~~~START~~~, CROP_COLOR, 12",
  "CHOOSE_PLAYER": "CHOOSE_PLAYER",
  "HOVER": "HOVER",
  "QUIT": "QUIT",
  "CHOOSE_BED": "CHOOSE_BED",
  "CHOOSE_CROP": "CHOOSE_CROP",
  "CHOOSE_CARD": "CHOOSE_CARD",
  "CHOOSE_MARKET_SLOT": "CHOOSE_MARKET_SLOT",
  "CHOOSE_COLOR": "CHOOSE_COLOR",
  "FINISHED, ~~~END~~~, 52": "FINISHED, ~~~END~~~, 52"
}
			const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "FOE": "FOE",
  "PLAYER": "PLAYER",
  "BED_FOE": "BED_FOE",
  "BED_OWN": "BED_OWN",
  "BED_ANY": "BED_ANY",
  "BED_EMPTY": "BED_EMPTY",
  "CROP_FOE": "CROP_FOE",
  "CROP_OWN": "CROP_OWN",
  "CROP_ANY": "CROP_ANY",
  "CARD_OWN": "CARD_OWN",
  "CARD_MARKET": "CARD_MARKET",
  "CARD_DISCARDED": "CARD_DISCARDED",
  "CROP_COLOR": "CROP_COLOR",
  "FINISHED": "FINISHED",
  "~~~END~~~": "~~~END~~~"
}
			const byPassedStates = new Set([])
			export type TActionsTargetModeAutomata = keyof typeof actionsMap;
			const getDefaultContext = (prevContext, payload) => {
				const ctx = prevContext
				return  Object.assign({}, prevContext, ctx);
			}
			
			const reducer = {
		74979334: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	69788: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1932423455: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	486811582: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	486820488: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	486806766: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	326474801: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1391449491: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1391440585: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1391454307: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	775671223: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1019969611: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	179351762: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1450893100: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	108966002: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1644281759: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			}
	}
			
			const actionToStateFromStateDict = {74979334: {
				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	69788: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				731965961: {
					state: [108966002]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	1932423455: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				731965961: {
					state: [108966002]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	486811582: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1784957383: {
					state: [108966002]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	486820488: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1784957383: {
					state: [108966002]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	486806766: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1784957383: {
					state: [108966002]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	326474801: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1784957383: {
					state: [108966002]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	1391449491: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				500938680: {
					state: [108966002]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	1391440585: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				500938680: {
					state: [108966002]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	1391454307: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				500938680: {
					state: [108966002]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	775671223: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				500922424: {
					state: [108966002]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	179351762: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				500922424: {
					state: [108966002]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	1019969611: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1793930745: {
					state: [108966002]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	1450893100: {
				2497103: {
					state: [1644281759]
				}
			,

				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1650862309: {
					state: [108966002]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},
	108966002: {
				49082254: {
					state: [69788]
				}
			,

				562107520: {
					state: [775671223]
				}
			,

				608715216: {
					state: [179351762]
				}
			,

				788972724: {
					state: [1644281759]
				}
			,

				998805680: {
					state: [1019969611]
				}
			,

				1223766999: {
					state: [1450893100]
				}
			,

				1252624603: {
					state: [486820488]
				}
			,

				1517943250: {
					state: [486811582]
				}
			,

				1618845440: {
					state: [326474801]
				}
			,

				1661416704: {
					state: [486806766]
				}
			,

				1673836761: {
					state: [1391454307]
				}
			,

				1817310215: {
					state: [1391449491]
				}
			,

				2082628862: {
					state: [1391440585]
				}
			,

				2134067314: {
					state: [1932423455]
				}
			
	},}
			
export class TargetModeAutomata extends GenericAutomata {

    static id = 'TargetModeAutomata_1774195154847';
    static actions = actionsMap;
    static states = statesMap;
    static getState = (state: keyof typeof statesMap) => statesDictionary[state];
    static hasState = (instance: TargetModeAutomata, state: keyof typeof TargetModeAutomata.states) => instance.state === TargetModeAutomata.getState(state);
    static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
    static createAction = (action: keyof typeof actionsMap, payload:any) => {
		const actionId = TargetModeAutomata.getAction(action);
		return {
			action: actionId,
			payload,
		}
	};

    constructor() {
        super(eventAdapter);
        this.init({
            state: 74979334,
            context:{},
            rootReducer: ({ action, context, payload, state }) => {
					if (!action || payload === null) return { state, context };

					if (!this.isKeyOf(state, actionToStateFromStateDict)) throw new Error("Invalid state, maybe machine isn't running.")
					if (!this.isKeyOf(action, actionToStateFromStateDict[state])) return { state, context };

					const getNew = (action,state,context,payload) => {
						this.lastAction = action;

						const actionMove = actionToStateFromStateDict[state][action];
						const newStateObject = { state: actionMove.state[0] }
						const contextWithInitial = getDefaultContext(context,payload)


						
			if(actionMove.state.length > 1 && actionMove.predicate != null) {
				// determine new state from predicate
				const resolvedPredicateValue = actionMove.predicate(contextWithInitial, payload, functionDictionary);
				if(resolvedPredicateValue == null) return { state, context };
				newStateObject.state = resolvedPredicateValue;
			}
		

						const newState = newStateObject.state;
						const newContextFunc = reducer[newState]

						if(typeof newContextFunc !== 'function') {
							throw new Error('Invalid newContextFunc')
						}

						return {state:newState, context: newContextFunc(contextWithInitial, payload, this.getFunctionRegistry(), this)};

					}

					let localCtx = getNew(action,state,context,payload)

					while(byPassedStates.has(localCtx.state)) {
						localCtx = getNew(actionsDictionary['[-]'], localCtx.state, localCtx.context, {})
					}

					this.incrementCycle(); // increment automata local cycle counter
					incrementEpoch(); // increment global epoch counter

					return localCtx

  				},
            stateValidator: ((s) => Object.values(statesDictionary).includes(s)) as TValidator<TAutomataBaseStateType>,
            actionValidator: ((a) => Object.values(actionsDictionary).includes(a)) as TValidator<TAutomataBaseActionType>,
            functionRegistry: functionDictionary
        });
        const initReducer = reducer[this.state];
		const prev = this.getContext()?.context ?? {};
		const initContext = initReducer(prev, {}, this.getFunctionRegistry(), this);
		this.setContext({ state: this.state, context: Object.assign({}, prev, initContext) });
	
    }

    isKeyOf = ((key, obj) => key in obj) as (key: any, obj: object) => key is keyof typeof obj;
}

export default TargetModeAutomata;
			const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;
			const internals = {
	...internalFunctions,
	"currentStateId": internalFunctions.currentStateId(TargetModeAutomata),
	"currentStateName": internalFunctions.currentStateName(TargetModeAutomata, statesDictionary),
	"currentActionId": internalFunctions.currentActionId(TargetModeAutomata),
	"currentActionName": internalFunctions.currentActionName(TargetModeAutomata, actionsDictionary),
	"currentCycle": internalFunctions.currentCycle(TargetModeAutomata),
	"currentEpoch": getEpoch,
}
			functionDictionary.register(internals);
			functionDictionary.register(builtInFunctions);
		