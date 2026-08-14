import { useFSM } from '@yantrix/react';
import { leaderOf, scoreBoard } from '~/entities/game';
import { useMachines } from '~/app/providers/MachinesContext';
import { useMatch, useViewerId } from '~/app/yantrix/useGameModel';
import { useManageLobby } from '~/features/manage-lobby/useManageLobby';
import { TWindowModeContext } from '~/shared/types/types';

/**
 * The final standing.
 *
 * Read off the model rather than the `game_end` payload: the match is still
 * there in FINISHED, and the model knows the nicknames the score board only has
 * ids for.
 */
export default function ScorePage() {
	const match = useMatch();
	const viewerId = useViewerId();
	const { mode } = useMachines();
	const { getContext } = useFSM<TWindowModeContext>(mode.instance);
	const { leaveLobby } = useManageLobby();

	const lobbyId = getContext()?.context?.lobbyId ?? null;

	if (!match) {
		return (
			<div className="panel">
				<h3 className="section-title">No results</h3>
				<small className="muted">This session has no finished match.</small>
			</div>
		);
	}

	const scores = scoreBoard(match);
	const winner = leaderOf(match);
	const standing = [...match.order].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
	const winnerName = winner ? (match.players[winner]?.nickname ?? winner) : '—';

	return (
		<div className="grid">
			<div className="panel">
				<h3 className="section-title">{winner === viewerId ? 'You win' : `${winnerName} wins`}</h3>
				<small className="muted">
					Win limit was {match.winLimit}; the match ran {match.turn.number} turns.
				</small>
			</div>

			<div className="panel">
				<table className="table">
					<thead>
						<tr>
							<th>#</th>
							<th>Player</th>
							<th>Coins</th>
						</tr>
					</thead>
					<tbody>
						{standing.map((playerId, index) => (
							<tr key={playerId}>
								<td>{index + 1}</td>
								<td>
									{match.players[playerId]?.nickname ?? playerId}
									{playerId === viewerId ? ' (you)' : ''}
								</td>
								<td>{scores[playerId] ?? 0}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="row">
				<button
					type="button"
					className="primary"
					onClick={() => lobbyId && viewerId && leaveLobby(lobbyId, viewerId)}>
					Back to menu
				</button>
			</div>
		</div>
	);
}
