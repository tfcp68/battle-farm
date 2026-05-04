/* eslint-disable */
// @ts-nocheck


			import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, internalFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core';

			export const statesDictionary = {
  "~~~START~~~": 74979334,
  "IN_MENU": 1608537031,
  "CREATING_GAME": 305141320,
  "IN_LOBBY": 1674321948,
  "GAME_JOIN": 477957801,
  "GAME_JOIN_PENDING": 1611700593
}
export const actionsDictionary = {
  "RESET": 77866287,
  "CREATE_LOBBY": 810299059,
  "SELECT": 1852692228,
  "JOIN_GAME": 1973300761,
  "[-]": 88939,
  "JOINING_GAME": 1033368953,
  "ENTER_GAME_ID": 2112211457,
  "LOBBY_JOINED": 1319183374,
  "ERROR": 66247144
}
export const eventDictionary = {
  "request_accepted": 1109700777,
  "lobby_created": 1462619007
}
GlobalEventDictionary.addEvents({
				keys: Object.keys(eventDictionary).filter(e => GlobalEventDictionary.getEventValues({ keys: [e] })[0] == null)
			 });
export const functionDictionary = new FunctionDictionary();
			const eventAdapter = new AutomataEventAdapter();


eventAdapter.addEventEmitter(
				statesDictionary["CREATING_GAME"], 
				({ state, context }) => {
		const eventsToEmit = [
			{
			event: eventDictionary["lobby_created"],
			meta: {
				gameId: (function(){
			const boundValue = (function(){
						if(context !== null && context['gameId'] !== undefined && context['gameId'] !== null) {
							return context['gameId']
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



eventAdapter.addEventListener(
        eventDictionary["request_accepted"], 
        ({ event, meta }) => {

		return {
			action: actionsDictionary["LOBBY_JOINED"],
			payload: {
				gameId: (function(){
			const boundValue = (function(){
						if(meta !== null && meta['gameId'] !== undefined && meta['gameId'] !== null) {
							return meta['gameId']
						}
							else {
								return null
							}
					}())

			return boundValue

		}())
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
  "CREATE_LOBBY": "CREATE_LOBBY",
  "SELECT": "SELECT",
  "JOIN_GAME": "JOIN_GAME",
  "[-]": "[-]",
  "JOINING_GAME": "JOINING_GAME",
  "ENTER_GAME_ID": "ENTER_GAME_ID",
  "LOBBY_JOINED": "LOBBY_JOINED",
  "ERROR": "ERROR"
}
			const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "IN_MENU": "IN_MENU",
  "CREATING_GAME": "CREATING_GAME",
  "IN_LOBBY": "IN_LOBBY",
  "GAME_JOIN": "GAME_JOIN",
  "GAME_JOIN_PENDING": "GAME_JOIN_PENDING"
}
			const byPassedStates = new Set([305141320])
			export type TActionsWindowMenuAutomata = keyof typeof actionsMap;
			const getDefaultContext = (prevContext, payload) => {
				const ctx = {selectedIndex: (function(){
						if(prevContext !== null && prevContext['selectedIndex'] !== undefined && prevContext['selectedIndex'] !== null) {
							return prevContext['selectedIndex']
						}
							else {
								return -1
							}
					}())}
				return  Object.assign({}, prevContext, ctx);
			}
			
			const reducer = {
		74979334: (prevContext, payload, functionDictionary, automata) => {

				return {selectedIndex: (function(){
						if(prevContext !== null && prevContext['selectedIndex'] !== undefined && prevContext['selectedIndex'] !== null) {
							return prevContext['selectedIndex']
						}
							else {
								return -1
							}
					}())}
			},
	1608537031: (prevContext, payload, functionDictionary, automata) => {

				return {selectedIndex: (function(){
			const boundValue = (function(){
						return functionDictionary.get('coalesce')((function(){
						if(payload !== null && payload['index'] !== undefined && payload['index'] !== null) {
							return payload['index']
						}
							else {
								return null
							}
					}()),(function(){
						if(prevContext !== null && prevContext['selectedIndex'] !== undefined && prevContext['selectedIndex'] !== null) {
							return prevContext['selectedIndex']
						}
							else {
								return null
							}
					}()))
					}())

			return boundValue

		}())}
			},
	305141320: (prevContext, payload, functionDictionary, automata) => {

				return {gameId: (function(){
			const boundValue = (function(){
						if(payload !== null && payload['gameId'] !== undefined && payload['gameId'] !== null) {
							return payload['gameId']
						}
							else {
								return null
							}
					}())

			return boundValue

		}())}
			},
	1674321948: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			},
	477957801: (prevContext, payload, functionDictionary, automata) => {

				return {gameId: (function(){
			const boundValue = (function(){
						return functionDictionary.get('coalesce')((function(){
						if(payload !== null && payload['gameId'] !== undefined && payload['gameId'] !== null) {
							return payload['gameId']
						}
							else {
								return null
							}
					}()),(function(){
						if(prevContext !== null && prevContext['gameId'] !== undefined && prevContext['gameId'] !== null) {
							return prevContext['gameId']
						}
							else {
								return null
							}
					}()))
					}())

			return boundValue

		}())}
			},
	1611700593: (prevContext, payload, functionDictionary, automata) => {

				return prevContext
			}
	}
			
			const actionToStateFromStateDict = {74979334: {
				77866287: {
					state: [1608537031]
				}
			
	},
	1608537031: {
				77866287: {
					state: [1608537031]
				}
			,

				810299059: {
					state: [305141320]
				}
			,

				1973300761: {
					state: [477957801]
				}
			
	},
	305141320: {
				88939: {
					state: [1674321948]
				}
			,

				77866287: {
					state: [1608537031]
				}
			
	},
	477957801: {
				77866287: {
					state: [1608537031]
				}
			,

				1033368953: {
					state: [1611700593]
				}
			,

				2112211457: {
					state: [477957801]
				}
			
	},
	1611700593: {
				66247144: {
					state: [477957801]
				}
			,

				77866287: {
					state: [1608537031]
				}
			,

				1319183374: {
					state: [1674321948]
				}
			
	},}
			
export class WindowMenuAutomata extends GenericAutomata {

    static id = 'WindowMenuAutomata_1767612819393';
    static actions = actionsMap;
    static states = statesMap;
    static getState = (state: keyof typeof statesMap) => statesDictionary[state];
    static hasState = (instance: WindowMenuAutomata, state: keyof typeof WindowMenuAutomata.states) => instance.state === WindowMenuAutomata.getState(state);
    static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
    static createAction = (action: keyof typeof actionsMap, payload:any) => {
		const actionId = WindowMenuAutomata.getAction(action);
		return {
			action: actionId,
			payload,
		}
	};

    constructor() {
        super(eventAdapter);
        this.init({
            state: 74979334,
            context:{"selectedIndex":null},
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

export default WindowMenuAutomata;
			const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;
			const internals = {
	...internalFunctions,
	"currentStateId": internalFunctions.currentStateId(WindowMenuAutomata),
	"currentStateName": internalFunctions.currentStateName(WindowMenuAutomata, statesDictionary),
	"currentActionId": internalFunctions.currentActionId(WindowMenuAutomata),
	"currentActionName": internalFunctions.currentActionName(WindowMenuAutomata, actionsDictionary),
	"currentCycle": internalFunctions.currentCycle(WindowMenuAutomata),
	"currentEpoch": getEpoch,
}
			functionDictionary.register(internals);
			functionDictionary.register(builtInFunctions);
		