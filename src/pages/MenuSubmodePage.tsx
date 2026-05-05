import React from 'react';
import { useNavigate } from 'react-router-dom';
import DevSidebar from '~/widgets/DevSidebar';
import JoinRequestPopup from '~/shared/ui/JoinRequestPopup';
import WindowModeAutomata, { statesDictionary } from '~/shared/lib/fsm/window/WindowModeAutomata';
import { useMachines } from '~/app/providers/MachinesContext';
import { useFSM } from '@yantrix/react';
import { getStateName } from '~/shared/helpers/fsm';
import { useCurrentPlayer } from '~/entities/auth/queries';
import { lobbyKeys, useLobbiesList, useLobbyRequestsByLobbyId } from '~/entities/lobby/queries';
import { useGameByLobbyId } from '~/entities/game/queries';
import { emitDomainEvent } from '~/app/yantrix/sources/uiBridgeSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { TWindowModeContext } from '~/shared/types/types';
import { useCreateLobby } from '~/features/create-lobby/useCreateLobby';
import { useJoinLobby } from '~/features/join-lobby/useJoinLobby';
import { useAuthActions } from '~/features/auth/useAuthActions';
import { useQueryClient } from '@tanstack/react-query';

export default function MenuSubmodePage() {
	const navigate = useNavigate();
	const { createLobby } = useCreateLobby();
	const { requestJoin, cancelJoin } = useJoinLobby();
	const { signOut } = useAuthActions();

	const { mode: modeFSM } = useMachines();

	const { getContext: getModeContext, dispatch: dispatchMode } = useFSM<TWindowModeContext>({
		id: modeFSM.id,
		Automata: modeFSM.instance,
	});
	const modeCtx = getModeContext();

	const { data: currentPlayer, isLoading: loadingCurrentPlayer } = useCurrentPlayer();
	const currentPlayerId = currentPlayer?.playerId ?? null;

	const { data: lobbies = [], isLoading, refetch } = useLobbiesList({ status: 'open' });

	const getState = WindowModeAutomata.getState?.bind(WindowModeAutomata);
	const isJoinRequest = modeCtx?.state === getState('JOIN_REQUEST');
	const joinLobbyId = modeCtx?.context?.lobbyId ?? null;

	const { data: joinGame } = useGameByLobbyId(joinLobbyId);
	const joinGameId = joinGame?.id ?? modeCtx?.context?.gameId ?? null;

	const lobby = joinLobbyId ? lobbies.find((l) => l.lobbyId === joinLobbyId) ?? null : null;

	const [isJoinPopupOpen, setIsJoinPopupOpen] = React.useState(false);
	const cancelledByMeRef = React.useRef(false);
	const [isCreatingLobby, setIsCreatingLobby] = React.useState(false);

	React.useEffect(() => {
		if (isJoinRequest) cancelledByMeRef.current = false;
	}, [isJoinRequest]);

	const lobbyId = modeCtx?.context?.lobbyId;
	const qc = useQueryClient();

	// Poll the current player's join request status (refetch every 1.5s while in JOIN_REQUEST state)
	const { data: allRequestsForLobby } = useLobbyRequestsByLobbyId(isJoinRequest && lobbyId ? lobbyId : null);
	// Manually trigger polling via useEffect while waiting for join approval
	React.useEffect(() => {
		if (!isJoinRequest || !lobbyId) return;
		const timer = setInterval(() => {
			qc.invalidateQueries({ queryKey: lobbyKeys.requestsByLobbyId(lobbyId) });
		}, 1500);
		return () => clearInterval(timer);
	}, [isJoinRequest, lobbyId, qc]);

	const myJoinRequest = React.useMemo(
		() => (allRequestsForLobby ?? []).find((r) => r.playerId === currentPlayerId) ?? null,
		[allRequestsForLobby, currentPlayerId]
	);

	// Navigate when join request is approved or rejected
	React.useEffect(() => {
		if (!isJoinRequest) return;
		if (myJoinRequest?.status === 'approved') {
			dispatchMode({
				action: WindowModeAutomata.getAction('REQUEST_ACCEPTED'),
				payload: { lobbyId: joinLobbyId, playerId: currentPlayerId },
			});
			navigate('/lobby', { replace: true });
		} else if (myJoinRequest?.status === 'rejected') {
			// Transition FSM: JOIN_REQUEST → MAIN_MENU via CANCEL action.
			dispatchMode({
				action: WindowModeAutomata.getAction('CANCEL'),
				payload: {},
			});
			setIsJoinPopupOpen(false);
			navigate('/menu', { replace: true });
		}
	}, [myJoinRequest, isJoinRequest, navigate, dispatchMode, joinLobbyId, currentPlayerId]);

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
								onClick={() => {
									if (isCreatingLobby || !currentPlayerId) return;
									setIsCreatingLobby(true);
									createLobby(currentPlayerId);
									// Reset creating state after a brief moment to avoid double-clicks
									setTimeout(() => setIsCreatingLobby(false), 2000);
								}}
								disabled={!currentPlayerId || isCreatingLobby}>
								{isCreatingLobby ? 'Creating…' : 'Create Lobby'}
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
																	if (l.hostPlayerId === currentPlayerId) {
																		// Re-enter own lobby
																		navigate('/lobby', {
																			replace: true,
																			state: { lobbyId: l.lobbyId },
																		});
																		emitDomainEvent(
																			WindowDomainEvents.lobby_created,
																			{
																				gameId: null,
																				isHost: 1,
																				lobbyId: l.lobbyId,
																				playerId: currentPlayerId,
																			}
																		);
																		return;
																	}
																	dispatchMode({
																		action: WindowModeAutomata.getAction(
																			'JOIN_GAME'
																		),
																		payload: { gameId: null, lobbyId: l.lobbyId },
																	});
																	requestJoin(l.lobbyId, currentPlayerId);
																	setIsJoinPopupOpen(true);
																}}
																disabled={!currentPlayerId}>
																{l.hostPlayerId === currentPlayerId ? 'Enter' : 'Join'}
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
							<button className="danger" style={{ width: '50%' }} onClick={() => signOut.mutate()}>
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>

			{isJoinRequest && isJoinPopupOpen && (
				<JoinRequestPopup
					gameId={joinGameId}
					hostPlayerId={lobby?.hostPlayerId ?? null}
					onCancel={() => {
						cancelledByMeRef.current = true;
						setIsJoinPopupOpen(false);
						cancelJoin();
					}}
				/>
			)}
		</>
	);
}

