import { createDataSourceAdapter, NamedDataSource, type TAutomataEventMetaType } from '@yantrix/core';
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
 * `this.emit(packet)` for each push. The framework base (`createDataSourceAdapter`)
 * provides `setNotifier` and wakes the consumer (CoreLoop) on every `_addDataPacket`,
 * so no notifier wiring is needed here.
 *
 * **Generic type erasure.** TypeScript forbids referencing a class's own type
 * parameter inside its `extends` expression, so the framework mixin is applied
 * with `any` and the typed public surface (`emit`, `responseMapper`) is
 * re-exposed by this abstract class. The internal storage cast is contained.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Base = createDataSourceAdapter<WindowEventId, WindowEventMetaMap, any>()(NamedDataSource<any>);

export abstract class AbstractWindowDataSource<T> extends Base {
	/** Setter captured from `afterInit`; pushes a packet into the queue (and wakes the consumer). */
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
	 * Push a packet into the queue. Subclasses call this from cache callbacks, timer fires,
	 * imperative emit methods, etc. The framework base notifies the consumer (CoreLoop) after
	 * the packet lands, so the loop drains and publishes without polling.
	 */
	protected emit(data: T): void {
		this.#pushPacket(data);
	}
}
