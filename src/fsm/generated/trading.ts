
			import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, internalFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core';

			export const statesDictionary = {
  "~~~START~~~": 74979334,
  "IDLE": 2242516,
  "COLLECT": 1667427594,
  "FINISHED": 108966002,
  "OFFERS_WAITING": 1930913669,
  "OFFERS_CHOOSING": 1317322428,
  "OFFER_ACCEPTED": 454845002,
  "~~~END~~~": 1644281759
}
export const actionsDictionary = {
  "RESET": 77866287,
  "START_COLLECT": 2126773773,
  "HOVER": 68931868,
  "ADD_CARD_TO_TRADE": 534112145,
  "REMOVE_CARD_FROM_TRADE": 1818192061,
  "SKIP": 2547071,
  "SEND_TRADE": 2065211955,
  "FINISHED, ~~~END~~~, 15": 788972845,
  "GATHER_OFFERS": 317763675,
  "ACCEPT_OFFER": 1243629637
}
export const eventDictionary = {
  "startTradeCollection": 452620896,
  "enableTargetMode": 251799735,
  "startTrade": 1583371742,
  "disableTargetMode": 655528996,
  "tradeOffersGathered": 1874421013,
  "forceEndPhase": 223655275,
  "completeTrade": 174762923
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
			event: eventDictionary["startTradeCollection"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);
eventAdapter.addEventEmitter(
				statesDictionary["COLLECT"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["enableTargetMode"],
			meta: {
				CARD_OWN: (function(){
			const boundValue = (function(){
						if(context !== null && context['CARD_OWN'] !== undefined && context['CARD_OWN'] !== null) {
							return context['CARD_OWN']
						}
							else {
								return null
							}
					}())

			return boundValue

		}())
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);

eventAdapter.addEventEmitter(
				statesDictionary["OFFERS_WAITING"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["startTrade"],
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
				statesDictionary["OFFER_ACCEPTED"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["completeTrade"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);


eventAdapter.addEventListener(
        eventDictionary["startTradeCollection"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["START_COLLECT"],
			payload: {
				
			}
		}
	}
    )


eventAdapter.addEventListener(
        eventDictionary["tradeOffersGathered"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["GATHER_OFFERS"],
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
        eventDictionary["completeTrade"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["ACCEPT_OFFER"],
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
  "START_COLLECT": "START_COLLECT",
  "HOVER": "HOVER",
  "ADD_CARD_TO_TRADE": "ADD_CARD_TO_TRADE",
  "REMOVE_CARD_FROM_TRADE": "REMOVE_CARD_FROM_TRADE",
  "SKIP": "SKIP",
  "SEND_TRADE": "SEND_TRADE",
  "FINISHED, ~~~END~~~, 15": "FINISHED, ~~~END~~~, 15",
  "GATHER_OFFERS": "GATHER_OFFERS",
  "ACCEPT_OFFER": "ACCEPT_OFFER"
}
			const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "IDLE": "IDLE",
  "COLLECT": "COLLECT",
  "FINISHED": "FINISHED",
  "OFFERS_WAITING": "OFFERS_WAITING",
  "OFFERS_CHOOSING": "OFFERS_CHOOSING",
  "OFFER_ACCEPTED": "OFFER_ACCEPTED",
  "~~~END~~~": "~~~END~~~"
}
			const byPassedStates = new Set([])
			export type TActionsTradingAutomata = keyof typeof actionsMap;
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
	1667427594: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	108966002: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1930913669: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1317322428: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	454845002: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1644281759: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			}
	}
			const predicates = {
		2242516: { 2126773773: (prevContext, payload, functionDictionary) => {
		
					const state1 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 108966002;
		}
		else return undefined;
					})();
					if(state1) return state1;
			
					const state2 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1667427594;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
		return null;
	} },
1930913669: { 317763675: (prevContext, payload, functionDictionary) => {
		
					const state1 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 108966002;
		}
		else return undefined;
					})();
					if(state1) return state1;
			
					const state2 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1317322428;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
		return null;
	} }
	}
			const actionToStateFromStateDict = {74979334: {
				77866287: {
					state: [2242516]
				}
			
	},
	2242516: {
				77866287: {
					state: [2242516]
				}
			,

				2126773773: {
					state: [1667427594,108966002],
predicate: predicates[2242516][2126773773]
				}
			
	},
	1667427594: {
				2547071: {
					state: [108966002]
				}
			,

				68931868: {
					state: [1667427594]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				534112145: {
					state: [1667427594]
				}
			,

				1818192061: {
					state: [1667427594]
				}
			,

				2065211955: {
					state: [1930913669]
				}
			
	},
	1930913669: {
				77866287: {
					state: [2242516]
				}
			,

				317763675: {
					state: [1317322428,108966002],
predicate: predicates[1930913669][317763675]
				}
			
	},
	1317322428: {
				2547071: {
					state: [108966002]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				1243629637: {
					state: [454845002]
				}
			
	},
	454845002: {
				77866287: {
					state: [2242516]
				}
			,

				1243629637: {
					state: [108966002]
				}
			
	},
	108966002: {
				77866287: {
					state: [2242516]
				}
			,

				788972845: {
					state: [1644281759]
				}
			
	},}
			
export class TradingAutomata extends GenericAutomata {

    static id = 'TradingAutomata_1774195154854';
    static actions = actionsMap;
    static states = statesMap;
    static getState = (state: keyof typeof statesMap) => statesDictionary[state];
    static hasState = (instance: TradingAutomata, state: keyof typeof TradingAutomata.states) => instance.state === TradingAutomata.getState(state);
    static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
    static createAction = (action: keyof typeof actionsMap, payload:any) => {
		const actionId = TradingAutomata.getAction(action);
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

export default TradingAutomata;
			const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;
			const internals = {
	...internalFunctions,
	"currentStateId": internalFunctions.currentStateId(TradingAutomata),
	"currentStateName": internalFunctions.currentStateName(TradingAutomata, statesDictionary),
	"currentActionId": internalFunctions.currentActionId(TradingAutomata),
	"currentActionName": internalFunctions.currentActionName(TradingAutomata, actionsDictionary),
	"currentCycle": internalFunctions.currentCycle(TradingAutomata),
	"currentEpoch": getEpoch,
}
			functionDictionary.register(internals);
			functionDictionary.register(builtInFunctions);
		