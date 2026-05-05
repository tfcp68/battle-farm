import React from 'react';
import { usePlayersList } from '~/entities/player/queries';
import { useLobbyPlayersByLobbyId, useLobbyRequestsByLobbyId } from '~/entities/lobby/queries';
import { useServices } from '~/app/providers/AppServicesProvider';
import { Button } from '~/shared/ui/components/button';

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
		() => requests.filter((r) => r.status === 'pending'),
		[requests]
	);

	const [loadingId, setLoadingId] = React.useState<string | null>(null);
	const [manualRefreshing, setManualRefreshing] = React.useState(false);

	if (!isHost) return null;

	return (
		<div className="panel">
			<div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
				<h4 className="section-title">Join Requests</h4>
			<Button
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
			</Button>
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
									<small className="muted">No pending requests</small>
								</td>
							</tr>
						) : (
							pendingRequests.map((r) => (
								<tr key={r.id}>
									<td>{nicknameById[r.playerId] ?? r.playerId}</td>
									<td>
										<div className="row">
						<Button
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
											Accept
										</Button>
										<Button
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
											Reject
										</Button>
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

