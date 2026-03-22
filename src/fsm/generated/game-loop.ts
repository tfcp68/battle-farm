
			import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, internalFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core';

			export const statesDictionary = {
  "~~~START~~~": 74979334,
  "PLANNED": 224095652,
  "FINISHED": 108966002,
  "ROLLING_CHARACTERS": 1577753796,
  "ROLLING_TURN_ORDER": 1687772998,
  "SETUP": 78791261,
  "IN_PROGRESS": 604548089,
  "LAST_TURN": 534500486
}
export const actionsDictionary = {
  "RESET": 77866287,
  "END": 68795,
  "ROLL_CHARACTERS": 996160364,
  "ROLL_TURN_ORDER": 1106179566,
  "PREPARE": 399612135,
  "START": 79219778,
  "TURN_START": 1844286976,
  "TURN_PHASE_START": 838767516,
  "TURN_PHASE_END": 1457840789,
  "TURN_END": 918105593
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
  "RESET": "RESET",
  "END": "END",
  "ROLL_CHARACTERS": "ROLL_CHARACTERS",
  "ROLL_TURN_ORDER": "ROLL_TURN_ORDER",
  "PREPARE": "PREPARE",
  "START": "START",
  "TURN_START": "TURN_START",
  "TURN_PHASE_START": "TURN_PHASE_START",
  "TURN_PHASE_END": "TURN_PHASE_END",
  "TURN_END": "TURN_END"
}
			const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "PLANNED": "PLANNED",
  "FINISHED": "FINISHED",
  "ROLLING_CHARACTERS": "ROLLING_CHARACTERS",
  "ROLLING_TURN_ORDER": "ROLLING_TURN_ORDER",
  "SETUP": "SETUP",
  "IN_PROGRESS": "IN_PROGRESS",
  "LAST_TURN": "LAST_TURN"
}
			const byPassedStates = new Set([])
			export type TActionsGameLoopAutomata = keyof typeof actionsMap;
			const getDefaultContext = (prevContext, payload) => {
				const ctx = prevContext
				return  Object.assign({}, prevContext, ctx);
			}
			
			const reducer = {
		74979334: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	224095652: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	108966002: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1577753796: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1687772998: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	78791261: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	604548089: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	534500486: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			}
	}
			const predicates = {
		604548089: { 918105593: (prevContext, payload, functionDictionary) => {
		
					const state1 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 534500486;
		}
		else return undefined;
					})();
					if(state1) return state1;
			
		return null;
	} }
	}
			const actionToStateFromStateDict = {74979334: {
				77866287: {
					state: [224095652]
				}
			
	},
	224095652: {
				68795: {
					state: [108966002]
				}
			,

				77866287: {
					state: [224095652]
				}
			,

				996160364: {
					state: [1577753796]
				}
			
	},
	1577753796: {
				77866287: {
					state: [224095652]
				}
			,

				1106179566: {
					state: [1687772998]
				}
			
	},
	1687772998: {
				77866287: {
					state: [224095652]
				}
			,

				399612135: {
					state: [78791261]
				}
			
	},
	78791261: {
				77866287: {
					state: [224095652]
				}
			,

				79219778: {
					state: [604548089]
				}
			
	},
	604548089: {
				68795: {
					state: [108966002]
				}
			,

				77866287: {
					state: [224095652]
				}
			,

				838767516: {
					state: [604548089]
				}
			,

				918105593: {
					state: [604548089,534500486],
predicate: predicates[604548089][918105593]
				}
			,

				1457840789: {
					state: [604548089]
				}
			,

				1844286976: {
					state: [604548089]
				}
			
	},
	534500486: {
				77866287: {
					state: [224095652]
				}
			,

				838767516: {
					state: [534500486]
				}
			,

				918105593: {
					state: [108966002]
				}
			,

				1457840789: {
					state: [534500486]
				}
			,

				1844286976: {
					state: [534500486]
				}
			
	},}
			
export class GameLoopAutomata extends GenericAutomata {

    static id = 'GameLoopAutomata_1774195154756';
    static actions = actionsMap;
    static states = statesMap;
    static getState = (state: keyof typeof statesMap) => statesDictionary[state];
    static hasState = (instance: GameLoopAutomata, state: keyof typeof GameLoopAutomata.states) => instance.state === GameLoopAutomata.getState(state);
    static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
    static createAction = (action: keyof typeof actionsMap, payload:any) => {
		const actionId = GameLoopAutomata.getAction(action);
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

export default GameLoopAutomata;
			const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;
			const internals = {
	...internalFunctions,
	"currentStateId": internalFunctions.currentStateId(GameLoopAutomata),
	"currentStateName": internalFunctions.currentStateName(GameLoopAutomata, statesDictionary),
	"currentActionId": internalFunctions.currentActionId(GameLoopAutomata),
	"currentActionName": internalFunctions.currentActionName(GameLoopAutomata, actionsDictionary),
	"currentCycle": internalFunctions.currentCycle(GameLoopAutomata),
	"currentEpoch": getEpoch,
}
			functionDictionary.register(internals);
			functionDictionary.register(builtInFunctions);
		