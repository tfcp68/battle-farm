import React from 'react';
import WindowLobbyAutomata from '~/fsm/window/WindowLobbyAutomata';
import WindowModeAutomata from '~/fsm/window/WindowModeAutomata';
import DevSidebar from '~/components/DevSidebar';
import { useNavigate } from 'react-router-dom';
import {
	useLobby,
	useLobbyById,
	useLobbyPlayersByLobbyId,
	useLobbyRequestsByLobbyId,
	useApproveJoin,
	useRejectJoin,
	useCloseLobbyById,
	useLeaveLobbyById,
	useSetPlayerReadyByLobbyId,
} from '~/hooks/useLobbies';
import { usePlayersList } from '~/hooks/usePlayers';
import { Switch } from '~/components/ui/switch';
import { useFSM } from '@yantrix/react';
import { registerAutomataToCoreLoop } from '~/yantrix/coreLoop';

export default function LobbySubmodePage() {
	const {getContext: getLobbyContext, dispatch: lobbyDispatch, getInstanceAutomata: getLobbyInstance} = useFSM({
		id: WindowLobbyAutomata.id,
		Automata: WindowLobbyAutomata,
	});
	const {dispatch: modeDispatch, getContext: getModeContext, getInstanceAutomata: getModeInstance} = useFSM({
		id: WindowModeAutomata.id,
		Automata: WindowModeAutomata,
	});

	registerAutomataToCoreLoop(getLobbyInstance())
	registerAutomataToCoreLoop(getModeInstance())

	const navigate = useNavigate();

	const modeCtx = getModeContext()
	const lobbyCtx = getLobbyContext();
	// gameId остаётся доменным идентификатором для FSM и UI
	const gameId = modeCtx?.gameId ?? null;
	const isHost = (modeCtx?.isHost ?? 0) === 1;
	const fsmPlayerId = modeCtx?.playerId ?? null;

	const act = (name: keyof typeof WindowLobbyAutomata.actions, payload: Record<string, unknown> = {}) => {
		const action = WindowLobbyAutomata.createAction(name, payload);
		lobbyDispatch(action);
	};

	React.useEffect(() => {
		if (!gameId || !fsmPlayerId) return;
		act('CREATE_GAME', { gameId, playerId: fsmPlayerId, isHost: isHost ? 1 : 0 });
	}, [gameId, fsmPlayerId, isHost, act]);

	// Лобби по gameId и lobbyId
	const { data: lobbyByGame, isLoading: lobbyLoadingByGame } = useLobby(gameId);
	const lobbyId: string | null = lobbyByGame?.lobbyId ?? null;
	const { data: lobbyById, isLoading: lobbyLoadingById } = useLobbyById(lobbyId);
	const lobby = lobbyById ?? lobbyByGame ?? null;

	// Игроки лобби и запросы
	const {
		data: lobbyPlayers = [],
		isLoading: playersLoading,
		refetch: refetchPlayers,
	} = useLobbyPlayersByLobbyId(lobbyId);
	const {
		data: requests = [],
		isLoading: requestsLoading,
		refetch: refetchRequests,
	} = useLobbyRequestsByLobbyId(lobbyId);

	// Подтягиваем весь список players один раз и строим map по id
	const { data: allPlayers = [] } = usePlayersList();
	const nicknameById: Record<string, string> = React.useMemo(() => {
		const map: Record<string, string> = {};
		for (const p of allPlayers) {
			if (p.playerId && p.nickname) {
				map[p.playerId] = p.nickname;
			}
		}
		return map;
	}, [allPlayers]);

	const hostId = lobby?.hostPlayerId ?? null;
	// всегда стараться показывать ник, id больше не используем как "имя"
	const hostDisplay = hostId && nicknameById[hostId]
		? nicknameById[hostId]
		: 'Unknown host';

	const { mutateAsync: approveJoin, isPending: approving } = useApproveJoin();
	const { mutateAsync: rejectJoin, isPending: rejecting } = useRejectJoin();
	const { mutateAsync: closeLobbyById, isPending: closing } = useCloseLobbyById();
	const { mutateAsync: leaveLobbyById, isPending: leaving } = useLeaveLobbyById();
	const { mutateAsync: setReady, isPending: settingReady } = useSetPlayerReadyByLobbyId();

	const playerReadyMap = lobbyCtx.playerReadyMap as Record<string, 0 | 1> | undefined;
	// readyMap из FSM + union с реальными игроками, чтобы никого не терять
	const readyMap: Record<string, 0 | 1> = React.useMemo(() => {
		return playerReadyMap ?? {};
	}, [playerReadyMap]);
	const playerIds: string[] = React.useMemo(() => {
		const ids = new Set<string>();
		Object.keys(readyMap).forEach(id => ids.add(id));
		lobbyPlayers.forEach(p => {
			if (p.playerId) ids.add(p.playerId);
		});
		return Array.from(ids);
	}, [readyMap, lobbyPlayers]);

	// current player ready state from FSM map
	const myPlayerId = fsmPlayerId;
	const myLobbyId = lobbyId;
	const myReadyValue: 0 | 1 = myPlayerId && readyMap[myPlayerId] !== undefined ? readyMap[myPlayerId] : 0;
	const myReadyChecked = myReadyValue === 1;

	const startGame = async () => {
		act('LAUNCH');
	};

	const onClose = async () => {
		if (!lobbyId) return;
		try {
			await closeLobbyById(lobbyId);
		} finally {
			const exit = WindowModeAutomata.createAction('EXIT', {});
			modeDispatch(exit);
			navigate('/menu', { replace: true });
		}
	};

	const onLeave = async () => {
		if (!lobbyId || !fsmPlayerId) return;
		try {
			await leaveLobbyById({ lobbyId, playerId: fsmPlayerId });
		} finally {
			const exit = WindowModeAutomata.createAction('EXIT', {});
			modeDispatch(exit);
			navigate('/menu', { replace: true });
		}
	};

	const onToggleReady = async (checked: boolean) => {
		if (!myLobbyId || !myPlayerId) return;
		await setReady({ lobbyId: myLobbyId, playerId: myPlayerId, isReady: checked });
	};

	const doApprove = async (requestId: string) => {
		await approveJoin(requestId);
		await refetchRequests();
		await refetchPlayers();
	};
	const doReject = async (requestId: string) => {
		await rejectJoin(requestId);
		await refetchRequests();
	};

	if (!gameId) return <div>Нет gameId в контексте</div>;
	if (lobbyLoadingByGame || lobbyLoadingById) return <div>Загрузка лобби…</div>;
	if (!lobby || !lobbyId) return <div>Лобби не найдено</div>;

	const lobbyCtxSnapshot = lobbyCtx;
	const lobbyStateName = String(lobbyCtxSnapshot?.state ?? '');

	return (
		<>
			<DevSidebar automataName={WindowLobbyAutomata.name} stateName={lobbyStateName} snapshot={lobbyCtxSnapshot} />

			<div className="with-dev">
				<div className="grid">
					<div className="panel">
						<div className="row" style={{ justifyContent: 'space-between' }}>
							<h3 className="section-title" style={{ margin: 0 }}>Lobby</h3>
							<small className="muted">
								Game: {gameId ?? '—'} · Host: {hostDisplay} · лимит: {lobby?.maxPlayers ?? '—'}
							</small>
						</div>

						<div className="row">
							{isHost ? (
								<>
									<button className="danger" onClick={onClose} disabled={closing}>
										{closing ? 'Закрываем…' : 'Close Lobby'}
									</button>
									<button className="ok" onClick={startGame}>Start Game</button>
								</>
							) : (
								<>
									<button className="danger" onClick={onLeave} disabled={leaving}>
										{leaving ? 'Выходим…' : 'Exit Lobby'}
									</button>
									<small className="muted">Waiting for host...</small>
								</>
							)}
						</div>
					</div>

					<div className="panel">
						<h4 className="section-title">Players</h4>
						{myPlayerId && (
							<div className="row" style={{ alignItems: 'center', marginBottom: 8 }}>
								<small className="muted" style={{ marginRight: 8 }}>Your status:</small>
								<Switch
									checked={myReadyChecked}
									onCheckedChange={onToggleReady}
									disabled={settingReady || !myLobbyId}
								/>
								<small className="muted" style={{ marginLeft: 8 }}>
									{myReadyChecked ? 'Ready' : 'Not ready'}
								</small>
							</div>
						)}
						{playersLoading ? (
							<div>Загрузка игроков…</div>
						) : (
							<table className="table" style={{ marginTop: 8 }}>
								<thead>
								<tr>
									<th>Player</th>
									<th>Host</th>
									<th>Ready</th>
								</tr>
								</thead>
								<tbody>
								{playerIds.length === 0 && (
									<tr><td colSpan={3}><small className="muted">No players yet</small></td></tr>
								)}
								{playerIds.map(pid => {
									const isRowHost = lobby?.hostPlayerId === pid;
									const r = readyMap[pid] ?? 0;
									const nickname = nicknameById[pid] ?? 'Unknown player';
									return (
										<tr key={pid}>
											<td>{nickname}</td>
											<td style={{ color: isRowHost ? 'var(--ok)' : 'var(--muted)' }}>{isRowHost ? 'Yes' : '—'}</td>
											<td style={{ color: r ? 'var(--ok)' : 'var(--warn)' }}>{r ? 'Ready' : 'Not Ready'}</td>
										</tr>
									);
								})}
								</tbody>
							</table>
						)}
						<small className="muted">Auto-launch is handled by FSM predicates. Your Ready state is synced via lobby players.</small>
					</div>

					{isHost && (
						<div className="panel">
							<h4 className="section-title">Join Requests</h4>
							<div className="row" style={{ justifyContent: 'flex-start' }}>
								<button onClick={() => refetchRequests()} disabled={requestsLoading}>
									{requestsLoading ? 'Loading…' : 'Refresh'}
								</button>
							</div>
							<table className="table" style={{ marginTop: 8 }}>
								<thead>
								<tr>
									<th>Player</th>
									<th>Nickname</th>
									<th>Actions</th>
								</tr>
								</thead>
								<tbody>
								{(requests ?? []).length === 0 && (
									<tr><td colSpan={3}><small className="muted">No requests</small></td></tr>
								)}
								{(requests ?? []).map(r => {
									const nickname = r.playerId ? nicknameById[r.playerId] ?? r.playerId : '—';
									return (
										<tr key={r.id ?? `${r.playerId}-${r.createdAt ?? ''}`}>
											<td>{r.playerId}</td>
											<td>{nickname}</td>
											<td>
												<div className="row">
													<button className="ok" onClick={() => r.id && doApprove(r.id)} disabled={approving || !r.id}>Approve</button>
													<button className="danger" onClick={() => r.id && doReject(r.id)} disabled={rejecting || !r.id}>Reject</button>
												</div>
											</td>
										</tr>
									);
								})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</>
	);
}