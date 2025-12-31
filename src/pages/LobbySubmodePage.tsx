import React from 'react';
import DevSidebar from '~/components/DevSidebar';
import { Switch } from '~/components/ui/switch';

import WindowLobbyAutomata, { statesDictionary as statesLobbyAutomata } from '~/fsm/window/WindowLobbyAutomata';

import { useMachines } from '~/hooks/useMachines';
import { useFSM } from '@yantrix/react';

import { useLobbyController } from '~/hooks/useLobbyController';
import { useLobbyById, useLobbyPlayersByLobbyId, useLobbyRequestsByLobbyId } from '~/hooks/useLobbies';
import { usePlayersList } from '~/hooks/usePlayers';
import { useCurrentPlayer } from '~/hooks/useAuth';
import { getStateName } from '~/helpers/fsm';
import WindowModeAutomata, { statesDictionary as statuesModeAutomata } from '~/fsm/window/WindowModeAutomata';
import { useNavigate } from 'react-router-dom';

export default function LobbySubmodePage() {
	const navigate = useNavigate();

	const ctrl = useLobbyController();

	const { lobby: lobbyFSM, mode: modeFSM } = useMachines();
	const { getContext: getLobbyContext } = useFSM({ id: lobbyFSM.id, Automata: lobbyFSM.instance });
	const { getContext: getModeContext } = useFSM({ id: modeFSM.id, Automata: modeFSM.instance });

	const lobbyCtx = getLobbyContext();
	const modeCtx = getModeContext();

	const lobbyId = modeCtx?.context?.lobbyId ?? null;

	const { data: currentPlayer } = useCurrentPlayer();
	const currentPlayerId = currentPlayer?.playerId ?? null;

	const { data: lobby } = useLobbyById(lobbyId);
	const { data: lobbyPlayers = [] } = useLobbyPlayersByLobbyId(lobbyId);
	const { data: requests = [] } = useLobbyRequestsByLobbyId(lobbyId);
	const { data: allPlayers = [] } = usePlayersList();

	const nicknameById: Record<string, string> = React.useMemo(() => {
		const map: Record<string, string> = {};
		for (const p of allPlayers) if (p.playerId && p.nickname) map[p.playerId] = p.nickname;
		return map;
	}, [allPlayers]);

	const isHost = !!(lobby?.hostPlayerId && currentPlayerId && lobby.hostPlayerId === currentPlayerId);

	const readyMap = React.useMemo<Record<string, 0 | 1> | undefined>(() => {
		const ctx = lobbyCtx?.context;
		if (!ctx || typeof ctx !== 'object') return undefined;
		const m = (ctx as { playerReadyMap?: unknown }).playerReadyMap;
		if (!m || typeof m !== 'object') return undefined;
		return m as Record<string, 0 | 1>;
	}, [lobbyCtx?.context]);

	const normalizedReadyMap = React.useMemo(() => readyMap ?? {}, [readyMap]);

	const playerIds = React.useMemo(() => {
		const ids = new Set<string>();
		Object.keys(normalizedReadyMap).forEach((id) => ids.add(id));
		lobbyPlayers.forEach((p) => p.playerId && ids.add(p.playerId));
		return Array.from(ids);
	}, [normalizedReadyMap, lobbyPlayers]);

	const myReadyValue: 0 | 1 =
		currentPlayerId && normalizedReadyMap[currentPlayerId] !== undefined ? normalizedReadyMap[currentPlayerId] : 0;

	// if (!lobbyId) return <div>lobbyId is not exist</div>;
	return (
		<>
			<DevSidebar
				automataName={WindowLobbyAutomata.name}
				stateName={getStateName(statesLobbyAutomata, lobbyCtx?.state)}
				snapshot={lobbyCtx}
			/>
			<DevSidebar
				automataName={WindowModeAutomata.name}
				stateName={getStateName(statuesModeAutomata, modeCtx?.state)}
				snapshot={modeCtx}
			/>

			<div className="with-dev">
				<div className="grid">
					<div className="panel">
						<div className="row" style={{ justifyContent: 'space-between' }}>
							<h3 className="section-title" style={{ margin: 0 }}>
								Lobby
							</h3>
						</div>

						<div className="row">
							{isHost ? (
								<>
									<button
										className="danger"
										onClick={() => {
											ctrl.closeLobby(lobbyId);
											navigate('/menu');
										}}>
										Close Lobby
									</button>
									<button className="ok" onClick={() => ctrl.startGame(lobbyId)}>
										Start Game
									</button>
								</>
							) : (
								<>
									<button
										className="danger"
										onClick={() => currentPlayerId && ctrl.leaveLobby(lobbyId, currentPlayerId)}>
										Exit Lobby
									</button>
									<small className="muted">Waiting for host...</small>
								</>
							)}
						</div>
					</div>

					<div className="panel">
						<h4 className="section-title">Players</h4>

						{currentPlayerId && (
							<div className="row" style={{ alignItems: 'center', marginBottom: 8 }}>
								<small className="muted" style={{ marginRight: 8 }}>
									Your status:
								</small>
								<Switch
									checked={myReadyValue === 1}
									onCheckedChange={(checked) => ctrl.toggleReady(lobbyId, currentPlayerId, checked)}
								/>
								<small className="muted" style={{ marginLeft: 8 }}>
									{myReadyValue === 1 ? 'Ready' : 'Not ready'}
								</small>
							</div>
						)}

						<table className="table" style={{ marginTop: 8 }}>
							<thead>
								<tr>
									<th>Player</th>
									<th>Host</th>
									<th>Ready</th>
								</tr>
							</thead>
							<tbody>
								{playerIds.map((pid) => {
									const isRowHost = lobby?.hostPlayerId === pid;
									const r = normalizedReadyMap[pid] ?? 0;
									return (
										<tr key={pid}>
											<td>{nicknameById[pid] ?? pid}</td>
											<td style={{ color: isRowHost ? 'var(--ok)' : 'var(--muted)' }}>
												{isRowHost ? 'Yes' : '—'}
											</td>
											<td style={{ color: r ? 'var(--ok)' : 'var(--warn)' }}>
												{r ? 'Ready' : 'Not Ready'}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{isHost && (
						<div className="panel">
							<h4 className="section-title">Join Requests</h4>
							<table className="table" style={{ marginTop: 8 }}>
								<thead>
									<tr>
										<th>Player</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{requests.length === 0 ? (
										<tr>
											<td colSpan={2}>
												<small className="muted">No requests</small>
											</td>
										</tr>
									) : (
										requests.map((r) => (
											<tr key={r.id}>
												<td>{nicknameById[r.playerId] ?? r.playerId}</td>
												<td>{r.status}</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

