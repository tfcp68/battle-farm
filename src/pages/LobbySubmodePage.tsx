import React from 'react';
import DevSidebar from '~/widgets/DevSidebar';
import RequestTable from '~/widgets/RequestTable';
import WindowLobbyAutomata, { statesDictionary as statesLobbyAutomata } from '~/shared/lib/fsm/window/WindowLobbyAutomata';
import { useMachines } from '~/app/providers/MachinesContext';
import { useFSM } from '@yantrix/react';
import { useLobbyById, useLobbyPlayersByLobbyId } from '~/entities/lobby/queries';
import { usePlayersList } from '~/entities/player/queries';
import { useCurrentPlayer } from '~/entities/auth/queries';
import { getStateName } from '~/shared/helpers/fsm';
import WindowModeAutomata, { statesDictionary as statesModeAutomata } from '~/shared/lib/fsm/window/WindowModeAutomata';
import { useLocation, useNavigate } from 'react-router-dom';
import { TLobbySettings, TWindowModeContext } from '~/shared/types/types';
import { useManageLobby } from '~/features/manage-lobby/useManageLobby';
import { Button } from '~/shared/ui/components/button';

export default function LobbySubmodePage() {
	const navigate = useNavigate();
	const { closeLobby, leaveLobby, startGame } = useManageLobby();

	const { lobby: lobbyFSM, mode: modeFSM } = useMachines();
	const { getContext: getLobbyContext } = useFSM<TLobbySettings>({ id: lobbyFSM.id, Automata: lobbyFSM.instance });
	const { getContext: getModeContext } = useFSM<TWindowModeContext>({ id: modeFSM.id, Automata: modeFSM.instance });

	const lobbyCtx = getLobbyContext();
	const modeCtx = getModeContext();

	const location = useLocation();
	const lobbyId = modeCtx?.context?.lobbyId ?? location.state?.lobbyId ?? null;

	const { data: currentPlayer } = useCurrentPlayer();
	const currentPlayerId = currentPlayer?.playerId ?? null;

	const { data: lobby } = useLobbyById(lobbyId);
	const { data: lobbyPlayers = [] } = useLobbyPlayersByLobbyId(lobbyId);
	const { data: allPlayers = [] } = usePlayersList();

	const nicknameById = React.useMemo(() => {
		const map: Record<string, string> = {};
		for (const p of allPlayers) if (p.playerId && p.nickname) map[p.playerId] = p.nickname;
		return map;
	}, [allPlayers]);

	const isHost = !!(lobby?.hostPlayerId && currentPlayerId && lobby.hostPlayerId === currentPlayerId);

	const readyMap = React.useMemo(() => {
		return lobbyCtx?.context?.playerReadyMap ?? {};
	}, [lobbyCtx?.context]);

	const playerIds = React.useMemo(() => {
		const ids = new Set<string>();
		Object.keys(readyMap).forEach((id) => ids.add(id));
		lobbyPlayers.forEach((p) => p.playerId && ids.add(p.playerId));
		return Array.from(ids);
	}, [readyMap, lobbyPlayers]);

	// Navigate back to menu when FSM transitions to MAIN_MENU (after player_exit / lobby_closed)
	// Also handle edge-case where FSM is in JOIN_REQUEST (should not happen after the
	// MenuSubmodePage fix, but guard defensively).
	React.useEffect(() => {
		if (!modeCtx?.state) return;
		if (
			modeCtx.state === statesModeAutomata.MAIN_MENU ||
			modeCtx.state === statesModeAutomata.JOIN_REQUEST
		) {
			navigate('/menu', { replace: true });
		}
	}, [modeCtx?.state, navigate]);

	return (
		<>
			<DevSidebar
				automataName={WindowLobbyAutomata.name}
				stateName={getStateName(statesLobbyAutomata, lobbyCtx?.state)}
				snapshot={lobbyCtx}
			/>
			<DevSidebar
				automataName={WindowModeAutomata.name}
				stateName={getStateName(statesModeAutomata, modeCtx?.state)}
				snapshot={modeCtx}
				style={{ top: 400 }}
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
									<Button
										className="danger"
										onClick={() => lobbyId && closeLobby(lobbyId)}>
										Close Lobby
									</Button>
									<Button className="ok" onClick={() => lobbyId && startGame(lobbyId)}>
										Start Game
									</Button>
								</>
							) : (
								<>
									<Button
										className="danger"
										onClick={() => currentPlayerId && lobbyId && leaveLobby(lobbyId, currentPlayerId)}>
										Exit from Lobby
									</Button>
									<small className="muted">Waiting for host...</small>
								</>
							)}
						</div>
					</div>

					<div className="panel">
						<h4 className="section-title">Players</h4>

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
									const r = readyMap[pid] ?? 0;
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

					<RequestTable
						lobbyId={lobbyId}
						hostPlayerId={lobby?.hostPlayerId ?? null}
						currentPlayerId={currentPlayerId}
					/>
				</div>
			</div>
		</>
	);
}
