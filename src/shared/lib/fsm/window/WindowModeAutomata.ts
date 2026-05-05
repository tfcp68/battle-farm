/* eslint-disable */
// @ts-nocheck

import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core'


const predicates = {
};
export const statesDictionary = {
  "~~~START~~~": 74979334,
  "INTRO": 69824076,
  "MAIN_MENU": 1730055131,
  "GAME_LOBBY": 1929949911,
  "JOIN_REQUEST": 94228390,
  "GAME_STARTING": 1032785389,
  "IN_GAME": 1608719668,
  "SCORE_SCREEN": 1985829159
};

export const actionsDictionary = {
  "RESET": 77866287,
  "TO_MENU": 407301981,
  "JOIN_GAME": 1973300761,
  "CREATE_GAME": 1688544597,
  "EXIT": 2142494,
  "START_GAME": 1058895409,
  "CANCEL": 1980572282,
  "REQUEST_ACCEPTED": 1455755127,
  "[-]": 88939,
  "END_GAME": 1757631242,
  "ERROR": 66247144
};

export const eventDictionary = {
  "intro_complete": 1206028884,
  "cancel_game_request": 73997081,
  "request_accepted": 1109700777,
  "lobby_created": 1462619007,
  "game_start": 970405333,
  "game_end": 1768834290,
  "player_exit": 556694460,
  "player_cancel": 1965899368,
  "lobby_closed": 2120164853,
  "join_lobby": 1855984769,
  "join_game_request": 1925485623,
  "game_started": 551625012
};
GlobalEventDictionary.addEvents({
  keys: Object.keys(eventDictionary).filter(e => GlobalEventDictionary.getEventValues({ keys: [e] })[0] == null)
});

export const functionDictionary = new FunctionDictionary();

const actionsMap = {
  "RESET": "RESET",
  "TO_MENU": "TO_MENU",
  "JOIN_GAME": "JOIN_GAME",
  "CREATE_GAME": "CREATE_GAME",
  "EXIT": "EXIT",
  "START_GAME": "START_GAME",
  "CANCEL": "CANCEL",
  "REQUEST_ACCEPTED": "REQUEST_ACCEPTED",
  "[-]": "[-]",
  "END_GAME": "END_GAME",
  "ERROR": "ERROR"
};

const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "INTRO": "INTRO",
  "MAIN_MENU": "MAIN_MENU",
  "GAME_LOBBY": "GAME_LOBBY",
  "JOIN_REQUEST": "JOIN_REQUEST",
  "GAME_STARTING": "GAME_STARTING",
  "IN_GAME": "IN_GAME",
  "SCORE_SCREEN": "SCORE_SCREEN"
};
const actionToStateFromStateDict = {
  69824076: {
  77866287: {
  state: [69824076]}

,  407301981: {
  state: [1730055131]}

}

,  74979334: {
  77866287: {
  state: [69824076]}

}

,  94228390: {
  77866287: {
  state: [69824076]}

,  1455755127: {
  state: [1929949911]}

,  1980572282: {
  state: [1730055131]}

}

,  1032785389: {
  88939: {
  state: [1608719668]}

,  77866287: {
  state: [69824076]}

}

,  1608719668: {
  2142494: {
  state: [1730055131]}

,  66247144: {
  state: [1730055131]}

,  77866287: {
  state: [69824076]}

,  1757631242: {
  state: [1985829159]}

}

,  1730055131: {
  77866287: {
  state: [69824076]}

,  1688544597: {
  state: [1929949911]}

,  1973300761: {
  state: [94228390]}

}

,  1929949911: {
  2142494: {
  state: [1730055131]}

,  77866287: {
  state: [69824076]}

,  1058895409: {
  state: [1032785389]}

}

,  1985829159: {
  2142494: {
  state: [1730055131]}

,  77866287: {
  state: [69824076]}

}

};


const byPassedStates = new Set([1032785389]);

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

export type TActionsWindowModeAutomata = keyof typeof actionsMap;




const eventAdapter = new AutomataEventAdapter();
eventAdapter.addEventEmitter(
  statesDictionary["GAME_LOBBY"],
  ({ state, context }) => {
    const eventsToEmit = [
      {
  event: eventDictionary["join_lobby"],
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

,
        playerId: (function(){
  const boundValue = (function(){
  if(context !== null && context['playerId'] !== undefined && context['playerId'] !== null) {
	return context['playerId'];
  }
  else {
	return null;
  }
}())


  return boundValue
}())

,
        isHost: (function(){
  const boundValue = (function(){
  if(context !== null && context['isHost'] !== undefined && context['isHost'] !== null) {
	return context['isHost'];
  }
  else {
	return null;
  }
}())


  return boundValue
}())

,
        lobbyId: (function(){
  const boundValue = (function(){
  if(context !== null && context['lobbyId'] !== undefined && context['lobbyId'] !== null) {
	return context['lobbyId'];
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
eventAdapter.addEventEmitter(
  statesDictionary["JOIN_REQUEST"],
  ({ state, context }) => {
    const eventsToEmit = [
      {
  event: eventDictionary["join_game_request"],
  meta: {
    playerId: (function(){
  const boundValue = (function(){
  if(context !== null && context['playerId'] !== undefined && context['playerId'] !== null) {
	return context['playerId'];
  }
  else {
	return null;
  }
}())


  return boundValue
}())

,
        lobbyId: (function(){
  const boundValue = (function(){
  if(context !== null && context['lobbyId'] !== undefined && context['lobbyId'] !== null) {
	return context['lobbyId'];
  }
  else {
	return null;
  }
}())


  return boundValue
}())

,
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
eventAdapter.addEventEmitter(
  statesDictionary["GAME_STARTING"],
  ({ state, context }) => {
    const eventsToEmit = [
      {
  event: eventDictionary["game_started"],
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

,
        playerIds: (function(){
  const boundValue = (function(){
  if(context !== null && context['playerIds'] !== undefined && context['playerIds'] !== null) {
	return context['playerIds'];
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
  eventDictionary["intro_complete"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["TO_MENU"],
      payload: {
              },
    };
  },
);
eventAdapter.addEventListener(
  eventDictionary["cancel_game_request"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["CANCEL"],
      payload: {
              },
    };
  },
);
eventAdapter.addEventListener(
  eventDictionary["request_accepted"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["REQUEST_ACCEPTED"],
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

,
        lobbyId: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['lobbyId'] !== undefined && meta['lobbyId'] !== null) {
	return meta['lobbyId'];
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
eventAdapter.addEventListener(
  eventDictionary["lobby_created"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["CREATE_GAME"],
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

,
        isHost: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['isHost'] !== undefined && meta['isHost'] !== null) {
	return meta['isHost'];
  }
  else {
	return 1;
  }
}())


  return boundValue
}())

,
        lobbyId: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['lobbyId'] !== undefined && meta['lobbyId'] !== null) {
	return meta['lobbyId'];
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
eventAdapter.addEventListener(
  eventDictionary["game_start"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["START_GAME"],
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

,
        playerIds: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['playerIds'] !== undefined && meta['playerIds'] !== null) {
	return meta['playerIds'];
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
eventAdapter.addEventListener(
  eventDictionary["game_end"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["END_GAME"],
      payload: {
        scoreBoard: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['scoreBoard'] !== undefined && meta['scoreBoard'] !== null) {
	return meta['scoreBoard'];
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
eventAdapter.addEventListener(
  eventDictionary["player_exit"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["EXIT"],
      payload: {
              },
    };
  },
);
eventAdapter.addEventListener(
  eventDictionary["player_cancel"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["CANCEL"],
      payload: {
              },
    };
  },
);
eventAdapter.addEventListener(
  eventDictionary["lobby_closed"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["EXIT"],
      payload: {
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
playerId: (function(){
  if(prevContext !== null && prevContext['playerId'] !== undefined && prevContext['playerId'] !== null) {
	return prevContext['playerId'];
  }
  else {
	return functionDictionary.get('getPlayerId')();
  }
}())

}
  },
  69824076: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
  1730055131: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
  1929949911: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
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

,
	isHost: (function(){
	const boundValue = (function(){
  if(payload !== null && payload['isHost'] !== undefined && payload['isHost'] !== null) {
	return payload['isHost'];
  }
  else {
	return 0;
  }
}())

	return boundValue
}())

,
	lobbyId: (function(){
	const boundValue = (function(){
  if(payload !== null && payload['lobbyId'] !== undefined && payload['lobbyId'] !== null) {
	return payload['lobbyId'];
  }
  else {
	return null;
  }
}())

	return boundValue
}())

}
  },
  94228390: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
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

,
	lobbyId: (function(){
	const boundValue = (function(){
  if(payload !== null && payload['lobbyId'] !== undefined && payload['lobbyId'] !== null) {
	return payload['lobbyId'];
  }
  else {
	return null;
  }
}())

	return boundValue
}())

}
  },
  1032785389: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
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

,
	playerIds: (function(){
	const boundValue = (function(){
  if(payload !== null && payload['playerIds'] !== undefined && payload['playerIds'] !== null) {
	return payload['playerIds'];
  }
  else {
	return null;
  }
}())

	return boundValue
}())

}
  },
  1608719668: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
  1985829159: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
scoreBoard: (function(){
	const boundValue = (function(){
  if(payload !== null && payload['scoreBoard'] !== undefined && payload['scoreBoard'] !== null) {
	return payload['scoreBoard'];
  }
  else {
	return null;
  }
}())

	return boundValue
}())

}
  },
}
const getDefaultContext = (prevContext: TAutomataContext, payload: TReducerPayload): TAutomataContext => {
  const ctx = {
playerId: (function(){
  if(prevContext !== null && prevContext['playerId'] !== undefined && prevContext['playerId'] !== null) {
	return prevContext['playerId'];
  }
  else {
	return functionDictionary.get('getPlayerId')();
  }
}())

}
;
  return Object.assign({}, prevContext, ctx);
}
export class WindowModeAutomata extends GenericAutomata {
  static id = 'WindowModeAutomata_1777918983218';
  static actions = actionsMap;
  static states = statesMap;
  static getState = (state: keyof typeof statesMap) => statesDictionary[state];
  static hasState = (instance: WindowModeAutomata, state: keyof typeof WindowModeAutomata.states) => instance.state === WindowModeAutomata.getState(state);
  static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
  static createAction = (action: keyof typeof actionsMap, payload: TAutomataPayload) => {
    const actionId = WindowModeAutomata.getAction(action);
    return { action: actionId, payload };
  };

  constructor() {
    super(eventAdapter);
    this.init({
      state: 69824076,
      context: {"playerId":null},
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

export default WindowModeAutomata;
