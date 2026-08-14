import { beforeEach, describe, expect, it } from '@jest/globals';
import { type AppModel, emptyAppModel, PHASE_DURATION_MS, type TurnPhase } from '~/entities/game';
import { startPhaseClock, type TimerPort } from '~/app/yantrix/phaseClock';
import { ModelStore } from '~/shared/lib/model';
import { testMatch } from './harness';

/**
 * The referee's clock. Everything it decides comes from the model, so a fake
 * timer and a real store are the whole rig — no bus, no network, no wall clock.
 */

interface FakeTimer extends TimerPort {
	/** Run every pending timer, as `setTimeout` would once its delay elapsed. */
	elapse(): void;
	pending: number;
	/** The last callback handed to `set`, kept even after the timer is cleared. */
	latest: (() => void) | null;
}

function fakeTimers(): FakeTimer {
	const scheduled = new Map<number, () => void>();
	let nextHandle = 1;
	let latest: (() => void) | null = null;

	return {
		set(callback) {
			const handle = nextHandle++;
			scheduled.set(handle, callback);
			latest = callback;
			return handle as unknown as ReturnType<typeof setTimeout>;
		},
		clear(handle) {
			scheduled.delete(handle as unknown as number);
		},
		elapse() {
			const callbacks = [...scheduled.values()];
			scheduled.clear();
			for (const callback of callbacks) callback();
		},
		get pending() {
			return scheduled.size;
		},
		get latest() {
			return latest;
		},
	};
}

function matchIn(phase: TurnPhase, turnNumber = 1): AppModel {
	return {
		match: testMatch({
			players: [{ id: 'p-one' }, { id: 'p-two' }],
			phase,
			turnNumber,
			active: 'p-one',
		}).model,
	};
}

describe('the phase clock', () => {
	let store: ModelStore<AppModel>;
	let timers: FakeTimer;
	let timeouts: number;
	let isSequencer: boolean;
	let stop: () => void;

	beforeEach(() => {
		store = new ModelStore<AppModel>(emptyAppModel());
		timers = fakeTimers();
		timeouts = 0;
		isSequencer = true;
		stop = startPhaseClock({
			store,
			emit: () => {
				timeouts += 1;
			},
			isSequencer: () => isSequencer,
			timers,
		});
	});

	it('arms nothing until a timed phase opens', () => {
		expect(timers.pending).toBe(0);

		store.commit(matchIn('WAITING'));
		expect(timers.pending).toBe(0);

		store.commit(matchIn('SHOPPING'));
		expect(timers.pending).toBe(1);
		stop();
	});

	it('ends the phase when nobody else does', () => {
		store.commit(matchIn('PLAYING'));
		timers.elapse();

		expect(timeouts).toBe(1);
		stop();
	});

	it('does not restart the window when a move commits the model mid-phase', () => {
		store.commit(matchIn('SHOPPING'));
		const armed = timers.pending;

		// A card bought during SHOPPING commits a new model in the same phase.
		const model = store.get();
		store.commit({ ...model, match: model.match ? { ...model.match, version: 2 } : null });

		expect(timers.pending).toBe(armed);
		expect(timeouts).toBe(0);
		stop();
	});

	it('opens a fresh window for the next phase', () => {
		store.commit(matchIn('SHOPPING'));
		store.commit(matchIn('PLAYING'));
		timers.elapse();

		expect(timeouts).toBe(1);
		stop();
	});

	it('stays silent when the phase moved on before its timer ran', () => {
		store.commit(matchIn('SHOPPING'));
		const staleWindow = timers.latest;

		// The player ended SHOPPING themselves. Rescheduling clears the old timer,
		// so this can only happen if one slipped through — which is exactly the
		// case the window check exists for, hence firing it by hand.
		store.commit(matchIn('PLAYING'));
		staleWindow?.();
		expect(timeouts).toBe(0);

		// …and the live window still ends when its own time is up.
		timers.elapse();
		expect(timeouts).toBe(1);
		stop();
	});

	it('runs no clock on a guest', () => {
		isSequencer = false;
		store.commit(matchIn('SHOPPING'));

		expect(timers.pending).toBe(0);
		expect(timeouts).toBe(0);
		stop();
	});

	it('disarms when detached', () => {
		store.commit(matchIn('SHOPPING'));
		stop();

		expect(timers.pending).toBe(0);
	});

	it('gives every turn phase a stated duration', () => {
		// A phase added without a duration would silently never expire.
		expect(Object.values(PHASE_DURATION_MS).filter((ms) => ms !== null).length).toBe(5);
		expect(PHASE_DURATION_MS.SHOPPING).toBe(15_000);
		expect(PHASE_DURATION_MS.PLAYING).toBe(30_000);
		expect(PHASE_DURATION_MS.FERTILIZE).toBe(15_000);
		expect(PHASE_DURATION_MS.CALCULATION).toBeNull();
		expect(PHASE_DURATION_MS.WAITING).toBeNull();
	});
});
