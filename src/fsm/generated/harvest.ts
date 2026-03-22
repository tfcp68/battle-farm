
			import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, internalFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core';

			export const statesDictionary = {
  "~~~START~~~": 74979334,
  "IDLE": 2242516,
  "FINISHED": 108966002,
  "~~~END~~~": 1644281759,
  "HARVESTING": 537422887,
  "EFFECT_TARGETING": 1703618403,
  "EFFECT_APPLIANCE": 429136991
}
export const actionsDictionary = {
  "RESET": 77866287,
  "HARVEST": 1415010121,
  "FINISHED, ~~~END~~~, 3": 667285924,
  "CROP_HARVESTED": 1385338183,
  "EFFECT_APPLIED": 1922232239,
  "SKIP": 2547071
}
export const eventDictionary = {
  "harvestNextPlant": 1865393713,
  "disableTargetMode": 655528996,
  "enableTargetMode": 251799735,
  "forceEndPhase": 223655275,
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
			event: eventDictionary["harvestNextPlant"],
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
        eventDictionary["harvestNextPlant"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["HARVEST"],
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
  "HARVEST": "HARVEST",
  "FINISHED, ~~~END~~~, 3": "FINISHED, ~~~END~~~, 3",
  "CROP_HARVESTED": "CROP_HARVESTED",
  "EFFECT_APPLIED": "EFFECT_APPLIED",
  "SKIP": "SKIP"
}
			const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "IDLE": "IDLE",
  "FINISHED": "FINISHED",
  "~~~END~~~": "~~~END~~~",
  "HARVESTING": "HARVESTING",
  "EFFECT_TARGETING": "EFFECT_TARGETING",
  "EFFECT_APPLIANCE": "EFFECT_APPLIANCE"
}
			const byPassedStates = new Set([])
			export type TActionsHarvestAutomata = keyof typeof actionsMap;
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
	1644281759: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	537422887: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1703618403: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	429136991: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			}
	}
			const predicates = {
		2242516: { 1415010121: (prevContext, payload, functionDictionary) => {
		
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
			return 537422887;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
		return null;
	} },
537422887: { 1385338183: (prevContext, payload, functionDictionary) => {
		
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
			return 1703618403;
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

				1415010121: {
					state: [108966002,537422887],
predicate: predicates[2242516][1415010121]
				}
			
	},
	108966002: {
				77866287: {
					state: [2242516]
				}
			,

				667285924: {
					state: [1644281759]
				}
			
	},
	537422887: {
				77866287: {
					state: [2242516]
				}
			,

				1385338183: {
					state: [1703618403]
				}
			
	},
	1703618403: {
				77866287: {
					state: [2242516]
				}
			,

				1922232239: {
					state: [429136991]
				}
			
	},
	429136991: {
				77866287: {
					state: [2242516]
				}
			
	},}
			
export class HarvestAutomata extends GenericAutomata {

    static id = 'HarvestAutomata_1774195154769';
    static actions = actionsMap;
    static states = statesMap;
    static getState = (state: keyof typeof statesMap) => statesDictionary[state];
    static hasState = (instance: HarvestAutomata, state: keyof typeof HarvestAutomata.states) => instance.state === HarvestAutomata.getState(state);
    static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
    static createAction = (action: keyof typeof actionsMap, payload:any) => {
		const actionId = HarvestAutomata.getAction(action);
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

export default HarvestAutomata;
			const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;
			const internals = {
	...internalFunctions,
	"currentStateId": internalFunctions.currentStateId(HarvestAutomata),
	"currentStateName": internalFunctions.currentStateName(HarvestAutomata, statesDictionary),
	"currentActionId": internalFunctions.currentActionId(HarvestAutomata),
	"currentActionName": internalFunctions.currentActionName(HarvestAutomata, actionsDictionary),
	"currentCycle": internalFunctions.currentCycle(HarvestAutomata),
	"currentEpoch": getEpoch,
}
			functionDictionary.register(internals);
			functionDictionary.register(builtInFunctions);
		