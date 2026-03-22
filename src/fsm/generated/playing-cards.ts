
			import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, internalFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core';

			export const statesDictionary = {
  "~~~START~~~": 74979334,
  "IDLE": 2242516,
  "PLAYING": 224418830,
  "FINISHED": 108966002,
  "PLANTING": 1642786409,
  "TARGETING": 1971028113,
  "CROP_PLANTED": 112676219,
  "EXECUTION": 1695619832,
  "~~~END~~~": 1644281759
}
export const actionsDictionary = {
  "RESET": 77866287,
  "START_PLAY": 1058617071,
  "HOVER_CARD": 784378963,
  "SKIP": 2547071,
  "CHOOSE_CARD": 500922424,
  "FINISHED, ~~~END~~~, 19": 788972841,
  "PLANT_CROP": 1850228740,
  "CANCEL_SELECTION": 1167674855,
  "EXECUTE_ACTION": 1085771168
}
export const eventDictionary = {
  "startPlay": 2129411402,
  "enableTargetMode": 251799735,
  "forceEndPhase": 223655275,
  "cropPlanted": 1595790234,
  "disableTargetMode": 655528996,
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
			event: eventDictionary["startPlay"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);
eventAdapter.addEventEmitter(
				statesDictionary["PLAYING"], 
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
				statesDictionary["PLANTING"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["enableTargetMode"],
			meta: {
				BED_EMPTY: (function(){
			const boundValue = (function(){
						if(context !== null && context['BED_EMPTY'] !== undefined && context['BED_EMPTY'] !== null) {
							return context['BED_EMPTY']
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
				statesDictionary["CROP_PLANTED"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["cropPlanted"],
			meta: {
				
			}
		}
		];
		
		return eventsToEmit[0];
	}
			);
eventAdapter.addEventEmitter(
				statesDictionary["EXECUTION"], 
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
        eventDictionary["startPlay"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["START_PLAY"],
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
        eventDictionary["cropPlanted"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["PLANT_CROP"],
			payload: {
				
			}
		}
	}
    )
eventAdapter.addEventListener(
        eventDictionary["applyEffect"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["EXECUTE_ACTION"],
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
  "START_PLAY": "START_PLAY",
  "HOVER_CARD": "HOVER_CARD",
  "SKIP": "SKIP",
  "CHOOSE_CARD": "CHOOSE_CARD",
  "FINISHED, ~~~END~~~, 19": "FINISHED, ~~~END~~~, 19",
  "PLANT_CROP": "PLANT_CROP",
  "CANCEL_SELECTION": "CANCEL_SELECTION",
  "EXECUTE_ACTION": "EXECUTE_ACTION"
}
			const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "IDLE": "IDLE",
  "PLAYING": "PLAYING",
  "FINISHED": "FINISHED",
  "PLANTING": "PLANTING",
  "TARGETING": "TARGETING",
  "CROP_PLANTED": "CROP_PLANTED",
  "EXECUTION": "EXECUTION",
  "~~~END~~~": "~~~END~~~"
}
			const byPassedStates = new Set([])
			export type TActionsPlayingCardsAutomata = keyof typeof actionsMap;
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
	224418830: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	108966002: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1642786409: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1971028113: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	112676219: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1695619832: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	1644281759: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			}
	}
			const predicates = {
		2242516: { 1058617071: (prevContext, payload, functionDictionary) => {
		
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
			return 224418830;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
		return null;
	} },
112676219: { 1850228740: (prevContext, payload, functionDictionary) => {
		
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
			return 224418830;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
					const state3 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1971028113;
		}
		else return undefined;
					})();
					if(state3) return state3;
			
		return null;
	} },
224418830: { 500922424: (prevContext, payload, functionDictionary) => {
		
					const state1 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1971028113;
		}
		else return undefined;
					})();
					if(state1) return state1;
			
					const state2 = (function(){
						const cond1 = true;

		if(cond1 === true) {
			return 1642786409;
		}
		else return undefined;
					})();
					if(state2) return state2;
			
		return null;
	} },
1695619832: { 1085771168: (prevContext, payload, functionDictionary) => {
		
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
			return 224418830;
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

				1058617071: {
					state: [224418830,108966002],
predicate: predicates[2242516][1058617071]
				}
			
	},
	224418830: {
				2547071: {
					state: [108966002]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				500922424: {
					state: [1642786409,1971028113],
predicate: predicates[224418830][500922424]
				}
			,

				784378963: {
					state: [224418830]
				}
			
	},
	1642786409: {
				2547071: {
					state: [108966002]
				}
			,

				77866287: {
					state: [2242516]
				}
			,

				1167674855: {
					state: [224418830]
				}
			,

				1850228740: {
					state: [112676219]
				}
			
	},
	112676219: {
				77866287: {
					state: [2242516]
				}
			,

				1850228740: {
					state: [1971028113,224418830,108966002],
predicate: predicates[112676219][1850228740]
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

				1085771168: {
					state: [1695619832]
				}
			,

				1167674855: {
					state: [224418830]
				}
			
	},
	1695619832: {
				77866287: {
					state: [2242516]
				}
			,

				1085771168: {
					state: [224418830,108966002],
predicate: predicates[1695619832][1085771168]
				}
			
	},
	108966002: {
				77866287: {
					state: [2242516]
				}
			,

				788972841: {
					state: [1644281759]
				}
			
	},}
			
export class PlayingCardsAutomata extends GenericAutomata {

    static id = 'PlayingCardsAutomata_1774195154820';
    static actions = actionsMap;
    static states = statesMap;
    static getState = (state: keyof typeof statesMap) => statesDictionary[state];
    static hasState = (instance: PlayingCardsAutomata, state: keyof typeof PlayingCardsAutomata.states) => instance.state === PlayingCardsAutomata.getState(state);
    static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
    static createAction = (action: keyof typeof actionsMap, payload:any) => {
		const actionId = PlayingCardsAutomata.getAction(action);
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

export default PlayingCardsAutomata;
			const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;
			const internals = {
	...internalFunctions,
	"currentStateId": internalFunctions.currentStateId(PlayingCardsAutomata),
	"currentStateName": internalFunctions.currentStateName(PlayingCardsAutomata, statesDictionary),
	"currentActionId": internalFunctions.currentActionId(PlayingCardsAutomata),
	"currentActionName": internalFunctions.currentActionName(PlayingCardsAutomata, actionsDictionary),
	"currentCycle": internalFunctions.currentCycle(PlayingCardsAutomata),
	"currentEpoch": getEpoch,
}
			functionDictionary.register(internals);
			functionDictionary.register(builtInFunctions);
		