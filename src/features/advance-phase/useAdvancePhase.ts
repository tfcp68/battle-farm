import { submitMatchIntent } from '~/app/yantrix/matchNet';

/**
 * "I am done with this phase."
 *
 * An intent rather than a plain FSM event, and that is the whole point of the
 * phase-5 UI layer: every move the player makes goes to the host, which decides
 * it against its own model and broadcasts the result. A button that dispatched
 * locally would move this peer's board and nobody else's.
 */
export function useAdvancePhase() {
	return {
		endPhase() {
			submitMatchIntent('turn_phase_ended', null);
		},
	};
}
