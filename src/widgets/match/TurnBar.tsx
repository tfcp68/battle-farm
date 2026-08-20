import { type GameModel, PHASE_DURATION_MS, type PlayerId } from '~/entities/game';
import { usePhaseCountdown } from './usePhaseCountdown';

/** Whose turn it is, what phase it is in, and how long is left of it. */
export function TurnBar(props: {
	match: GameModel;
	viewerId: PlayerId | null;
	onEndPhase: () => void;
}) {
	const { match, viewerId, onEndPhase } = props;
	const { turn } = match;
	const active = turn.activePlayerId ? match.players[turn.activePlayerId] : null;
	const isMyTurn = !!viewerId && turn.activePlayerId === viewerId;
	const remaining = usePhaseCountdown(match);
	const duration = PHASE_DURATION_MS[turn.phase];

	return (
		<div className="panel turn-bar">
			<div className="row" style={{ justifyContent: 'space-between' }}>
				<div className="row">
					<span className="state-badge">
						<span className="state-badge-label">Turn</span>
						<span className="state-badge-value">{turn.number}</span>
					</span>
					<span className="state-badge">
						<span className="state-badge-label">Phase</span>
						<span className="state-badge-value">{turn.phase}</span>
					</span>
					<span className="state-badge">
						<span className="state-badge-label">Playing</span>
						<span className="state-badge-value">
							{isMyTurn ? 'You' : (active?.nickname ?? '—')}
						</span>
					</span>
					{turn.allowance === null ? null : (
						<span className="state-badge" title="This phase's 1d4 — what is left of it">
							<span className="state-badge-label">Roll left</span>
							<span className="state-badge-value">{turn.allowance}</span>
						</span>
					)}
					{match.phase === 'LAST_TURN' ? (
						<span className="state-badge" title="Someone triggered the endgame — everyone gets one more turn">
							<span className="state-badge-value" style={{ color: 'var(--warn)' }}>
								Last round
							</span>
						</span>
					) : null}
				</div>

				<div className="row">
					<small className="muted">Win limit {match.winLimit}</small>
					<button className="primary" type="button" disabled={!isMyTurn} onClick={onEndPhase}>
						{isMyTurn ? 'End phase' : 'Waiting…'}
					</button>
				</div>
			</div>

			{duration === null || remaining === null ? null : (
				<div className="timer" title={`${Math.ceil(remaining / 1000)}s left`}>
					<div className="timer-fill" style={{ width: `${(remaining / duration) * 100}%` }} />
				</div>
			)}
		</div>
	);
}
