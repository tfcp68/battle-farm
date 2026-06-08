/**
 * Polls a stateless automata's current state and fires `onEnter`/`onExit` when it
 * crosses into or out of a target state. Sources can't subscribe to FSM
 * transitions directly, so this small poller replaces the hand-rolled
 * `setInterval` + `wasInState` bookkeeping each timer-based source used to repeat.
 *
 * `targetState` is the resolved numeric state id (e.g. `WindowModeAutomata.getState('JOIN_REQUEST')`).
 */
export interface FsmStateWatcher {
	stop: () => void;
}

export function watchFsmState(
	fsm: { state: number | null },
	targetState: number | null,
	handlers: { onEnter?: () => void; onExit?: () => void; intervalMs?: number },
): FsmStateWatcher {
	const { onEnter, onExit, intervalMs = 250 } = handlers;

	let wasInState = false;
	const timer = setInterval(() => {
		const inState = fsm.state === targetState;
		if (inState && !wasInState) onEnter?.();
		if (!inState && wasInState) onExit?.();
		wasInState = inState;
	}, intervalMs);

	return {
		stop() {
			clearInterval(timer);
		},
	};
}
