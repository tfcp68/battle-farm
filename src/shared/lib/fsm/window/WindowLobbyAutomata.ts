/* eslint-disable */
// @ts-nocheck

import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core'


const predicates = {
  2630534: {
  88939: (prevContext, payload, functionDictionary) => {
  const state1 = (function(){
  const cond1 = functionDictionary.get('game_ready')((function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return null;
  }
}()));
  if(cond1 === true) {
    return 1032785389;
  }
  else return undefined;
})();
if(state1) return state1;


  const state2 = (function(){
  const cond1 = true;
  if(cond1 === true) {
    return 72606646;
  }
  else return undefined;
})();
if(state2) return state2;


  return null;
},


},


  72606646: {
  2306630: (prevContext, payload, functionDictionary) => {
  const state1 = (function(){
  const cond1 = functionDictionary.get('and')((function(){
  if(prevContext !== null && prevContext['gameId'] !== undefined && prevContext['gameId'] !== null) {
	return prevContext['gameId'];
  }
  else {
	return null;
  }
}()),(function(){
  if(payload !== null && payload['gameId'] !== undefined && payload['gameId'] !== null) {
	return payload['gameId'];
  }
  else {
	return null;
  }
}()));
  if(cond1 === true) {
    return 1290510598;
  }
  else return undefined;
})();
if(state1) return state1;


  const state2 = (function(){
  const cond1 = true;
  if(cond1 === true) {
    return 72606646;
  }
  else return undefined;
})();
if(state2) return state2;


  return null;
},


  744619270: (prevContext, payload, functionDictionary) => {
  const state1 = (function(){
  const cond1 = functionDictionary.get('and')((function(){
  if(prevContext !== null && prevContext['gameId'] !== undefined && prevContext['gameId'] !== null) {
	return prevContext['gameId'];
  }
  else {
	return null;
  }
}()),(function(){
  if(payload !== null && payload['gameId'] !== undefined && payload['gameId'] !== null) {
	return payload['gameId'];
  }
  else {
	return null;
  }
}()));
  if(cond1 === true) {
    return 94228390;
  }
  else return undefined;
})();
if(state1) return state1;


  return null;
},


},


  85920701: {
  88939: (prevContext, payload, functionDictionary) => {
  const state1 = (function(){
  const cond1 = functionDictionary.get('game_ready')((function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return null;
  }
}()));
  if(cond1 === true) {
    return 1032785389;
  }
  else return undefined;
})();
if(state1) return state1;


  const state2 = (function(){
  const cond1 = true;
  if(cond1 === true) {
    return 72606646;
  }
  else return undefined;
})();
if(state2) return state2;


  return null;
},


},


  94228390: {
  88939: (prevContext, payload, functionDictionary) => {
  const state1 = (function(){
  const cond1 = functionDictionary.get('game_ready')((function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return null;
  }
}()));
  if(cond1 === true) {
    return 1032785389;
  }
  else return undefined;
})();
if(state1) return state1;


  const state2 = (function(){
  const cond1 = true;
  if(cond1 === true) {
    return 72606646;
  }
  else return undefined;
})();
if(state2) return state2;


  return null;
},


},


  1290510598: {
  88939: (prevContext, payload, functionDictionary) => {
  const state1 = (function(){
  const cond1 = functionDictionary.get('game_ready')((function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return null;
  }
}()));
  if(cond1 === true) {
    return 1032785389;
  }
  else return undefined;
})();
if(state1) return state1;


  const state2 = (function(){
  const cond1 = true;
  if(cond1 === true) {
    return 72606646;
  }
  else return undefined;
})();
if(state2) return state2;


  return null;
},


},


};
export const statesDictionary = {
  "~~~START~~~": 74979334,
  "LOBBY_INIT": 1334907897,
  "LOBBY": 72606646,
  "JOIN_REQUEST": 94228390,
  "EXTERNAL_UPDATE": 85920701,
  "KICK_PLAYER": 1290510598,
  "READY_STATE_CHANGE": 2630534,
  "GAME_STARTING": 1032785389,
  "IN_GAME": 1608719668
};

export const actionsDictionary = {
  "CREATE_GAME": 1688544597,
  "[-]": 88939,
  "UPDATE": 1785516855,
  "READY": 77848963,
  "KICK": 2306630,
  "PLAYER_JOINING": 744619270,
  "LAUNCH": 2056513613
};

export const eventDictionary = {
  "lobby_created": 1462619007,
  "join_game_request": 1925485623,
  "player_state_change": 1732543556,
  "game_start": 970405333,
  "menu_join_accepted": 75777988
};
GlobalEventDictionary.addEvents({
  keys: Object.keys(eventDictionary).filter(e => GlobalEventDictionary.getEventValues({ keys: [e] })[0] == null)
});

export const functionDictionary = new FunctionDictionary();

const actionsMap = {
  "CREATE_GAME": "CREATE_GAME",
  "[-]": "[-]",
  "UPDATE": "UPDATE",
  "READY": "READY",
  "KICK": "KICK",
  "PLAYER_JOINING": "PLAYER_JOINING",
  "LAUNCH": "LAUNCH"
};

const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "LOBBY_INIT": "LOBBY_INIT",
  "LOBBY": "LOBBY",
  "JOIN_REQUEST": "JOIN_REQUEST",
  "EXTERNAL_UPDATE": "EXTERNAL_UPDATE",
  "KICK_PLAYER": "KICK_PLAYER",
  "READY_STATE_CHANGE": "READY_STATE_CHANGE",
  "GAME_STARTING": "GAME_STARTING",
  "IN_GAME": "IN_GAME"
};
const actionToStateFromStateDict = {
  2630534: {
  88939: {
  state: [1032785389, 72606646],
  predicate: predicates[2630534][88939]
}

,  1688544597: {
  state: [1334907897]}

}

,  72606646: {
  2306630: {
  state: [1290510598, 72606646],
  predicate: predicates[72606646][2306630]
}

,  77848963: {
  state: [2630534]}

,  744619270: {
  state: [72606646, 94228390],
  predicate: predicates[72606646][744619270]
}

,  1688544597: {
  state: [1334907897]}

,  1785516855: {
  state: [85920701]}

}

,  74979334: {
  1688544597: {
  state: [1334907897]}

}

,  85920701: {
  88939: {
  state: [1032785389, 72606646],
  predicate: predicates[85920701][88939]
}

,  1688544597: {
  state: [1334907897]}

}

,  94228390: {
  88939: {
  state: [1032785389, 72606646],
  predicate: predicates[94228390][88939]
}

,  1688544597: {
  state: [1334907897]}

}

,  1032785389: {
  1688544597: {
  state: [1334907897]}

,  2056513613: {
  state: [1608719668]}

}

,  1290510598: {
  88939: {
  state: [1032785389, 72606646],
  predicate: predicates[1290510598][88939]
}

,  1688544597: {
  state: [1334907897]}

}

,  1334907897: {
  88939: {
  state: [72606646]}

,  1688544597: {
  state: [1334907897]}

}

};


const byPassedStates = new Set([1334907897,94228390,85920701,1290510598,2630534]);

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

export type TActionsWindowLobbyAutomata = keyof typeof actionsMap;



functionDictionary.register('emptyMap', function() {
  return (function() {
  const func = functionDictionary.get('zip');
  return func([], []);
})()

;
});
functionDictionary.register('resetMap', function(players) {
  return (function() {
  const func = functionDictionary.get('zip');
  return func(players, (function() {
  const func = functionDictionary.get('repeat');
  return func(0, (function() {
  const func = functionDictionary.get('len');
  return func(players);
})());
})());
})()

;
});
functionDictionary.register('has_player_slots', function(map, maxPlayers) {
  return (function() {
  const func = functionDictionary.get('isGreater');
  return func(maxPlayers, (function() {
  const func = functionDictionary.get('len');
  return func((function() {
  const func = functionDictionary.get('keys');
  return func(map);
})());
})());
})()

;
});
functionDictionary.register('game_ready', function(map) {
  return (function() {
  const func = functionDictionary.get('isEqual');
  return func((function() {
  const func = functionDictionary.get('len');
  return func((function() {
  const func = functionDictionary.get('keys');
  return func(map);
})());
})(), (function() {
  const func = functionDictionary.get('sum');
  return func((function() {
  const func = functionDictionary.get('values');
  return func(map);
})());
})());
})()

;
});

const eventAdapter = new AutomataEventAdapter();
eventAdapter.addEventEmitter(
  statesDictionary["JOIN_REQUEST"],
  ({ state, context }) => {
    const eventsToEmit = [
      {
  event: eventDictionary["menu_join_accepted"],
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
eventAdapter.addEventEmitter(
  statesDictionary["READY_STATE_CHANGE"],
  ({ state, context }) => {
    const eventsToEmit = [
      {
  event: eventDictionary["player_state_change"],
  meta: {
    game_id: (function(){
  const boundValue = (function(){
  if(context !== null && context['game_id'] !== undefined && context['game_id'] !== null) {
	return context['game_id'];
  }
  else {
	return null;
  }
}())


  return boundValue
}())

,
        playerReadyMap: (function(){
  const boundValue = (function(){
  if(context !== null && context['playerReadyMap'] !== undefined && context['playerReadyMap'] !== null) {
	return context['playerReadyMap'];
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
        playerId: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['playerId'] !== undefined && meta['playerId'] !== null) {
	return meta['playerId'];
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

      },
    };
  },
);
eventAdapter.addEventListener(
  eventDictionary["join_game_request"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["PLAYER_JOINING"],
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
        playerId: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['playerId'] !== undefined && meta['playerId'] !== null) {
	return meta['playerId'];
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
  eventDictionary["player_state_change"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["UPDATE"],
      payload: {
        playerReadyMap: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['playerReadyMap'] !== undefined && meta['playerReadyMap'] !== null) {
	return meta['playerReadyMap'];
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
      action: actionsDictionary["LAUNCH"],
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
	return null;
  }
}())

,
	gameId: (function(){
  if(prevContext !== null && prevContext['gameId'] !== undefined && prevContext['gameId'] !== null) {
	return prevContext['gameId'];
  }
  else {
	return null;
  }
}())

,
	playerReadyMap: (function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return functionDictionary.get('emptyMap')();
  }
}())

,
	hostPlayerId: (function(){
  if(prevContext !== null && prevContext['hostPlayerId'] !== undefined && prevContext['hostPlayerId'] !== null) {
	return prevContext['hostPlayerId'];
  }
  else {
	return null;
  }
}())

,
	maxPlayers: (function(){
  if(prevContext !== null && prevContext['maxPlayers'] !== undefined && prevContext['maxPlayers'] !== null) {
	return prevContext['maxPlayers'];
  }
  else {
	return 7;
  }
}())

,
	readyState: (function(){
  if(prevContext !== null && prevContext['readyState'] !== undefined && prevContext['readyState'] !== null) {
	return prevContext['readyState'];
  }
  else {
	return 0;
  }
}())

}
  },
  1334907897: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
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
	hostPlayerId: (function(){
	const boundValue = (function(){
	return functionDictionary.get('if')(functionDictionary.get('isEqual')((function(){
  if(payload !== null && payload['isHost'] !== undefined && payload['isHost'] !== null) {
	return payload['isHost'];
  }
  else {
	return null;
  }
}()),1),(function(){
  if(payload !== null && payload['playerId'] !== undefined && payload['playerId'] !== null) {
	return payload['playerId'];
  }
  else {
	return null;
  }
}()),(function(){
  if(prevContext !== null && prevContext['hostPlayerId'] !== undefined && prevContext['hostPlayerId'] !== null) {
	return prevContext['hostPlayerId'];
  }
  else {
	return null;
  }
}()))}())

	if(boundValue !== null){
		return boundValue
	}
	else {
		return 0	}
}())

,
	playerReadyMap: (function(){
	const boundValue = (function(){
	return functionDictionary.get('setAttr')((function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return null;
  }
}()),(function(){
  if(payload !== null && payload['playerId'] !== undefined && payload['playerId'] !== null) {
	return payload['playerId'];
  }
  else {
	return null;
  }
}()),0)}())

	return boundValue
}())

}
  },
  72606646: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
  94228390: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
playerReadyMap: (function(){
	const boundValue = (function(){
	return functionDictionary.get('setAttr')(functionDictionary.get('resetMap')(functionDictionary.get('keys')((function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return null;
  }
}()))),(function(){
  if(payload !== null && payload['playerId'] !== undefined && payload['playerId'] !== null) {
	return payload['playerId'];
  }
  else {
	return null;
  }
}()),0)}())

	return boundValue
}())

}
  },
  85920701: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
playerReadyMap: (function(){
	const boundValue = (function(){
  if(payload !== null && payload['playerReadyMap'] !== undefined && payload['playerReadyMap'] !== null) {
	return payload['playerReadyMap'];
  }
  else {
	return null;
  }
}())

	return boundValue
}())

}
  },
  1290510598: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
playerReadyMap: (function(){
	const boundValue = (function(){
	return functionDictionary.get('resetMap')(functionDictionary.get('omit')(functionDictionary.get('keys')((function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return null;
  }
}())),(function(){
  if(payload !== null && payload['playerId'] !== undefined && payload['playerId'] !== null) {
	return payload['playerId'];
  }
  else {
	return null;
  }
}())))}())

	return boundValue
}())

}
  },
  2630534: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
playerReadyMap: (function(){
	const boundValue = (function(){
	return functionDictionary.get('setAttr')((function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return null;
  }
}()),(function(){
  if(prevContext !== null && prevContext['playerId'] !== undefined && prevContext['playerId'] !== null) {
	return prevContext['playerId'];
  }
  else {
	return null;
  }
}()),1)}())

	return boundValue
}())

,
	readyState: (function(){
	const boundValue = (function(){
	return 1}())

	return boundValue
}())

}
  },
  1032785389: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
  1608719668: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
}
const getDefaultContext = (prevContext: TAutomataContext, payload: TReducerPayload): TAutomataContext => {
  const ctx = {
playerId: (function(){
  if(prevContext !== null && prevContext['playerId'] !== undefined && prevContext['playerId'] !== null) {
	return prevContext['playerId'];
  }
  else {
	return null;
  }
}())

,
	gameId: (function(){
  if(prevContext !== null && prevContext['gameId'] !== undefined && prevContext['gameId'] !== null) {
	return prevContext['gameId'];
  }
  else {
	return null;
  }
}())

,
	playerReadyMap: (function(){
  if(prevContext !== null && prevContext['playerReadyMap'] !== undefined && prevContext['playerReadyMap'] !== null) {
	return prevContext['playerReadyMap'];
  }
  else {
	return functionDictionary.get('emptyMap')();
  }
}())

,
	hostPlayerId: (function(){
  if(prevContext !== null && prevContext['hostPlayerId'] !== undefined && prevContext['hostPlayerId'] !== null) {
	return prevContext['hostPlayerId'];
  }
  else {
	return null;
  }
}())

,
	maxPlayers: (function(){
  if(prevContext !== null && prevContext['maxPlayers'] !== undefined && prevContext['maxPlayers'] !== null) {
	return prevContext['maxPlayers'];
  }
  else {
	return 7;
  }
}())

,
	readyState: (function(){
  if(prevContext !== null && prevContext['readyState'] !== undefined && prevContext['readyState'] !== null) {
	return prevContext['readyState'];
  }
  else {
	return 0;
  }
}())

}
;
  return Object.assign({}, prevContext, ctx);
}
export class WindowLobbyAutomata extends GenericAutomata {
  static id = 'WindowLobbyAutomata_1780340201280';
  static actions = actionsMap;
  static states = statesMap;
  static getState = (state: keyof typeof statesMap) => statesDictionary[state];
  static hasState = (instance: WindowLobbyAutomata, state: keyof typeof WindowLobbyAutomata.states) => instance.state === WindowLobbyAutomata.getState(state);
  static getAction = (action: keyof typeof actionsMap) => actionsDictionary[action];
  static createAction = (action: keyof typeof actionsMap, payload: TAutomataPayload) => {
    const actionId = WindowLobbyAutomata.getAction(action);
    return { action: actionId, payload };
  };

  constructor() {
    super(eventAdapter);
    this.init({
      state: 74979334,
      context: {"playerId":null,"gameId":null,"playerReadyMap":null,"hostPlayerId":null,"maxPlayers":null,"readyState":null},
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

export default WindowLobbyAutomata;
