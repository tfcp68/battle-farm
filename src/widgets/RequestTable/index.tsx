import React from 'react';
import { usePlayersList } from '~/entities/player/queries';
import { useLobbyRequestsByLobbyId } from '~/entities/lobby/queries';
import { useLobbyRequests } from '~/features/lobby-requests/useLobbyRequests';
import { Button } from '~/shared/ui/components/button';
import { selectIsHost, selectNicknameById, selectPendingRequests } from '~/shared/lib/fsm/selectors';

type RequestTableProps = {
	lobbyId: string | null | undefined;
	hostPlayerId: string | null | undefined;
	currentPlayerId: string | null | undefined;
};

export default function RequestTable({ lobbyId, hostPlayerId, currentPlayerId }: RequestTableProps) {
	const isHost = selectIsHost(hostPlayerId, currentPlayerId);
	const { approve, reject } = useLobbyRequests();

	const { data: requests = [], isFetching } = useLobbyRequestsByLobbyId(lobbyId || null);
	const { data: allPlayers = [] } = usePlayersList();

	const nicknameById   = selectNicknameById(allPlayers);
	const pendingRequests = selectPendingRequests(requests);

	const [loadingId, setLoadingId] = React.useState<string | null>(null);

	if (!isHost) return null;

	return (
		<div className="panel">
			<div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
				<h4 className="section-title">Join Requests</h4>
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
												onClick={() => {
													if (!lobbyId) return;
													setLoadingId(r.id);
													approve(r.id, lobbyId);
													// Loading clears when query invalidation causes re-render.
													// Optimistic: reset after brief delay.
													setTimeout(() => setLoadingId(null), 1500);
												}}>
												Accept
											</Button>
											<Button
												className="danger"
												disabled={loadingId === r.id}
												onClick={() => {
													if (!lobbyId) return;
													setLoadingId(r.id);
													reject(r.id, lobbyId);
													setTimeout(() => setLoadingId(null), 1500);
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
