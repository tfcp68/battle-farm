import { useEffect, useState } from 'react';
import { type GameModel, PHASE_DURATION_MS } from '~/entities/game';

/**
 * Milliseconds left in the current phase, or `null` when the phase is untimed.
 *
 * Local to each peer and started when *this* peer sees the phase open: the model
 * carries no deadline, because a wall clock inside a replicated snapshot would
 * make two peers disagree on a field neither of them decides. This is a display
 * of the host's clock — only the host's timer actually ends a phase
 * (`~/app/yantrix/phaseClock.ts`), which is why nothing here emits on expiry.
 *
 * A peer that joins mid-phase therefore sees a full bar for a phase that is
 * nearly over. Prototype-grade and deliberate; a shared start time would have to
 * come down the wire with the event that opened the phase.
 */
export function usePhaseCountdown(match: GameModel | null): number | null {
	const window = match ? `${match.turn.number}:${match.turn.phase}` : '';
	const duration = match ? PHASE_DURATION_MS[match.turn.phase] : null;
	const [remaining, setRemaining] = useState<number | null>(duration);

	useEffect(() => {
		if (!window || duration === null) {
			setRemaining(null);
			return;
		}
		const openedAt = Date.now();
		setRemaining(duration);
		const tick = setInterval(() => setRemaining(Math.max(0, duration - (Date.now() - openedAt))), 250);
		return () => clearInterval(tick);
	}, [window, duration]);

	return remaining;
}
