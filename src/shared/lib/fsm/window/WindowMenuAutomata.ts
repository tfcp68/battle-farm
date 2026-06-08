/* eslint-disable */
// @ts-nocheck

import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core'


const predicates = {
};
export const statesDictionary = {
  "~~~START~~~": 74979334,
  "IN_MENU": 1608537031,
  "CREATING_GAME": 305141320,
  "IN_LOBBY": 1674321948,
  "GAME_JOIN": 477957801,
  "GAME_JOIN_PENDING": 1611700593
};

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
};

export const eventDictionary = {
  "menu_join_accepted": 75777988,
  "lobby_created": 1462619007
};
GlobalEventDictionary.addEvents({
  keys: Object.keys(eventDictionary).filter(e => GlobalEventDictionary.getEventValues({ keys: [e] })[0] == null)
});

export const functionDictionary = new FunctionDictionary();

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
};

const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "IN_MENU": "IN_MENU",
  "CREATING_GAME": "CREATING_GAME",
  "IN_LOBBY": "IN_LOBBY",
  "GAME_JOIN": "GAME_JOIN",
  "GAME_JOIN_PENDING": "GAME_JOIN_PENDING"
};
const actionToStateFromStateDict = {
  74979334: {
  77866287: {
  state: [1608537031]}

}

,  305141320: {
  88939: {
  state: [1674321948]}

,  77866287: {
  state: [1608537031]}

}

,  477957801: {
  77866287: {
  state: [1608537031]}

,  1033368953: {
  state: [1611700593]}

,  2112211457: {
  state: [477957801]}

}

,  1608537031: {
  77866287: {
  state: [1608537031]}

,  810299059: {
  state: [305141320]}

,  1852692228: {
  state: [1608537031]}

,  1973300761: {
  state: [477957801]}

}

,  1611700593: {
  66247144: {
  state: [477957801]}

,  77866287: {
  state: [1608537031]}

,  1319183374: {
  state: [1674321948]}

}

};


const byPassedStates = new Set([305141320]);

const epoch = { val: 1 };
const incrementEpoch = () => { epoch.val++ };
const getEpoch = () => epoch.val;

const _getCurrentTimestamp = () => {
  if (typeof process !== 'undefined' && process.hrtime?.bigint !== undefined)
    return Number(process.hrtime.bigint() / BigInt(1000));
  if (typeof performance !== 'undefined' && performance.now !== undefined)
    return Math.floor(performance.now() * 1000);
  return Date.now() * 1000;
};
const _getCurrentTime = () => new Date().toISOString();

functionDictionary.register(builtInFunctions);
type TStateId = (typeof statesDictionary)[keyof typeof statesDictionary];
type TActionId = (typeof actionsDictionary)[keyof typeof actionsDictionary];

type TAutomataContext = Record<string, unknown>;
type TAutomataPayload = Record<string, unknown> | null;
type TReducerPayload = Exclude<TAutomataPayload, null>;

type TPredicate = (
  context: TAutomataContext,
  payload: TReducerPayload,
  functionDictionary: FunctionDictionary,
) => TStateId | null;

type TTransition = {
  state: TStateId[];
  predicate?: TPredicate;
};

type TTransitions = Record<TStateId, Partial<Record<TActionId, TTransition>>>;
type TReducerFn = (
  prevContext: TAutomataContext,
  payload: TReducerPayload,
  functionDictionary: FunctionDictionary,
  automata: GenericAutomata,
) => TAutomataContext;

type TReducerMap = Partial<Record<TStateId, TReducerFn>>;

type TRootReducerInput = {
  action: TActionId | null;
  context: TAutomataContext;
  payload: TAutomataPayload;
  state: TStateId;
};

type TRootReducerOutput = {
  state: TStateId;
  context: TAutomataContext;
};

export type TActionsWindowMenuAutomata = keyof typeof actionsMap;




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
	return context['gameId'];
  }
  else {
	return null;
  }
}())


  return boundValue
}())

  },
}
    ];

    return eventsToEmit[0];
  },
);
eventAdapter.addEventListener(
  eventDictionary["menu_join_accepted"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["LOBBY_JOINED"],
      payload: {
        gameId: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['gameId'] !== undefined && meta['gameId'] !== null) {
	return meta['gameId'];
  }
  else {
	return null;
  }
}())


  return boundValue
}())

      },
    };
  },
);
export function createEventBus(id, FSMs) {
  const EventBus = new BasicEventBus();
  EventBus.correlationId = id;

  const automatas = Object.fromEntries(
  Object.entries(FSMs).map(([automataId, AutomataClass]) => {
    return [automataId, new AutomataClass()];
  }),
)

;

  const _subscriptions = [];
  Object.entries(GlobalEventDictionary.getDictionary()).forEach(([eventName, eventId]) => {
  const _handler = ({ event, meta }) => {
    const nextEventsToProcess = [];

    Object.values(automatas).forEach((automata) => {
      const newActions = automata.eventAdapter?.handleEvent({ event, meta }) ?? [];
      for (const action of newActions) {
        automata.dispatch(action);
        const newAutomataEvents = automata.eventAdapter?.handleTransition(automata.getContext()) ?? [];
        nextEventsToProcess.push(...newAutomataEvents);
      }
    });

    EventBus.dispatch(...nextEventsToProcess);

    return {
      event,
      meta,
      task_id: `event_${eventName}_${eventId}`,
      result: new Promise((resolve, reject) => {
        try {
          resolve(EventBus.getEventStack());
        } catch {
          reject(new Error('Error getting event stack'));
        }
      }),
    };
  };
  EventBus.subscribe(eventId, _handler);
  _subscriptions.push([eventId, _handler]);
});



  const cleanup = () => {
    _subscriptions.forEach(([eventId, fn]) => EventBus.unsubscribe(eventId, fn));
    _subscriptions.length = 0;
  };
  const _registry = new FinalizationRegistry(cleanup);
  _registry.register(automatas, undefined);

  return [EventBus, automatas, cleanup];
}


const reducer: TReducerMap = {
  74979334: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
selectedIndex: (function(){
  if(prevContext !== null && prevContext['selectedIndex'] !== undefined && prevContext['selectedIndex'] !== null) {
	return prevContext['selectedIndex'];
  }
  else {
	return -1;
  }
}())

}
  },
  1608537031: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
selectedIndex: (function(){
	const boundValue = (function(){
	return functionDictionary.get('coalesce')((function(){
  if(payload !== null && payload['index'] !== undefined && payload['index'] !== null) {
	return payload['index'];
  }
  else {
	return null;
  }
}()),(function(){
  if(prevContext !== null && prevContext['selectedIndex'] !== undefined && prevContext['selectedIndex'] !== null) {
	return prevContext['selectedIndex'];
  }
  else {
	return null;
  }
}()))}())

	return boundValue
}())

}
  },
  305141320: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
gameId: (function(){
	const boundValue = (function(){
  if(payload !== null && payload['gameId'] !== undefined && payload['gameId'] !== null) {
	return payload['gameId'];
  }
  else {
	return null;
  }
}())

	return boundValue
}())

}
  },
  1674321948: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
  477957801: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
gameId: (function(){
	const boundValue = (function(){
	return functionDictionary.get('coalesce')((function(){
  if(payload !== null && payload['gameId'] !== undefined && payload['gameId'] !== null) {
	return payload['gameId'];
  }
  else {
	return null;
  }
}()),(function(){
  if(prevContext !== null && prevContext['gameId'] !== undefined && prevContext['gameId'] !== null) {
	return prevContext['gameId'];
  }
  else {
	return null;
  }
}()))}())

	return boundValue
}())

}
  },
  1611700593: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
}
const getDefaultContext = (prevContext: TAutomataContext, payload: TReducerPayload): TAutomataContext => {
  const ctx = {
selectedIndex: (function(){
  if(prevContext !== null && prevContext['selectedIndex'] !== undefined && prevContext['selectedIndex'] !== null) {
	return prevContext['selectedIndex'];
  }
  else {
	return -1;
  }
}())

}
;
  return Object.assign({}, prevContext, ctx);
}
export class WindowMenuAutomata extends GenericAutomata {
  static id = 'WindowMenuAutomata_1780340199812';
  static actions = actionsMap;
  static states = statesMap;
  static getState = (state: keyof typeof statesMap) => statesDictionary[state];
  static hasState = (instance: WindowMenuAutomata, state: keyof typeof WindowMenuAutomata.states) => instance.state === WindowMenuAutomata.getState(state);
  static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
  static createAction = (action: keyof typeof actionsMap, payload: TAutomataPayload) => {
    const actionId = WindowMenuAutomata.getAction(action);
    return { action: actionId, payload };
  };

  constructor() {
    super(eventAdapter);
    this.init({
      state: 74979334,
      context: {"selectedIndex":null},
      rootReducer: ((input: TRootReducerInput): TRootReducerOutput => {
  const { action, context, payload, state } = input;
  if (action === null || payload === null) return { state, context };

  if (!this.isKeyOf(state, actionToStateFromStateDict)) throw new Error("Invalid state, maybe machine isn't running.");

  if (!this.isKeyOf(action, actionToStateFromStateDict[state])) return { state, context };

  const transitions: TTransitions = actionToStateFromStateDict;

  const getNew = (
  localAction: TActionId,
  localState: TStateId,
  localContext: TAutomataContext,
  localPayload: TReducerPayload,
): TRootReducerOutput => {
  this.lastAction = localAction;

  const stateTransitions = transitions[localState];
  if (!stateTransitions) return { state: localState, context: localContext };

  const actionMove = stateTransitions[localAction];
  if (!actionMove) return { state: localState, context: localContext };

  const newStateObject = { state: actionMove.state[0] };
  const contextWithInitial = getDefaultContext(localContext, localPayload);

  if (actionMove.state.length > 1 && actionMove.predicate != null) {
    const resolvedPredicateValue = actionMove.predicate(contextWithInitial, localPayload, functionDictionary);
    if (resolvedPredicateValue == null) return { state: localState, context: localContext };
    newStateObject.state = resolvedPredicateValue;
  }

  const newState = newStateObject.state;
  const newContextFunc = reducer[newState];

  if (typeof newContextFunc !== 'function') {
    throw new Error('Invalid newContextFunc');
  }

  return {
    state: newState,
    context: newContextFunc(contextWithInitial, localPayload, this.getFunctionRegistry(), this),
  };
};

  let localCtx = getNew(action, state, context, payload);

  while (byPassedStates.has(localCtx.state)) {
    localCtx = getNew(actionsDictionary['[-]'], localCtx.state, localCtx.context, {});
  }

  incrementEpoch();

  return localCtx;
}),
      stateValidator: (s: TAutomataBaseStateType) => Object.values(statesDictionary).includes(s),
      actionValidator: (a: TAutomataBaseActionType) => Object.values(actionsDictionary).includes(a),
      functionRegistry: functionDictionary,
    });
    const initReducer = reducer[this.state];
    const prev = this.getContext()?.context ?? {};
    const initContext = initReducer(prev, {}, this.getFunctionRegistry(), this);
    this.setContext({ state: this.state, context: Object.assign({}, prev, initContext) });
  }

  isKeyOf = <T extends object>(key: PropertyKey, obj: T): key is keyof T => key in obj;
}

export default WindowMenuAutomata;
