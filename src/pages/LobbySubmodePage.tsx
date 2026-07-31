import React from 'react';
import RequestTable from '~/widgets/RequestTable';
import { useMachines } from '~/app/providers/MachinesContext';
import { useFSM } from '@yantrix/react';
import { useLobbyById, useLobbyPlayersByLobbyId } from '~/entities/lobby/queries';
import { useCurrentProfile } from '~/entities/profile/queries';
import { useLocation } from 'react-router-dom';
import { TLobbySettings, TWindowModeContext } from '~/shared/types/types';
import { useManageLobby } from '~/features/manage-lobby/useManageLobby';
import { Button } from '~/shared/ui/components/button';
import { buildRoomLink } from '~/shared/net/roomLink';
import { selectIsHost, selectNicknameById, selectPlayerIds, selectReadyMap } from '~/shared/lib/fsm/selectors';

export default function LobbySubmodePage() {
	const { closeLobby, leaveLobby } = useManageLobby();

	const { lobby: lobbyFSM, mode: modeFSM } = useMachines();
	const { getContext: getLobbyContext } = useFSM<TLobbySettings>(lobbyFSM.instance);
	const { getContext: getModeContext } = useFSM<TWindowModeContext>(modeFSM.instance);

	const lobbyCtx = getLobbyContext();
	const modeCtx = getModeContext();

	const location = useLocation();
	const lobbyId = modeCtx?.context?.lobbyId ?? location.state?.lobbyId ?? null;

	const { data: profile } = useCurrentProfile();
	const currentPlayerId = profile?.playerId ?? null;

	const { data: lobby } = useLobbyById(lobbyId);
	const { data: lobbyPlayers = [] } = useLobbyPlayersByLobbyId(lobbyId);

	const readyMap = selectReadyMap(lobbyCtx);
	const nicknameById = selectNicknameById(lobbyPlayers);
	const playerIds = selectPlayerIds(readyMap, lobbyPlayers);
	const isHost = selectIsHost(lobby?.hostPlayerId, currentPlayerId);

	const [copied, setCopied] = React.useState<'code' | 'link' | null>(null);
	const copy = async (kind: 'code' | 'link') => {
		if (!lobbyId) return;
		try {
			await navigator.clipboard.writeText(kind === 'link' ? buildRoomLink(lobbyId) : lobbyId);
			setCopied(kind);
			setTimeout(() => setCopied(null), 1500);
		} catch {
			/* clipboard denied — the code is on screen anyway */
		}
	};

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

						<div className="row" style={{ alignItems: 'center', gap: 8 }}>
							<span className="muted">Room code:</span>
							<strong data-testid="room-code" style={{ letterSpacing: 2 }}>
								{lobbyId ?? '—'}
							</strong>
							<Button className="primary" onClick={() => copy('link')} disabled={!lobbyId}>
								{copied === 'link' ? 'Copied' : 'Copy invite link'}
							</Button>
							<Button onClick={() => copy('code')} disabled={!lobbyId}>
								{copied === 'code' ? 'Copied' : 'Copy code'}
							</Button>
						</div>
						<small className="muted">
							Share the link and the room opens on its own — or read out the code. Either way, it is
							the only way in.
						</small>

						<div className="row">
							{isHost ? (
								<>
									<Button className="danger" onClick={() => lobbyId && closeLobby(lobbyId)}>
										Close Lobby
									</Button>
									{/* Starting a game is not wired to the network yet — see the
									    P2P spec: this iteration covers the lobby only. */}
									<Button className="ok" disabled title="Coming soon — the game is not networked yet">
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
