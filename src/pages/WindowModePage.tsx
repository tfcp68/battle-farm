import React from 'react';
import { useFSM } from '@yantrix/react';
import WindowModeAutomata from '~/src/fsm/window/WindowModeAutomata';
import StateBadge from '~/src/components/StateBadge';
import Field from '~/src/components/Field';

type AnyRecord = Record<string, any>;

function useStateName(fsm: any) {
  const stateId = fsm.getContext().state as number;
  const names = Object.keys(fsm.states ?? {});
  const found = names.find(k => fsm.getState?.(k) === stateId);
  return found ?? String(stateId);
}

const WindowModePage = () => {
  const fsm = useFSM({ Automata: WindowModeAutomata, id: WindowModeAutomata.id });

  const ctx = fsm.getContext();
  const stateName = useStateName(fsm);

  const [gameId, setGameId] = React.useState('GAME-001');
  const [playerId, setPlayerId] = React.useState('P1');
  const [scoreBoard, setScoreBoard] = React.useState('[]');
  const [playerIds, setPlayerIds] = React.useState('["P1","P2"]');

  const act = (name: string, payload: AnyRecord = {}) => {
    const a = fsm.createAction?.(name, payload) ?? { action: fsm.getAction?.(name), payload };
    fsm.dispatch(a);
  };

  return (
    <div className="grid">
      <div className="panel">
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="row" style={{ alignItems: 'center' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Window Mode</h3>
            <StateBadge stateName={stateName} />
          </div>
          <div className="row">
            <button onClick={() => act('RESET')} className="warn">Reset</button>
          </div>
        </div>
        <small className="muted">Implements the WindowMode diagram (docs/diagrams.md)</small>
        <hr />
        <div className="row">
          <Field label="gameId" value={gameId} onChange={setGameId} />
          <Field label="playerId" value={playerId} onChange={setPlayerId} />
          <Field label="playerIds (json)" value={playerIds} onChange={setPlayerIds} />
          <Field label="scoreBoard (json)" value={scoreBoard} onChange={setScoreBoard} />
        </div>
      </div>

      <div className="panel">
        <h4 className="section-title">Actions</h4>
        <div className="row">
          <button className="primary" onClick={() => act('TO_MENU')}>To Menu</button>

          <button onClick={() => act('CREATE_GAME', { gameId, isHost: 1 })}>
            Create Game
          </button>
          <button onClick={() => act('JOIN_GAME', { gameId })}>
            Join Game
          </button>

          <button onClick={() => act('REQUEST_ACCEPTED', { gameId })}>
            Request Accepted (simulate)
          </button>

          <button onClick={() => act('START_GAME', { gameId, playerIds: safeParse(playerIds) })} className="ok">
            Start Game (to Lobby/Starting)
          </button>

          <button onClick={() => act('END_GAME', { scoreBoard: safeParse(scoreBoard) })} className="ok">
            End Game
          </button>

          <button onClick={() => act('EXIT')} className="danger">Exit</button>
          <button onClick={() => act('ERROR')} className="warn">Error</button>
          <button onClick={() => act('CANCEL')}>Cancel</button>
        </div>
      </div>

      <div className="panel">
        <h4 className="section-title">Raw Context</h4>
        <pre style={{ overflow: 'auto', margin: 0 }}>{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    </div>
  );
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export default WindowModePage