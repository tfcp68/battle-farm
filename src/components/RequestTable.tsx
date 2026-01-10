import React from 'react';
import { usePlayersList } from '~/hooks/usePlayers';
import { useLobbyPlayersByLobbyId, useLobbyRequestsByLobbyId } from '~/hooks/useLobbies';
import { useServices } from '~/providers/AppServicesProvider';

type RequestTableProps = {
	lobbyId: string | null | undefined;
	hostPlayerId: string | null | undefined;
	currentPlayerId: string | null | undefined;
};

export default function RequestTable({ lobbyId, hostPlayerId, currentPlayerId }: RequestTableProps) {
	const isHost = !!(lobbyId && hostPlayerId && currentPlayerId && hostPlayerId === currentPlayerId);
	const { controllers } = useServices();

	const { data: requests = [], refetch: refetchRequests, isFetching } = useLobbyRequestsByLobbyId(lobbyId || null);
	const { refetch: refetchPlayers } = useLobbyPlayersByLobbyId(lobbyId || null);
	const { data: allPlayers = [] } = usePlayersList();

	const nicknameById: Record<string, string> = React.useMemo(() => {
		const map: Record<string, string> = {};
		for (const p of allPlayers) if (p.playerId && p.nickname) map[p.playerId] = p.nickname;
		return map;
	}, [allPlayers]);

	const pendingRequests = React.useMemo(
		() => (requests || []).filter((r: any) => r.status === 'pending'),
		[requests]
	);

	const [loadingId, setLoadingId] = React.useState<string | null>(null);
	const [manualRefreshing, setManualRefreshing] = React.useState(false);

	if (!isHost) return null;

	return (
		<div className="panel">
			<div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
				<h4 className="section-title">Join Requests</h4>
				<button
					className="secondary"
					disabled={isFetching || manualRefreshing}
					onClick={async () => {
						try {
							setManualRefreshing(true);
							await Promise.all([refetchRequests(), refetchPlayers()]);
						} finally {
							setManualRefreshing(false);
						}
					}}>
					Refresh
				</button>
			</div>
			<div className="table-scroll" style={{ marginTop: 8 }}>
				<table className="table" style={{ width: '100%' }}>
					<thead>
						<tr>
							<th>Player</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{isFetching ? (
							<tr>
								<td colSpan={2}>
									<small className="muted">Loading…</small>
								</td>
							</tr>
						) : pendingRequests.length === 0 ? (
							<tr>
								<td colSpan={2}>
									<small className="muted">No requests</small>
								</td>
							</tr>
						) : (
							pendingRequests.map((r: any) => (
								<tr key={r.id}>
									<td>{nicknameById[r.playerId] ?? r.playerId}</td>
									<td>
										<div className="row">
											<button
												className="ok"
												disabled={loadingId === r.id}
												onClick={async () => {
													try {
														setLoadingId(r.id);
														await controllers.lobbies.approveRequest(r.id);
													} finally {
														setLoadingId(null);
														await Promise.all([refetchRequests(), refetchPlayers()]);
													}
												}}>
												Принять
											</button>
											<button
												className="danger"
												disabled={loadingId === r.id}
												onClick={async () => {
													try {
														setLoadingId(r.id);
														await controllers.lobbies.rejectRequest(r.id);
													} finally {
														setLoadingId(null);
														await refetchRequests();
													}
												}}
												style={{ marginLeft: 8 }}>
												Отклонить
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
