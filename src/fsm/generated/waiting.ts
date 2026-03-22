
			import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, internalFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core';

			export const statesDictionary = {
  "~~~START~~~": 74979334,
  "IDLE": 2242516,
  "FINISHED": 108966002,
  "HAS_TRADE": 520933569,
  "OFFER_SENT": 676291515,
  "TARGETING": 1971028113,
  "EFFECT_APPLIED": 1922232239,
  "~~~END~~~": 1644281759
}
export const actionsDictionary = {
  "RESET": 77866287,
  "SKIP": 2547071,
  "ENTER_TARGET_MODE": 465072266,
  "START_TRADE": 1546481415,
  "FINISHED, ~~~END~~~, 18": 788972842,
  "CHANGE_TRADE_OFFER": 771892878,
  "MAKE_OFFER": 1997789355,
  "CANCEL_SELECTION": 1167674855,
  "OFFER_ACCEPTED": 454845002,
  "APPLY_EFFECT": 256469922
}
export const eventDictionary = {
  "revokeTradeOffers": 814948939,
  "disableTargetMode": 655528996,
  "startTrade": 1583371742,
  "cropHarvested": 2041911016,
  "cropFertilized": 1211148900,
  "cropPlanted": 1595790234,
  "forceEndPhase": 223655275,
  "makeTradeOffer": 1715816422,
  "enableTargetMode": 251799735,
  "applyEffect": 2014731935
}
GlobalEventDictionary.addEvents({
				keys: Object.keys(eventDictionary).filter(e => GlobalEventDictionary.getEventValues({ keys: [e] })[0] == null)
			 });
export const functionDictionary = new FunctionDictionary();
			const eventAdapter = new AutomataEventAdapter();

eventAdapter.addEventEmitter(
				statesDictionary["IDLE"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["revokeTradeOffers"],
			meta: {
				
			}
		},
{
			event: eventDictionary["disableTargetMode"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);


eventAdapter.addEventEmitter(
				statesDictionary["OFFER_SENT"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["makeTradeOffer"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);
eventAdapter.addEventEmitter(
				statesDictionary["TARGETING"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["enableTargetMode"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);
eventAdapter.addEventEmitter(
				statesDictionary["EFFECT_APPLIED"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["applyEffect"],
			meta: {
				
			}
		},
{
			event: eventDictionary["disableTargetMode"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);


eventAdapter.addEventListener(
        eventDictionary["startTrade"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["START_TRADE"],
			payload: {
				
			}
		}
	}
    );
eventAdapter.addEventListener(
        eventDictionary["cropHarvested"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["ENTER_TARGET_MODE"],
			payload: {
				
			}
		}
	}
    );
eventAdapter.addEventListener(
        eventDictionary["cropFertilized"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["ENTER_TARGET_MODE"],
			payload: {
				
			}
		}
	}
    );
eventAdapter.addEventListener(
        eventDictionary["cropPlanted"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["ENTER_TARGET_MODE"],
			payload: {
				
			}
		}
	}
    );
eventAdapter.addEventListener(
        eventDictionary["forceEndPhase"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["SKIP"],
			payload: {
				
			}
		}
	}
    )




eventAdapter.addEventListener(
        eventDictionary["applyEffect"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["APPLY_EFFECT"],
			payload: {
				
			}
		}
	}
    )

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
  "RESET": "RESET",
  "SKIP": "SKIP",
  "ENTER_TARGET_MODE": "ENTER_TARGET_MODE",
  "START_TRADE": "START_TRADE",
  "FINISHED, ~~~END~~~, 18": "FINISHED, ~~~END~~~, 18",
  "CHANGE_TRADE_OFFER": "CHANGE_TRADE_OFFER",
  "MAKE_OFFER": "MAKE_OFFER",
  "CANCEL_SELECTION": "CANCEL_SELECTION",
  "OFFER_ACCEPTED": "OFFER_ACCEPTED",
  "APPLY_EFFECT": "APPLY_EFFECT"
}
			const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "IDLE": "IDLE",
  "FINISHED": "FINISHED",
  "HAS_TRADE": "HAS_TRADE",
  "OFFER_SENT": "OFFER_SENT",
  "TARGETING": "TARGETING",
  "EFFECT_APPLIED": "EFFECT_APPLIED",
  "~~~END~~~": "~~~END~~~"
}
			const byPassedStates = new Set([])
			export type TActionsWaitingAutomata = keyof typeof actionsMap;
			const getDefaultContext = (prevContext, payload) => {
				const ctx = prevContext
				return  Object.assign({}, prevContext, ctx);
			}
			
			const reducer = {
		74979334: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	2242516: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	108966002: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	520933569: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	676291515: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1971028113: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1922232239: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1644281759: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			}
	}
			const predicates = {
		2242516: { 465072266: (prevContext, payload, functionDictionary) => {
		
					const state1 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 2242516;
		}
		else return undefined;
					})();
					if(state1) return state1;
			
					const state2 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1971028113;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
		return null;
	},
1546481415: (prevContext, payload, functionDictionary) => {
		
					const state1 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 520933569;
		}
		else return undefined;
					})();
					if(state1) return state1;
			
		return null;
	} }
	}
			const actionToStateFromStateDict = {74979334: {
				77866287: {
					state: [2242516]
				}
			
	},
	2242516: {
				2547071: {
					state: [108966002]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				465072266: {
					state: [1971028113]
				}
			,

				1546481415: {
					state: [520933569]
				}
			
	},
	520933569: {
				2547071: {
					state: [108966002]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				771892878: {
					state: [520933569]
				}
			,

				1997789355: {
					state: [676291515]
				}
			
	},
	676291515: {
				2547071: {
					state: [108966002]
				}
			,

				77866287: {
					state: [2242516]
				}
			
	},
	1971028113: {
				2547071: {
					state: [108966002]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				256469922: {
					state: [1922232239]
				}
			
	},
	1922232239: {
				77866287: {
					state: [2242516]
				}
			
	},
	108966002: {
				77866287: {
					state: [2242516]
				}
			,

				788972842: {
					state: [1644281759]
				}
			
	},}
			
export class WaitingAutomata extends GenericAutomata {

    static id = 'WaitingAutomata_1774195154864';
    static actions = actionsMap;
    static states = statesMap;
    static getState = (state: keyof typeof statesMap) => statesDictionary[state];
    static hasState = (instance: WaitingAutomata, state: keyof typeof WaitingAutomata.states) => instance.state === WaitingAutomata.getState(state);
    static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
    static createAction = (action: keyof typeof actionsMap, payload:any) => {
		const actionId = WaitingAutomata.getAction(action);
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

export default WaitingAutomata;
			const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;
			const internals = {
	...internalFunctions,
	"currentStateId": internalFunctions.currentStateId(WaitingAutomata),
	"currentStateName": internalFunctions.currentStateName(WaitingAutomata, statesDictionary),
	"currentActionId": internalFunctions.currentActionId(WaitingAutomata),
	"currentActionName": internalFunctions.currentActionName(WaitingAutomata, actionsDictionary),
	"currentCycle": internalFunctions.currentCycle(WaitingAutomata),
	"currentEpoch": getEpoch,
}
			functionDictionary.register(internals);
			functionDictionary.register(builtInFunctions);
		