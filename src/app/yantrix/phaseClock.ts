import { type AppModel, PHASE_DURATION_MS } from '~/entities/game';
import type { IModelStore } from '~/shared/lib/model';

/**
 * The match's clock: the referee that ends a phase nobody ended in time.
 *
 * Not a Data Source, though the plan first called it one. A source pushes onto
 * *this* peer's bus, and a phase that expired only here would leave every other
 * peer a phase behind — the timeout has to enter the canonical stream like any
 * other event, which means going out through the channel. So the clock emits an
 * engine event rather than an intent: the sequencer is not asking permission on
 * the active player's behalf, it is calling time on them.
 *
 * Everything comes in as a dependency, which keeps this module free of
 * `import.meta` (and therefore testable under the CJS test build) and lets a
 * test drive it with its own timers.
 */

type TimerHandle = ReturnType<typeof setTimeout>;

export interface TimerPort {
	set(callback: () => void, ms: number): TimerHandle;
	clear(handle: TimerHandle): void;
}

const REAL_TIMERS: TimerPort = {
	set: (callback, ms) => setTimeout(callback, ms),
	clear: (handle) => clearTimeout(handle),
};

export interface PhaseClockOptions {
	store: IModelStore<AppModel>;
	/** Puts the timeout into the canonical stream — `emitMatchEvent` in production. */
	emit: (name: 'turn_phase_ended', meta: null) => void;
	/** Only the sequencer runs a clock; a guest that also ran one would race it. */
	isSequencer: () => boolean;
	timers?: TimerPort;
}

/** Identifies the window a timer was armed for. */
const windowOf = (model: AppModel): string | null => {
	const match = model.match;
	return match ? `${match.turn.number}:${match.turn.phase}` : null;
};

export function startPhaseClock(opts: PhaseClockOptions): () => void {
	const timers = opts.timers ?? REAL_TIMERS;
	let armed: { window: string; handle: TimerHandle } | null = null;

	function disarm(): void {
		if (!armed) return;
		timers.clear(armed.handle);
		armed = null;
	}

	function fire(window: string): void {
		armed = null;
		// The phase may have moved on between the timer firing and this running.
		if (windowOf(opts.store.get()) !== window) return;
		opts.emit('turn_phase_ended', null);
	}

	function reschedule(): void {
		const model = opts.store.get();
		const phase = model.match?.turn.phase;
		const duration = phase ? PHASE_DURATION_MS[phase] : null;
		if (duration === null || !opts.isSequencer()) {
			disarm();
			return;
		}

		// One window per (turn, phase). Every buy, plant and bid commits the model
		// too, and re-arming on those would hand the player a fresh 15 seconds for
		// each thing they did with the first fifteen.
		const window = windowOf(model);
		if (window === null || armed?.window === window) return;

		disarm();
		armed = { window, handle: timers.set(() => fire(window), duration) };
	}

	const unsubscribe = opts.store.subscribe(reschedule);
	reschedule();

	return () => {
		unsubscribe();
		disarm();
	};
}
