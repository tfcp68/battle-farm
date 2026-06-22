import {
	createDataSourceAdapter,
	NamedDataSource,
	type TAutomataEventMetaType,
	type TAutomataEventStack,
} from '@yantrix/core';
import type { WindowEventId, WindowEventMetaMap } from '~/app/yantrix/types';

/** Follow-up events emitted back into the bus. */
export type FollowUp = TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>;

/** Map a queued data packet to one or more follow-up events. */
export type ResponseMapper<T> = (data: T) => FollowUp[];

/**
 * Base class for every Window-scope Data Source in `~/app/yantrix/data/`.
 *
 * Encapsulates the boilerplate that every concrete source had to repeat by hand:
 *   - the `createDataSourceAdapter` mixin applied to `NamedDataSource`
 *   - capturing the `afterInit` setter into a protected `emit(packet)` method
 *   - registering the `responseMapper` listener
 *
 * Subclasses only have to implement the **how-do-events-arrive** part — a
 * cache subscription, a timer, an imperative call, etc. — and call
 * `this.emit(packet)` for each push. The source only enqueues; CoreLoop drains it
 * on its tick.
 *
 * **Generic type erasure.** TypeScript forbids referencing a class's own type
 * parameter inside its `extends` expression, so the framework mixin is applied
 * with `any` and the typed public surface (`emit`, `responseMapper`) is
 * re-exposed by this abstract class. The internal storage cast is contained.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Base = createDataSourceAdapter<WindowEventId, WindowEventMetaMap, any>()(NamedDataSource<any>);

export abstract class AbstractWindowDataSource<T> extends Base {
	/** Setter captured from `afterInit`; enqueues a packet (drained by CoreLoop on its tick). */
	readonly #pushPacket: (data: T) => void;

	constructor(opts: { id: string; responseMapper: ResponseMapper<T> }) {
		let captured: ((data: T) => void) | null = null;
		super({
			id: opts.id,
			afterInit: (_id, setter) => {
				if (setter) captured = setter;
			},
		});
		if (!captured) {
			throw new Error(`${opts.id}: setter not captured from afterInit`);
		}
		this.#pushPacket = captured;

		this.addListener(`${opts.id}_response`, opts.responseMapper);
	}

	/**
	 * Enqueue a packet. Subclasses call this from cache callbacks, imperative emit methods, or
	 * `pollTick()`. CoreLoop drains the queue on its next tick and publishes to the bus.
	 */
	protected emit(data: T): void {
		this.#pushPacket(data);
	}

	/**
	 * Per-tick poll hook. CoreLoop pulls each source's `eventEmitter()` once per tick; this runs at
	 * the start of that pull, so a source can read the current FSM state / cache and `emit(...)` —
	 * all polling rides the single loop clock instead of its own timer. Default no-op.
	 */
	protected pollTick(): void {}

	override *eventEmitter(): Generator<TAutomataEventStack<WindowEventId, WindowEventMetaMap>> {
		this.pollTick();
		yield* super.eventEmitter();
	}
}
