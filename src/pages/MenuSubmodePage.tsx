import React from 'react';
import JoinRequestPopup from '~/shared/ui/JoinRequestPopup';
import { Button } from '~/shared/ui/components/button';
import { statesDictionary } from '~/shared/lib/fsm/window/WindowModeAutomata';
import { useMachines } from '~/app/providers/MachinesContext';
import { useFSM } from '@yantrix/react';
import { useCurrentPlayer } from '~/entities/auth/queries';
import { useLobbiesList } from '~/entities/lobby/queries';
import { useGameByLobbyId } from '~/entities/game/queries';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { TWindowModeContext } from '~/shared/types/types';
import { useCreateLobby } from '~/features/create-lobby/useCreateLobby';
import { useJoinLobby } from '~/features/join-lobby/useJoinLobby';
import { useAuthActions } from '~/features/auth/useAuthActions';
import { selectIsJoinRequest, selectJoinLobbyId } from '~/shared/lib/fsm/selectors';

export default function MenuSubmodePage() {
	const { createLobby } = useCreateLobby();
	const { requestJoin, cancelJoin } = useJoinLobby();
	const { signOut } = useAuthActions();

	const { mode: modeFSM } = useMachines();
	const { getContext: getModeContext } = useFSM<TWindowModeContext>(modeFSM.instance);
	const modeCtx = getModeContext();

	const { data: currentPlayer, isLoading: loadingCurrentPlayer } = useCurrentPlayer();
	const currentPlayerId = currentPlayer?.playerId ?? null;

	const { data: lobbies = [], isLoading, refetch } = useLobbiesList({ status: 'open' });

	const isJoinRequest = selectIsJoinRequest(modeCtx?.state);
	const joinLobbyId = selectJoinLobbyId(modeCtx);
	const joinGameId = modeCtx?.context?.gameId ?? null;
	const didTimeOut = modeCtx?.context?.timedOut === 1;

	const { data: joinGame } = useGameByLobbyId(joinLobbyId);
	const resolvedJoinGameId = joinGame?.id ?? joinGameId;

	const lobby = joinLobbyId ? lobbies.find((l) => l.lobbyId === joinLobbyId) ?? null : null;

	const isCreatingLobby =
		modeCtx?.state === statesDictionary.MAIN_MENU
			? false
			: modeCtx?.state !== statesDictionary.MAIN_MENU && !isJoinRequest;

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
			<div className="with-dev">
				<div className="menu-page">
					<div className="menu-card">
						<h3 className="section-title" style={{ margin: 0 }}>
							Main Menu
						</h3>
						<small className="muted">Player: {currentPlayer?.nickname ?? 'Unknown'}</small>

						<div className="actions" style={{ width: '100%' }}>
							<Button
								className="primary"
								onClick={() => {
									if (!currentPlayerId) return;
									createLobby(currentPlayerId);
								}}
								disabled={!currentPlayerId || isCreatingLobby}>
								{isCreatingLobby ? 'Creating…' : 'Create Lobby'}
							</Button>
						</div>

						<hr style={{ width: '100%' }} />

						<div style={{ width: '100%' }}>
							<div className="row" style={{ justifyContent: 'space-between' }}>
								<h4 className="section-title" style={{ marginTop: 0 }}>
									Available Lobbies
								</h4>
								<Button onClick={() => refetch()} disabled={isLoading}>
									{isLoading ? 'Loading…' : 'Refresh'}
								</Button>
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
															<Button
																onClick={() => {
																	if (!currentPlayerId) return;
																	if (l.hostPlayerId === currentPlayerId) {
																		emitDomainEvent(
																			WindowDomainEvents.re_enter_lobby,
																			{
																				lobbyId: l.lobbyId,
																				playerId: currentPlayerId,
																				isHost: 1,
																			}
																		);
																		return;
																	}
																	requestJoin(l.lobbyId, currentPlayerId);
																}}
																disabled={!currentPlayerId}>
																{l.hostPlayerId === currentPlayerId ? 'Enter' : 'Join'}
															</Button>
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

						{didTimeOut && !isJoinRequest && (
							<div
								role="alert"
								data-testid="join-request-timeout-notice"
								style={{ width: '100%', padding: 8, textAlign: 'center', color: '#a40' }}>
								Your join request timed out. Try again.
							</div>
						)}

						<div style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center' }}>
							<Button className="danger" style={{ width: '50%' }} onClick={() => signOut()}>
								Logout
							</Button>
						</div>
					</div>
				</div>
			</div>

			{isJoinRequest && (
				<JoinRequestPopup
					gameId={resolvedJoinGameId}
					hostPlayerId={lobby?.hostPlayerId ?? null}
					onCancel={() => cancelJoin()}
				/>
			)}
		</>
	);
}
