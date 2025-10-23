import React from 'react';
import { useFSM } from '@yantrix/react';
import StateBadge from '~/src/components/StateBadge';
import Field from '~/src/components/Field';
import WindowLobbyAutomata from '~/src/fsm/window/WindowLobbyAutomata';


type AnyRecord = Record<string, any>;

function useStateName(fsm: any) {
  const stateId = fsm.getContext().state as number;
  const names = Object.keys(fsm.states ?? {});
  const found = names.find(k => fsm.getState?.(k) === stateId);
  return found ?? String(stateId);
}

export default function LobbySubmodePage() {
  const fsm = useFSM({ Automata: WindowLobbyAutomata, id: WindowLobbyAutomata.id });
  const ctx = fsm.getContext() as { state: number; context: AnyRecord };
  const stateName = useStateName(fsm);

  const [gameId, setGameId] = React.useState('GAME-001');
  const [playerId, setPlayerId] = React.useState('P1');
  const [maxPlayers, setMaxPlayers] = React.useState('7');

  const act = (name: string, payload: AnyRecord = {}) => {
    const a = fsm.createAction?.(name, payload) ?? { action: fsm.getAction?.(name), payload };
    fsm.dispatch(a as any);
  };

  const readyMap: Record<string, 0 | 1> = ctx?.context?.playerReadyMap ?? {};

  return (
    <div className="grid">
      <div className="panel">
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="row" style={{ alignItems: 'center' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Lobby Submode</h3>
            <StateBadge stateName={stateName} />
          </div>
          <div className="row">
            <button onClick={() => act('RESET')} className="warn">Reset</button>
          </div>
        </div>
        <small className="muted">
          Represents the game lobby: players join, mark ready; host can kick; auto-launch when all are ready
        </small>
        <hr />
        <div className="row">
          <Field label="gameId" value={gameId} onChange={setGameId} />
          <Field label="playerId" value={playerId} onChange={setPlayerId} />
          <Field label="maxPlayers" value={maxPlayers} onChange={setMaxPlayers} type="number" />
        </div>
      </div>

      <div className="panel">
        <h4 className="section-title">Lifecycle</h4>
        <div className="row">
          <button
            className="primary"
            onClick={() => act('CREATE_GAME', { gameId, playerId, isHost: 1 })}
          >
            Init Lobby (host)
          </button>
          <button onClick={() => act('PLAYER_JOINING', { gameId, playerId })}>
            Player Joining
          </button>
          <button onClick={() => act('UPDATE', { playerReadyMap: readyMap })}>
            External Update (sync map)
          </button>
          <button className="ok" onClick={() => act('LAUNCH')}>
            Launch (simulate game_start)
          </button>
        </div>
      </div>

      <div className="panel">
        <h4 className="section-title">Players</h4>
        <div className="row">
          <button onClick={() => act('READY')}>I&apos;m Ready</button>
          <button
            className="danger"
            onClick={() => act('KICK', { playerId })}
            title="Host only in real game"
          >
            Kick Player
          </button>
        </div>
        <table className="table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Player</th>
              <th>Ready</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(readyMap).length === 0 && (
              <tr>
                <td colSpan={3}><small className="muted">No players yet</small></td>
              </tr>
            )}
            {Object.entries(readyMap).map(([pid, r]) => (
              <tr key={pid}>
                <td>{pid}</td>
                <td style={{ color: r ? 'var(--ok)' : 'var(--warn)' }}>{r ? 'Ready' : 'Not Ready'}</td>
                <td>
                  <div className="row">
                    <button onClick={() => act('READY')}>Mark Ready (self)</button>
                    <button className="danger" onClick={() => act('KICK', { playerId: pid })}>
                      Kick
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row" style={{ marginTop: 6 }}>
          <small className="muted">
            Auto-launch is handled by the FSM via choice predicates (game_ready). Use Launch to simulate event emission.
          </small>
        </div>
      </div>

      <div className="panel">
        <h4 className="section-title">Raw Context</h4>
        <pre style={{ overflow: 'auto', margin: 0 }}>{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    </div>
  );
}