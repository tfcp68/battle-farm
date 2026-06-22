import { createDataDestinationAdapter, NamedDataDestination, type TAutomataEventMetaType } from '@yantrix/core';
import type { WindowEventId, WindowEventMetaMap } from '~/app/yantrix/types';

/** Raw inbound bus event delivered to a destination's selector. */
export type DomainEvent = TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>;

/**
 * Selector function passed to `createTrigger`: turns an inbound bus event into
 * a data packet the destination's resolver will process, or `null` to skip.
 */
export type EventSelector<Packet> = (event: DomainEvent) => Packet | null;

/**
 * Mapping from event ids to selectors. Each entry produces a `createTrigger`
 * registration in the constructor.
 */
export type TriggerMap<Packet> = {
	[eventId: WindowEventId]: EventSelector<Packet>;
};

/**
 * Base class for every Window-scope Data Destination in `~/app/yantrix/data/`.
 *
 * Encapsulates:
 *   - the `createDataDestinationAdapter` mixin applied to `NamedDataDestination`
 *   - the `createTrigger` boilerplate (declarative `{ eventId: selector }` map)
 *   - a typed `resolve` abstract method subclasses implement to do the work
 *
 * `ResolveResult` defaults to `null` for fire-and-forget destinations (no
 * follow-up event). Promise adapters (auth, lobby_created) extend with a real
 * `ResolveResult` and use the `onResolved` callback pattern to feed a paired
 * Data Source.
 */
/**
 * Same generic-type-parameter trick as {@link AbstractWindowDataSource}: the
 * mixin is applied with `any` because TS forbids referencing the class's own
 * type parameter in the extends expression. The typed surface (`resolve`,
 * `triggers`) is the abstract class's public contract.
 */
const Base = createDataDestinationAdapter<
	WindowEventId,
	WindowEventMetaMap,
	null,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any
>()(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	NamedDataDestination<any, any>
);

export abstract class AbstractWindowDataDestination<
	Packet extends object,
	ResolveResult = null,
> extends Base {
	constructor(opts: { id: string; triggers: TriggerMap<Packet> }) {
		super({
			id: opts.id,
			resolver: (packet: Packet) => Promise.resolve(this.resolve(packet)),
		});
		for (const [eventIdStr, selector] of Object.entries(opts.triggers)) {
			const eventId = Number(eventIdStr);
			this.createTrigger([eventId], selector);
		}
	}

	/**
	 * Do the side effect for one packet. Maybe sync or async.
	 *
	 * For fire-and-forget destinations, return `null` (or `void` — coerced).
	 * For promise-adapter destinations, return the discriminated result type
	 * the paired Data Source converts into follow-up events; the factory wires
	 * a `super({ resolver })` that pipes the result through the paired source.
	 */
	protected abstract resolve(packet: Packet): Promise<ResolveResult> | ResolveResult;
}
