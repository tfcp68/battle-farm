import React from 'react';
import RequestTable from '~/widgets/RequestTable';
import { useMachines } from '~/app/providers/MachinesContext';
import { useFSM } from '@yantrix/react';
import { useLobbyById, useLobbyPlayersByLobbyId, useLobbyRequestsRealtime } from '~/entities/lobby/queries';
import { usePlayersList } from '~/entities/player/queries';
import { useCurrentPlayer } from '~/entities/auth/queries';
import { useLocation } from 'react-router-dom';
import { TLobbySettings, TWindowModeContext } from '~/shared/types/types';
import { useManageLobby } from '~/features/manage-lobby/useManageLobby';
import { Button } from '~/shared/ui/components/button';
import { selectIsHost, selectNicknameById, selectPlayerIds, selectReadyMap } from '~/shared/lib/fsm/selectors';

export default function LobbySubmodePage() {
	const { closeLobby, leaveLobby, startGame } = useManageLobby();

	const { lobby: lobbyFSM, mode: modeFSM } = useMachines();
	const { getContext: getLobbyContext } = useFSM<TLobbySettings>(lobbyFSM.instance);
	const { getContext: getModeContext } = useFSM<TWindowModeContext>(modeFSM.instance);

	const lobbyCtx = getLobbyContext();
	const modeCtx = getModeContext();

	const location = useLocation();
	const lobbyId = modeCtx?.context?.lobbyId ?? location.state?.lobbyId ?? null;

	const { data: currentPlayer } = useCurrentPlayer();
	const currentPlayerId = currentPlayer?.playerId ?? null;

	useLobbyRequestsRealtime(lobbyId);

	const { data: lobby } = useLobbyById(lobbyId);
	const { data: lobbyPlayers = [] } = useLobbyPlayersByLobbyId(lobbyId);
	const { data: allPlayers = [] } = usePlayersList();

	const readyMap = selectReadyMap(lobbyCtx);
	const nicknameById = selectNicknameById(allPlayers);
	const playerIds = selectPlayerIds(readyMap, lobbyPlayers);
	const isHost = selectIsHost(lobby?.hostPlayerId, currentPlayerId);

	return (
		<>
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
									<Button className="danger" onClick={() => lobbyId && closeLobby(lobbyId)}>
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
										onClick={() =>
											currentPlayerId && lobbyId && leaveLobby(lobbyId, currentPlayerId)
										}>
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
