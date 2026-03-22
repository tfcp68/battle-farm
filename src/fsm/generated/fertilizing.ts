
			import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, internalFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core';

			export const statesDictionary = {
  "~~~START~~~": 74979334,
  "IDLE": 2242516,
  "CROP_SELECTION": 1365195389,
  "FINISHED": 108966002,
  "CROP_CONFIRM": 1557674993,
  "CROP_FERTILIZED": 90070211,
  "EFFECT_TARGETING": 1703618403,
  "EFFECT_APPLIANCE": 429136991,
  "~~~END~~~": 1644281759
}
export const actionsDictionary = {
  "RESET": 77866287,
  "START_FERTILIZE": 687424813,
  "HOVER": 68931868,
  "SKIP": 2547071,
  "CHOOSE_CROP": 500938680,
  "FINISHED, ~~~END~~~, 17": 788972843,
  "CANCEL_SELECTION": 1167674855,
  "FERTILIZE": 262528656,
  "APPLY_EFFECT": 256469922
}
export const eventDictionary = {
  "disableTargetMode": 655528996,
  "startFertilize": 1416558702,
  "enableTargetMode": 251799735,
  "forceEndPhase": 223655275,
  "cropFertilized": 1211148900,
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
			event: eventDictionary["disableTargetMode"],
			meta: {
				
			}
		},
{
			event: eventDictionary["startFertilize"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);
eventAdapter.addEventEmitter(
				statesDictionary["CROP_SELECTION"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["enableTargetMode"],
			meta: {
				CROP_OWN: (function(){
			const boundValue = (function(){
						if(context !== null && context['CROP_OWN'] !== undefined && context['CROP_OWN'] !== null) {
							return context['CROP_OWN']
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
				statesDictionary["FINISHED"], 
				({ state, context }) => {
		const eventsToEmit = [
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
				statesDictionary["CROP_CONFIRM"], 
				({ state, context }) => {
		const eventsToEmit = [
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
				statesDictionary["CROP_FERTILIZED"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["cropFertilized"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);
eventAdapter.addEventEmitter(
				statesDictionary["EFFECT_TARGETING"], 
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
				statesDictionary["EFFECT_APPLIANCE"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["disableTargetMode"],
			meta: {
				
			}
		},
{
			event: eventDictionary["applyEffect"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);


eventAdapter.addEventListener(
        eventDictionary["startFertilize"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["START_FERTILIZE"],
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
        eventDictionary["cropFertilized"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["FERTILIZE"],
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
        eventDictionary["applyEffect"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["EFFECT_APPLIED"],
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
  "START_FERTILIZE": "START_FERTILIZE",
  "HOVER": "HOVER",
  "SKIP": "SKIP",
  "CHOOSE_CROP": "CHOOSE_CROP",
  "FINISHED, ~~~END~~~, 17": "FINISHED, ~~~END~~~, 17",
  "CANCEL_SELECTION": "CANCEL_SELECTION",
  "FERTILIZE": "FERTILIZE",
  "APPLY_EFFECT": "APPLY_EFFECT"
}
			const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "IDLE": "IDLE",
  "CROP_SELECTION": "CROP_SELECTION",
  "FINISHED": "FINISHED",
  "CROP_CONFIRM": "CROP_CONFIRM",
  "CROP_FERTILIZED": "CROP_FERTILIZED",
  "EFFECT_TARGETING": "EFFECT_TARGETING",
  "EFFECT_APPLIANCE": "EFFECT_APPLIANCE",
  "~~~END~~~": "~~~END~~~"
}
			const byPassedStates = new Set([])
			export type TActionsFertilizingAutomata = keyof typeof actionsMap;
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
	1365195389: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	108966002: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1557674993: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	90070211: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1703618403: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	429136991: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1644281759: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			}
	}
			const predicates = {
		2242516: { 687424813: (prevContext, payload, functionDictionary) => {
		
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
			return 1365195389;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
		return null;
	} },
90070211: { 262528656: (prevContext, payload, functionDictionary) => {
		
					const state1 = (function(){
						const cond1 = true;
const cond2 = true;

		if(cond1 === true && cond2 === true) {
			return 108966002;
		}
		else return undefined;
					})();
					if(state1) return state1;
			
					const state2 = (function(){
						const cond1 = true;
const cond2 = true;

		if(cond1 === true && cond2 === true) {
			return 1365195389;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
					const state3 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1703618403;
		}
		else return undefined;
					})();
					if(state3) return state3;
			
		return null;
	} },
429136991: { 256469922: (prevContext, payload, functionDictionary) => {
		
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
			return 1365195389;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
		return null;
	} },
1703618403: { 1167674855: (prevContext, payload, functionDictionary) => {
		
					const state1 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1365195389;
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
				77866287: {
					state: [2242516]
				}
			,

				687424813: {
					state: [1365195389,108966002],
predicate: predicates[2242516][687424813]
				}
			
	},
	1365195389: {
				2547071: {
					state: [108966002]
				}
			,

				68931868: {
					state: [1365195389]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				500938680: {
					state: [1557674993]
				}
			
	},
	1557674993: {
				2547071: {
					state: [108966002]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				262528656: {
					state: [90070211]
				}
			,

				1167674855: {
					state: [1365195389]
				}
			
	},
	90070211: {
				77866287: {
					state: [2242516]
				}
			,

				262528656: {
					state: [1703618403,1365195389,108966002],
predicate: predicates[90070211][262528656]
				}
			
	},
	1703618403: {
				2547071: {
					state: [108966002]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				256469922: {
					state: [429136991]
				}
			,

				1167674855: {
					state: [108966002,1365195389],
predicate: predicates[1703618403][1167674855]
				}
			
	},
	429136991: {
				77866287: {
					state: [2242516]
				}
			,

				256469922: {
					state: [1365195389,108966002],
predicate: predicates[429136991][256469922]
				}
			
	},
	108966002: {
				77866287: {
					state: [2242516]
				}
			,

				788972843: {
					state: [1644281759]
				}
			
	},}
			
export class FertilizingAutomata extends GenericAutomata {

    static id = 'FertilizingAutomata_1774195154746';
    static actions = actionsMap;
    static states = statesMap;
    static getState = (state: keyof typeof statesMap) => statesDictionary[state];
    static hasState = (instance: FertilizingAutomata, state: keyof typeof FertilizingAutomata.states) => instance.state === FertilizingAutomata.getState(state);
    static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
    static createAction = (action: keyof typeof actionsMap, payload:any) => {
		const actionId = FertilizingAutomata.getAction(action);
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

export default FertilizingAutomata;
			const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;
			const internals = {
	...internalFunctions,
	"currentStateId": internalFunctions.currentStateId(FertilizingAutomata),
	"currentStateName": internalFunctions.currentStateName(FertilizingAutomata, statesDictionary),
	"currentActionId": internalFunctions.currentActionId(FertilizingAutomata),
	"currentActionName": internalFunctions.currentActionName(FertilizingAutomata, actionsDictionary),
	"currentCycle": internalFunctions.currentCycle(FertilizingAutomata),
	"currentEpoch": getEpoch,
}
			functionDictionary.register(internals);
			functionDictionary.register(builtInFunctions);
		