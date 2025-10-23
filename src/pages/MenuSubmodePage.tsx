import React from 'react';
import { useFSM } from '@yantrix/react';
import WindowMenuAutomata from '~/src/fsm/window/WindowMenuAutomata';
import StateBadge from '~/src/components/StateBadge';
import Field from '~/src/components/Field';



type AnyRecord = Record<string, any>;

function useStateName(fsm: any) {
  const stateId = fsm.getContext().state as number;
  const names = Object.keys(fsm.states ?? {});
  const found = names.find(k => fsm.getState?.(k) === stateId);
  return found ?? String(stateId);
}

export default function MenuSubmodePage() {
  const fsm = useFSM({ Automata: WindowMenuAutomata, id: WindowMenuAutomata.id });
  const ctx = fsm.getContext() as { state: number; context: AnyRecord };
  const stateName = useStateName(fsm);

  const [gameId, setGameId] = React.useState('GAME-001');
  const [index, setIndex] = React.useState('0');

  const act = (name: string, payload: AnyRecord = {}) => {
    const a = fsm.createAction?.(name, payload) ?? { action: fsm.getAction?.(name), payload };
    fsm.dispatch(a as any);
  };

  const select = (i: number) => act('SELECT', { index: i });

  return (
    <div className="grid">
      <div className="panel">
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="row" style={{ alignItems: 'center' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Menu Submode</h3>
            <StateBadge stateName={stateName} />
          </div>
          <div className="row">
            <button onClick={() => act('RESET')} className="warn">Reset</button>
          </div>
        </div>
        <small className="muted">Represents the behaviour of the main menu: create or join a game</small>
        <hr />
        <div className="row">
          <Field label="gameId" value={gameId} onChange={setGameId} />
          <Field label="select index" value={index} onChange={setIndex} type="number" />
        </div>
      </div>

      <div className="panel">
        <h4 className="section-title">In-Menu interactions</h4>
        <div className="row">
          <button onClick={() => select(Number(index))}>Select (index)</button>
          <button className="primary" onClick={() => act('CREATE_LOBBY', { gameId })}>
            Create Lobby
          </button>
          <button onClick={() => act('JOIN_GAME')}>Join Game</button>
        </div>
      </div>

      <div className="panel">
        <h4 className="section-title">Join flow</h4>
        <div className="row">
          <button onClick={() => act('ENTER_GAME_ID', { gameId })}>Enter Game ID</button>
          <button onClick={() => act('JOINING_GAME', { gameId })} className="primary">
            Join (pending)
          </button>
          <button onClick={() => act('LOBBY_JOINED', { gameId })} className="ok">
            Joined (simulate accepted)
          </button>
          <button onClick={() => act('ERROR')} className="danger">Error</button>
          <button onClick={() => act('CANCEL_SELECTION')}>Cancel selection</button>
          <button onClick={() => act('SKIP')} className="warn">Skip</button>
        </div>
      </div>

      <div className="panel">
        <h4 className="section-title">Raw Context</h4>
        <pre style={{ overflow: 'auto', margin: 0 }}>{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    </div>
  );
}