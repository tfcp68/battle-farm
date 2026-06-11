import { type TAutomataEventMetaType, uniqId } from '@yantrix/core';
import { fsmLogger } from '~/shared/lib/fsm/devLogger';
import type { WindowEventId, WindowEventMetaMap } from '~/app/yantrix/types';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

/** A packet is the event itself — UI components emit ready-to-dispatch events. */
type UIBridgePacket = TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>;

/** Module-level singleton wiring so `emitDomainEvent` can be called from any React tree node. */
let activeInstance: UIBridgeDataSource | null = null;
/** Events emitted before `start()` are queued and drained on start. */
let pendingQueue: UIBridgePacket[] = [];

// HMR reset — stale refs would survive module replacement without this.
if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		activeInstance = null;
		pendingQueue = [];
	});
}

/**
 * Imperative bridge from React-tree call sites (feature hooks) into the
 * EventBus. Replaces the function-style `createUIBridgeSource` factory.
 *
 * The packet type is the event itself (identity transform), so the
 * `responseMapper` just wraps the packet in a one-element follow-up array.
 *
 * **Pending queue.** UI hooks may fire before the CoreLoop has called
 * `start(publish)` (e.g. during boot, before `MachinesProvider` runs). We
 * buffer those events at module scope and drain them on `start()`.
 */
export class UIBridgeDataSource extends AbstractWindowDataSource<UIBridgePacket> {
	constructor(opts: { id?: string } = {}) {
		super({
			id: opts.id ?? `ui_bridge_${uniqId(4)}`,
			responseMapper: (data: UIBridgePacket): FollowUp[] => [data],
		});
	}

	override start(): this {
		super.start();
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		activeInstance = this;
		if (pendingQueue.length > 0) {
			fsmLogger()?.warn(`uiBridge.start: draining ${pendingQueue.length} queued events`);
			const queued = pendingQueue.splice(0);
			for (const e of queued) this.emit(e);
		}
		return this;
	}

	override stop(): this {
		if (activeInstance === this) activeInstance = null;
		return super.stop();
	}

	/** Pushed by `emitDomainEvent` from anywhere in the tree. */
	pushEvent(packet: UIBridgePacket): void {
		this.emit(packet);
	}
}

/**
 * Imperative entry point used by feature hooks (`useAuthActions`, `useCreateLobby`, …).
 *
 * If the CoreLoop is already up, the event hits the bridge immediately; otherwise
 * it's buffered in `pendingQueue` and drained when {@link UIBridgeDataSource.start}
 * runs.
 */
export function emitDomainEvent(
	event: UIBridgePacket['event'],
	meta: UIBridgePacket['meta'] = null,
): void {
	if (event !== null) fsmLogger()?.logEmit('ui', event, meta);
	const packet: UIBridgePacket = { event, meta };
	if (!activeInstance) {
		pendingQueue.push(packet);
		fsmLogger()?.warn(`emit before loop ready — queued; pending=${pendingQueue.length}`);
		return;
	}
	activeInstance.pushEvent(packet);

}
