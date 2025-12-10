import React from 'react';
import WindowMenuAutomata from '~/fsm/window/WindowMenuAutomata';
import WindowModeAutomata from '~/fsm/window/WindowModeAutomata';
import { useNavigate } from 'react-router-dom';
import DevSidebar from '~/components/DevSidebar';
import JoinRequestPopup from '~/components/JoinRequestPopup';
import {
	useCreateLobby,
	useLobbiesList,
	useRequestJoinLobby,
	useJoinLobby,
} from '~/hooks/useLobbies';
import { useAuthActions, useCurrentPlayer } from '~/hooks/useAuth';
import { useFSM } from '@yantrix/react';

export default function MenuSubmodePage() {
	const { dispatch: menuDispatch } = useFSM({ id: WindowMenuAutomata.id, Automata: WindowMenuAutomata });
	const { dispatch: modeDispatch, getContext: getModeContext } = useFSM({ id: WindowModeAutomata.id, Automata: WindowModeAutomata });

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

	const { data: lobbies = [], isLoading, refetch } = useLobbiesList({
		status: 'open',
		excludeHostPLayerId: currentPlayerId ?? undefined,
	});
	const { mutateAsync: createLobby, isPending: creatingLobby } = useCreateLobby();
	const { mutateAsync: requestJoin, isPending: requesting } = useRequestJoinLobby();
	const { mutateAsync: joinLobby, isPending: joining } = useJoinLobby();

	const onCreateLobby = async () => {
		if (!currentPlayerId) return;
		const lobby = await createLobby({ hostPlayerId: currentPlayerId });
		// Прокидываем и gameId, и lobbyId в FSM-контекст
		actMenu('CREATE_LOBBY', { gameId: lobby.gameId, lobbyId: lobby.lobbyId });
		// Mode FSM тоже может знать оба идентификатора, если он сохраняет payload в контекст
		const createGame = WindowModeAutomata.getAction?.('CREATE_GAME');
		if (createGame) {
			modeDispatch({ action: createGame, payload: { gameId: lobby.gameId, lobbyId: lobby.lobbyId, playerId: currentPlayerId, isHost: 1 } });
		}
		navigate('/lobby');
		refetch();
	};

	const onJoinLobby = async (gameId: string) => {
		if (!currentPlayerId) return;
		// Находим лобби по gameId, чтобы вытащить lobbyId
		const lobby = lobbies.find(l => l.gameId === gameId) ?? null;
		const lobbyId = lobby?.lobbyId ?? null;

		actMenu('JOIN_GAME');
		actMenu('ENTER_GAME_ID', { gameId, lobbyId });
		actMenu('JOINING_GAME', { gameId, lobbyId });

		const joinId = WindowModeAutomata.getAction?.('JOIN_GAME');
		if (joinId) modeDispatch({ action: joinId, payload: { gameId, lobbyId } });

		await requestJoin({ gameId, playerId: currentPlayerId }).catch(() => {});
	};

	const modeCtx = getModeContext();
	const getState = (WindowModeAutomata.getState?.bind(WindowModeAutomata) as unknown) as (k: string) => number;
	const isJoinRequest = modeCtx?.state === getState('JOIN_REQUEST');
	const modeContextData = (modeCtx?.context ?? {}) as { gameId?: string | null; lobbyId?: string | null };
	const joinGameId = modeContextData.gameId ?? null;
	const joinLobbyId = modeContextData.lobbyId ?? null;
	const lobby = lobbies.find(l => l.gameId === joinGameId) ?? null;

	const acceptJoin = async () => {
		if (!joinGameId || !currentPlayerId) return;
		await joinLobby({ gameId: joinGameId, playerId: currentPlayerId });
		const accepted = WindowModeAutomata.getAction?.('REQUEST_ACCEPTED');
		if (accepted) modeDispatch({ action: accepted, payload: { gameId: joinGameId, lobbyId: joinLobbyId } });
		actMenu('LOBBY_JOINED', { gameId: joinGameId, lobbyId: joinLobbyId });
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
			// Reset automata states (mode + menu)
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
			{/* DevSidebar больше не может брать snapshot из useAutomata, поэтому используем getModeContext */}
			<DevSidebar automataName={WindowModeAutomata.name} stateName={String(modeCtx?.state ?? '')} snapshot={modeCtx} />

			<div className="with-dev">
				<div className="menu-page">
					<div className="menu-card">
						<h3 className="section-title" style={{ margin: 0 }}>Main Menu</h3>
						<small className="muted">Player: {currentPlayer?.nickname ?? 'Unknown'}</small>

						<div className="actions" style={{ width: '100%' }}>
							<button className="primary" onClick={onCreateLobby} disabled={creatingLobby || !currentPlayerId}>
								{creatingLobby ? 'Creating…' : 'Create Lobby'}
							</button>
						</div>

						<hr style={{ width: '100%' }} />

						<div style={{ width: '100%' }}>
							<div className="row" style={{ justifyContent: 'space-between' }}>
								<h4 className="section-title" style={{ marginTop: 0 }}>Available Lobbies</h4>
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
										<th>Game</th>
										<th>Host</th>
										<th>Max</th>
										<th>Action</th>
									</tr>
									</thead>
									<tbody>
									{lobbies.map(l => (
										<tr key={l.gameId}>
											<td>{l.gameId}</td>
											<td>{l.hostNickname}</td>
											<td>{l.maxPlayers}</td>
											<td>
												<div className="row">
													<button onClick={() => onJoinLobby(l.gameId)} disabled={requesting || joining || !currentPlayerId}>
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
								disabled={signOut.isPending}
							>
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