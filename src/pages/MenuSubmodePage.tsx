import React from 'react';
import { useNavigate } from 'react-router-dom';
import DevSidebar from '~/components/DevSidebar';
import JoinRequestPopup from '~/components/JoinRequestPopup';
import WindowModeAutomata, { statesDictionary } from '~/fsm/window/WindowModeAutomata';
import { useMachines } from '~/hooks/useMachines';
import { useFSM } from '@yantrix/react';
import { getStateName } from '~/helpers/fsm';
import { useMenuController } from '~/hooks/useMenuController';

import { useCurrentPlayer } from '~/hooks/useAuth';
import { useLobbiesList } from '~/hooks/useLobbies';
import { useGameByLobbyId } from '~/hooks/useGame';

export default function MenuSubmodePage() {
	const navigate = useNavigate();
	const ctrl = useMenuController();

	const { mode: modeFSM } = useMachines();

	const { getContext: getModeContext, dispatch: dispatchMode } = useFSM({
		id: modeFSM.id,
		Automata: modeFSM.instance,
	});
	const modeCtx = getModeContext();

	const { data: currentPlayer, isLoading: loadingCurrentPlayer } = useCurrentPlayer();
	const currentPlayerId = currentPlayer?.playerId ?? null;

	const {
		data: lobbies = [],
		isLoading,
		refetch,
	} = useLobbiesList({
		status: 'open',
		excludeHostPlayerId: currentPlayerId ?? '',
	});

	const getState = WindowModeAutomata.getState?.bind(WindowModeAutomata);
	const isJoinRequest = modeCtx?.state === getState('JOIN_REQUEST');
	const joinLobbyId = modeCtx?.context?.lobbyId ?? null;

	const { data: joinGame } = useGameByLobbyId(joinLobbyId);
	const joinGameId = joinGame?.id ?? modeCtx?.context?.gameId ?? null;

	const lobby = joinLobbyId ? lobbies.find((l) => l.lobbyId === joinLobbyId) ?? null : null;

	const [isJoinPopupOpen, setIsJoinPopupOpen] = React.useState(false);

	React.useEffect(() => {
		if (isJoinRequest) setIsJoinPopupOpen(false);
	}, [isJoinRequest]);

	if (loadingCurrentPlayer) {
		return (
			<div className="with-dev">
				<div className="menu-page">
					<div className="menu-card">
						<small className="muted">Loading player…</small>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<DevSidebar
				automataName={WindowModeAutomata.name}
				stateName={getStateName(statesDictionary, modeCtx.state)}
				snapshot={modeCtx}
			/>

			<div className="with-dev">
				<div className="menu-page">
					<div className="menu-card">
						<h3 className="section-title" style={{ margin: 0 }}>
							Main Menu
						</h3>
						<small className="muted">Player: {currentPlayer?.nickname ?? 'Unknown'}</small>

						<div className="actions" style={{ width: '100%' }}>
							<button
								className="primary"
								onClick={async () => {
									await ctrl.createLobby(currentPlayerId);
								}}
								disabled={!currentPlayerId}>
								Create Lobby
							</button>
						</div>

						<hr style={{ width: '100%' }} />

						<div style={{ width: '100%' }}>
							<div className="row" style={{ justifyContent: 'space-between' }}>
								<h4 className="section-title" style={{ marginTop: 0 }}>
									Available Lobbies
								</h4>
								<button onClick={() => refetch()} disabled={isLoading}>
									{isLoading ? 'Loading…' : 'Refresh'}
								</button>
							</div>

							{isLoading ? (
								<small className="muted">Loading…</small>
							) : lobbies.length === 0 ? (
								<small className="muted">No open lobbies. Create one!</small>
							) : (
								<div className="table-scroll">
									<table className="table" style={{ width: '100%' }}>
										<thead>
											<tr>
												<th>Lobby</th>
												<th>Host</th>
												<th>Max</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{lobbies.map((l) => (
												<tr key={l.lobbyId}>
													<td>{l.lobbyId}</td>
													<td>{l.hostNickname}</td>
													<td>{l.maxPlayers}</td>
													<td>
														<div className="row">
															<button
																onClick={() => {
																	if (!currentPlayerId) return;
																	// First: move FSM to JOIN_REQUEST. That will emit join_game_request.
																	dispatchMode({
																		action: WindowModeAutomata.getAction(
																			'JOIN_GAME'
																		),
																		payload: { gameId: null, lobbyId: l.lobbyId },
																	});
																	// Then: perform DB write explicitly (src='ui' guarded on destination).
																	ctrl.requestJoin(l.lobbyId, currentPlayerId);
																}}
																disabled={!currentPlayerId}>
																Join
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>

						<hr style={{ width: '100%' }} />

						<div style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center' }}>
							<button className="danger" style={{ width: '50%' }} onClick={() => ctrl.logout()}>
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>

			{isJoinRequest && !isJoinPopupOpen && (
				<JoinRequestPopup
					gameId={joinGameId}
					hostPlayerId={lobby?.hostPlayerId ?? null}
					onAccept={() => {
						if (!joinLobbyId || !currentPlayerId) return;
						ctrl.acceptJoin(joinLobbyId, currentPlayerId, joinGameId);
						navigate('/lobby', { replace: true });
					}}
					onCancel={() => {
						setIsJoinPopupOpen(true);
						ctrl.cancelJoin();
					}}
				/>
			)}
		</>
	);
}

