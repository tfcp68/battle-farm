
			import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, internalFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core';

			export const statesDictionary = {
  "~~~START~~~": 74979334,
  "WAITING": 1834295853,
  "HARVEST": 1415010121,
  "SHOPPING": 438165864,
  "TRADE": 80083268,
  "PLAYING": 224418830,
  "FERTILIZE": 262528656,
  "CALCULATION": 1218278057,
  "~~~END~~~": 1644281759
}
export const actionsDictionary = {
  "~~~START~~~, WAITING, 0": 621625693,
  "WAITING, HARVEST, 1": 953166965,
  "HARVEST, SHOPPING, 2": 1463762887,
  "SHOPPING, TRADE, 3": 1467583063,
  "TRADE, PLAYING, 4": 1627267626,
  "PLAYING, FERTILIZE, 5": 2089409613,
  "FERTILIZE, CALCULATION, 6": 513340157,
  "CALCULATION, isLastTurn, 7": 939582953
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
  "~~~START~~~, WAITING, 0": "~~~START~~~, WAITING, 0",
  "WAITING, HARVEST, 1": "WAITING, HARVEST, 1",
  "HARVEST, SHOPPING, 2": "HARVEST, SHOPPING, 2",
  "SHOPPING, TRADE, 3": "SHOPPING, TRADE, 3",
  "TRADE, PLAYING, 4": "TRADE, PLAYING, 4",
  "PLAYING, FERTILIZE, 5": "PLAYING, FERTILIZE, 5",
  "FERTILIZE, CALCULATION, 6": "FERTILIZE, CALCULATION, 6",
  "CALCULATION, isLastTurn, 7": "CALCULATION, isLastTurn, 7"
}
			const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "WAITING": "WAITING",
  "HARVEST": "HARVEST",
  "SHOPPING": "SHOPPING",
  "TRADE": "TRADE",
  "PLAYING": "PLAYING",
  "FERTILIZE": "FERTILIZE",
  "CALCULATION": "CALCULATION",
  "~~~END~~~": "~~~END~~~"
}
			const byPassedStates = new Set([])
			export type TActionsTurnLoopAutomata = keyof typeof actionsMap;
			const getDefaultContext = (prevContext, payload) => {
				const ctx = prevContext
				return  Object.assign({}, prevContext, ctx);
			}
			
			const reducer = {
		74979334: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1834295853: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1415010121: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	438165864: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	80083268: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	224418830: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	262528656: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1218278057: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1644281759: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			}
	}
			const predicates = {
		1218278057: { 939582953: (prevContext, payload, functionDictionary) => {
		
					const state1 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1834295853;
		}
		else return undefined;
					})();
					if(state1) return state1;
			
					const state2 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1644281759;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
		return null;
	} }
	}
			const actionToStateFromStateDict = {74979334: {
				621625693: {
					state: [1834295853]
				}
			
	},
	1834295853: {
				621625693: {
					state: [1834295853]
				}
			,

				953166965: {
					state: [1415010121]
				}
			
	},
	1415010121: {
				621625693: {
					state: [1834295853]
				}
			,

				1463762887: {
					state: [438165864]
				}
			
	},
	438165864: {
				621625693: {
					state: [1834295853]
				}
			,

				1467583063: {
					state: [80083268]
				}
			
	},
	80083268: {
				621625693: {
					state: [1834295853]
				}
			,

				1627267626: {
					state: [224418830]
				}
			
	},
	224418830: {
				621625693: {
					state: [1834295853]
				}
			,

				2089409613: {
					state: [262528656]
				}
			
	},
	262528656: {
				513340157: {
					state: [1218278057]
				}
			,

				621625693: {
					state: [1834295853]
				}
			
	},
	1218278057: {
				621625693: {
					state: [1834295853]
				}
			,

				939582953: {
					state: [1644281759]
				}
			
	},}
			
export class TurnLoopAutomata extends GenericAutomata {

    static id = 'TurnLoopAutomata_1774195154858';
    static actions = actionsMap;
    static states = statesMap;
    static getState = (state: keyof typeof statesMap) => statesDictionary[state];
    static hasState = (instance: TurnLoopAutomata, state: keyof typeof TurnLoopAutomata.states) => instance.state === TurnLoopAutomata.getState(state);
    static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
    static createAction = (action: keyof typeof actionsMap, payload:any) => {
		const actionId = TurnLoopAutomata.getAction(action);
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

export default TurnLoopAutomata;
			const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;
			const internals = {
	...internalFunctions,
	"currentStateId": internalFunctions.currentStateId(TurnLoopAutomata),
	"currentStateName": internalFunctions.currentStateName(TurnLoopAutomata, statesDictionary),
	"currentActionId": internalFunctions.currentActionId(TurnLoopAutomata),
	"currentActionName": internalFunctions.currentActionName(TurnLoopAutomata, actionsDictionary),
	"currentCycle": internalFunctions.currentCycle(TurnLoopAutomata),
	"currentEpoch": getEpoch,
}
			functionDictionary.register(internals);
			functionDictionary.register(builtInFunctions);
		