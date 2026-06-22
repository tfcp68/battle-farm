/* eslint-disable */
// @ts-nocheck

import { GenericAutomata, FunctionDictionary, EventDictionary as GlobalEventDictionary, AutomataEventAdapter, BasicEventBus, builtInFunctions, TAutomataBaseActionType, TAutomataBaseStateType, TValidator } from '@yantrix/core'


const predicates = {
};
export const statesDictionary = {
  "~~~START~~~": 74979334,
  "UNAUTHENTICATED": 849706474,
  "AUTHENTICATING": 1750284718,
  "AUTH_FAILED": 455703884,
  "INTRO": 69824076,
  "MAIN_MENU": 1730055131,
  "GAME_LOBBY": 1929949911,
  "JOIN_REQUEST": 94228390,
  "GAME_STARTING": 1032785389,
  "IN_GAME": 1608719668,
  "SCORE_SCREEN": 1985829159
};

export const actionsDictionary = {
  "~~~START~~~, UNAUTHENTICATED, 0": 26484436,
  "AUTH_REQUESTED": 1747158391,
  "SESSION_RESTORED": 1670875329,
  "AUTH_SUCCEEDED": 1998958698,
  "FAIL_AUTH": 2020376023,
  "TO_MENU": 407301981,
  "SIGN_OUT": 1095242156,
  "JOIN_GAME": 1973300761,
  "CREATE_GAME": 1688544597,
  "RE_ENTER_LOBBY": 1268850531,
  "EXIT": 2142494,
  "START_GAME": 1058895409,
  "APPROVE_REQUEST": 1480144733,
  "REJECT_REQUEST": 1951367729,
  "CANCEL": 1980572282,
  "REJECTED": 174130302,
  "TIMED_OUT": 1466757626,
  "REQUEST_ACCEPTED": 1455755127,
  "[-]": 88939,
  "END_GAME": 1757631242,
  "ERROR": 66247144
};

export const eventDictionary = {
  "auth_requested": 1626373527,
  "auth_succeeded": 1878173834,
  "auth_failed": 944011596,
  "auth_signed_out": 2138685790,
  "session_restored": 58636063,
  "request_rejected": 428327982,
  "request_timeout": 726276175,
  "intro_complete": 1206028884,
  "cancel_game_request": 73997081,
  "join_game_request": 1925485623,
  "mode_join_accepted": 1263200896,
  "lobby_created": 1462619007,
  "re_enter_lobby": 1597211741,
  "game_start": 970405333,
  "game_end": 1768834290,
  "player_exit": 556694460,
  "player_cancel": 1965899368,
  "lobby_closed": 2120164853,
  "lobby_request_approved": 94764112,
  "lobby_request_rejected": 1888505481,
  "join_lobby": 1855984769,
  "game_started": 551625012
};
GlobalEventDictionary.addEvents({
  keys: Object.keys(eventDictionary).filter(e => GlobalEventDictionary.getEventValues({ keys: [e] })[0] == null)
});

export const functionDictionary = new FunctionDictionary();

const actionsMap = {
  "~~~START~~~, UNAUTHENTICATED, 0": "~~~START~~~, UNAUTHENTICATED, 0",
  "AUTH_REQUESTED": "AUTH_REQUESTED",
  "SESSION_RESTORED": "SESSION_RESTORED",
  "AUTH_SUCCEEDED": "AUTH_SUCCEEDED",
  "FAIL_AUTH": "FAIL_AUTH",
  "TO_MENU": "TO_MENU",
  "SIGN_OUT": "SIGN_OUT",
  "JOIN_GAME": "JOIN_GAME",
  "CREATE_GAME": "CREATE_GAME",
  "RE_ENTER_LOBBY": "RE_ENTER_LOBBY",
  "EXIT": "EXIT",
  "START_GAME": "START_GAME",
  "APPROVE_REQUEST": "APPROVE_REQUEST",
  "REJECT_REQUEST": "REJECT_REQUEST",
  "CANCEL": "CANCEL",
  "REJECTED": "REJECTED",
  "TIMED_OUT": "TIMED_OUT",
  "REQUEST_ACCEPTED": "REQUEST_ACCEPTED",
  "[-]": "[-]",
  "END_GAME": "END_GAME",
  "ERROR": "ERROR"
};

const statesMap = {
  "~~~START~~~": "~~~START~~~",
  "UNAUTHENTICATED": "UNAUTHENTICATED",
  "AUTHENTICATING": "AUTHENTICATING",
  "AUTH_FAILED": "AUTH_FAILED",
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
  26484436: {
  state: [849706474]}

,  407301981: {
  state: [1730055131]}

}

,  74979334: {
  26484436: {
  state: [849706474]}

}

,  94228390: {
  26484436: {
  state: [849706474]}

,  174130302: {
  state: [1730055131]}

,  1455755127: {
  state: [1929949911]}

,  1466757626: {
  state: [1730055131]}

,  1980572282: {
  state: [1730055131]}

}

,  455703884: {
  26484436: {
  state: [849706474]}

,  1747158391: {
  state: [1750284718]}

}

,  849706474: {
  26484436: {
  state: [849706474]}

,  1670875329: {
  state: [1730055131]}

,  1747158391: {
  state: [1750284718]}

}

,  1032785389: {
  88939: {
  state: [1608719668]}

,  26484436: {
  state: [849706474]}

}

,  1608719668: {
  2142494: {
  state: [1730055131]}

,  26484436: {
  state: [849706474]}

,  66247144: {
  state: [1730055131]}

,  1757631242: {
  state: [1985829159]}

}

,  1730055131: {
  26484436: {
  state: [849706474]}

,  1095242156: {
  state: [849706474]}

,  1268850531: {
  state: [1929949911]}

,  1688544597: {
  state: [1929949911]}

,  1973300761: {
  state: [94228390]}

}

,  1750284718: {
  26484436: {
  state: [849706474]}

,  1670875329: {
  state: [1730055131]}

,  1998958698: {
  state: [69824076]}

,  2020376023: {
  state: [455703884]}

}

,  1929949911: {
  2142494: {
  state: [1730055131]}

,  26484436: {
  state: [849706474]}

,  1058895409: {
  state: [1032785389]}

,  1480144733: {
  state: [1929949911]}

,  1688544597: {
  state: [1929949911]}

,  1951367729: {
  state: [1929949911]}

}

,  1985829159: {
  2142494: {
  state: [1730055131]}

,  26484436: {
  state: [849706474]}

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
eventAdapter.addEventListener(
  eventDictionary["auth_requested"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["AUTH_REQUESTED"],
      payload: {
        mode: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['mode'] !== undefined && meta['mode'] !== null) {
	return meta['mode'];
  }
  else {
	return null;
  }
}())


  return boundValue
}())

,
        nickname: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['nickname'] !== undefined && meta['nickname'] !== null) {
	return meta['nickname'];
  }
  else {
	return null;
  }
}())


  return boundValue
}())

,
        password: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['password'] !== undefined && meta['password'] !== null) {
	return meta['password'];
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
  eventDictionary["auth_succeeded"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["AUTH_SUCCEEDED"],
      payload: {
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
  eventDictionary["auth_failed"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["FAIL_AUTH"],
      payload: {
        error: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['error'] !== undefined && meta['error'] !== null) {
	return meta['error'];
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
  eventDictionary["auth_signed_out"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["SIGN_OUT"],
      payload: {
              },
    };
  },
);
eventAdapter.addEventListener(
  eventDictionary["session_restored"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["SESSION_RESTORED"],
      payload: {
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
  eventDictionary["request_rejected"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["REJECTED"],
      payload: {
              },
    };
  },
);
eventAdapter.addEventListener(
  eventDictionary["request_timeout"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["TIMED_OUT"],
      payload: {
        timedOut: (function(){
  const boundValue = (function(){
  if(meta !== null && meta['timedOut'] !== undefined && meta['timedOut'] !== null) {
	return meta['timedOut'];
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
  eventDictionary["join_game_request"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["JOIN_GAME"],
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
  eventDictionary["mode_join_accepted"],
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
  eventDictionary["re_enter_lobby"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["RE_ENTER_LOBBY"],
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
eventAdapter.addEventListener(
  eventDictionary["lobby_request_approved"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["APPROVE_REQUEST"],
      payload: {
              },
    };
  },
);
eventAdapter.addEventListener(
  eventDictionary["lobby_request_rejected"],
  ({ event, meta }) => {
    return {
      action: actionsDictionary["REJECT_REQUEST"],
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

,
	authError: (function(){
  if(prevContext !== null && prevContext['authError'] !== undefined && prevContext['authError'] !== null) {
	return prevContext['authError'];
  }
  else {
	return 0;
  }
}())

,
	timedOut: (function(){
  if(prevContext !== null && prevContext['timedOut'] !== undefined && prevContext['timedOut'] !== null) {
	return prevContext['timedOut'];
  }
  else {
	return 0;
  }
}())

}
  },
  849706474: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
  1750284718: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return prevContext
  },
  455703884: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
authError: (function(){
	const boundValue = (function(){
  if(payload !== null && payload['error'] !== undefined && payload['error'] !== null) {
	return payload['error'];
  }
  else {
	return null;
  }
}())

	return boundValue
}())

}
  },
  69824076: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
playerId: (function(){
	const boundValue = (function(){
  if(payload !== null && payload['playerId'] !== undefined && payload['playerId'] !== null) {
	return payload['playerId'];
  }
  else {
	return null;
  }
}())

	return boundValue
}())

}
  },
  1730055131: (prevContext: TAutomataContext, payload: TReducerPayload, functionDictionary: FunctionDictionary, automata: GenericAutomata) => {
    return {
playerId: (function(){
	const boundValue = (function(){
	return functionDictionary.get('coalesce')((function(){
  if(payload !== null && payload['playerId'] !== undefined && payload['playerId'] !== null) {
	return payload['playerId'];
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
}()))}())

	return boundValue
}())

,
	timedOut: (function(){
	const boundValue = (function(){
	return functionDictionary.get('coalesce')((function(){
  if(payload !== null && payload['timedOut'] !== undefined && payload['timedOut'] !== null) {
	return payload['timedOut'];
  }
  else {
	return null;
  }
}()),0)}())

	return boundValue
}())

}
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

,
	timedOut: (function(){
	const boundValue = (function(){
	return 0}())

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

,
	authError: (function(){
  if(prevContext !== null && prevContext['authError'] !== undefined && prevContext['authError'] !== null) {
	return prevContext['authError'];
  }
  else {
	return 0;
  }
}())

,
	timedOut: (function(){
  if(prevContext !== null && prevContext['timedOut'] !== undefined && prevContext['timedOut'] !== null) {
	return prevContext['timedOut'];
  }
  else {
	return 0;
  }
}())

}
;
  return Object.assign({}, prevContext, ctx);
}
export class WindowModeAutomata extends GenericAutomata {
  static id = 'WindowModeAutomata_1780340198482';
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
      state: 849706474,
      context: {"playerId":null,"authError":null,"timedOut":null},
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
