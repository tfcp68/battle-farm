import React from 'react';
import WindowMenuAutomata from '~/fsm/window/WindowMenuAutomata';
import WindowModeAutomata, { statesDictionary } from '~/fsm/window/WindowModeAutomata';
import { useNavigate } from 'react-router-dom';
import DevSidebar from '~/components/DevSidebar';
import JoinRequestPopup from '~/components/JoinRequestPopup';
import { useCreateLobby, useJoinLobbyById, useLobbiesList, useRequestJoinLobbyById } from '~/hooks/useLobbies';
import { useAuthActions, useCurrentPlayer } from '~/hooks/useAuth';
import { useFSM } from '@yantrix/react';
import { getStateName } from '~/helpers/fsm';
import { windowAutomataIds } from '~/yantrix/automataIds';
import { useCreateGame, useGameByLobbyId } from '~/hooks/useGame';
import { useMachines } from '~/yantrix/MachinesContext';

export default function MenuSubmodePage() {
	const { menuFSM, modeFSM } = useMachines();
	const { dispatch: menuDispatch } = useFSM({ id: windowAutomataIds.menu, Automata: menuFSM });
	const { dispatch: modeDispatch, getContext: getModeContext } = useFSM({
		id: windowAutomataIds.mode,
		Automata: modeFSM,
	});

	const navigate = useNavigate();

	const { signOut } = useAuthActions();
	const { data: currentPlayer, isLoading: loadingCurrentPlayer } = useCurrentPlayer();
	const currentPlayerId = currentPlayer?.playerId ?? null;

	React.useEffect(() => {
		const introId = WindowModeAutomata.getState?.('INTRO');
		const toMenuId = WindowModeAutomata.getAction?.('TO_MENU');
		const modeCtx = getModeContext();
		if (introId && toMenuId && modeCtx?.state === introId) {
			modeDispatch({ action: toMenuId, payload: {} });
		}
	}, [getModeContext, modeDispatch]);

	const actMenu = (name: keyof typeof WindowMenuAutomata.actions, payload: Record<string, unknown> = {}) => {
		const aId = WindowMenuAutomata.getAction?.(name);
		menuDispatch({ action: aId, payload });
	};

	const {
		data: lobbies = [],
		isLoading,
		refetch,
	} = useLobbiesList({
		status: 'open',
		excludeHostPlayerId: currentPlayerId ?? '',
	});
	const { mutateAsync: createLobby, isPending: creatingLobby } = useCreateLobby();
	const { mutateAsync: requestJoin, isPending: requesting } = useRequestJoinLobbyById();
	const { mutateAsync: joinLobby, isPending: joining } = useJoinLobbyById();
	const { mutateAsync: createGame } = useCreateGame();

	const onCreateLobby = async () => {
		if (!currentPlayerId) return;
		const lobby = await createLobby({ hostPlayerId: currentPlayerId });
		const game = await createGame({
			lobbyId: lobby.lobbyId,
		});
		actMenu('CREATE_LOBBY', { gameId: game.id, lobbyId: lobby.lobbyId });
		const createGameAction = WindowModeAutomata.getAction?.('CREATE_GAME');
		if (createGameAction) {
			modeDispatch({
				action: createGameAction,
				payload: {
					gameId: game.id,
					lobbyId: lobby.lobbyId,
					playerId: currentPlayerId,
					isHost: 1,
				},
			});
		}
		navigate('/lobby');
		refetch();
	};

	const onJoinLobby = async (lobbyId: string) => {
		if (!currentPlayerId) return;

		const actJoin = WindowModeAutomata.getAction?.('JOIN_GAME');
		if (actJoin) modeDispatch({ action: actJoin, payload: { lobbyId } });

		await requestJoin({ lobbyId, playerId: currentPlayerId });
	};

	const modeCtx = getModeContext();
	const getState = WindowModeAutomata.getState?.bind(WindowModeAutomata);
	const isJoinRequest = modeCtx?.state === getState('JOIN_REQUEST');
	const modeContextData = modeCtx?.context;
	const joinLobbyId = modeContextData.lobbyId ?? null;
	const { data: joinGame } = useGameByLobbyId(joinLobbyId);
	const joinGameId = joinGame?.id ?? modeContextData.gameId ?? null;
	const lobby = joinLobbyId ? lobbies.find((l) => l.lobbyId === joinLobbyId) ?? null : null;

	const acceptJoin = async () => {
		if (!joinLobbyId || !currentPlayerId) return;

		await joinLobby({ lobbyId: joinLobbyId, playerId: currentPlayerId });

		const resolvedGameId = joinGameId;
		const accepted = WindowModeAutomata.getAction?.('REQUEST_ACCEPTED');
		if (accepted) modeDispatch({ action: accepted, payload: { gameId: resolvedGameId, lobbyId: joinLobbyId } });
		actMenu('LOBBY_JOINED', { gameId: resolvedGameId, lobbyId: joinLobbyId });

		navigate('/lobby');
		refetch();
	};

	const cancelJoin = () => {
		const cancelId = WindowModeAutomata.getAction?.('CANCEL');
		if (cancelId) modeDispatch({ action: cancelId, payload: {} });
	};

	const handleLogout = async () => {
		try {
			await signOut.mutateAsync();
		} finally {
			const modeReset = WindowModeAutomata.getAction?.('RESET');
			if (modeReset) modeDispatch({ action: modeReset, payload: {} });

			const menuReset = WindowMenuAutomata.getAction?.('RESET');
			if (menuReset) menuDispatch({ action: menuReset, payload: {} });

			navigate('/', { replace: true });
		}
	};

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
								onClick={onCreateLobby}
								disabled={creatingLobby || !currentPlayerId}>
								{creatingLobby ? 'Creating…' : 'Create Lobby'}
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
															onClick={() => onJoinLobby(l.lobbyId)}
															disabled={requesting || joining || !currentPlayerId}>
															{requesting || joining ? '...' : 'Join'}
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>

						<hr style={{ width: '100%' }} />

						<div style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center' }}>
							<button
								className="danger"
								style={{ width: '50%' }}
								onClick={handleLogout}
								disabled={signOut.isPending}>
								{signOut.isPending ? 'Logging out…' : 'Logout'}
							</button>
						</div>
					</div>
				</div>
			</div>

			{isJoinRequest && (
				<JoinRequestPopup
					gameId={joinGameId}
					hostPlayerId={lobby?.hostPlayerId ?? null}
					onAccept={acceptJoin}
					onCancel={cancelJoin}
				/>
			)}
		</>
	);
}
