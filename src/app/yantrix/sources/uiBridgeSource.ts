import type { IEventSource, TAutomataEventMetaType } from '@yantrix/core';
import { uniqId } from '@yantrix/core';
import type { WindowEventId, WindowEventMetaMap } from '~/app/yantrix/types';

type TEvent = TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>;

let publishRef: null | ((e: TEvent) => void) = null;
/** Events emitted before the loop starts are queued and drained on start(). */
let pendingQueue: TEvent[] = [];

// D3: Reset state on HMR so stale refs don't survive module replacement.
if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		publishRef = null;
		pendingQueue = [];
	});
}

export function emitDomainEvent(
	event: TEvent['event'],
	meta: TEvent['meta'] = null
) {
	if (!publishRef) {
		// Queue the event — it will be drained as soon as the CoreLoop starts.
		pendingQueue.push({ event, meta });
		return;
	}
	publishRef({ event, meta });
}

export function createUIBridgeSource(): IEventSource<WindowEventId, WindowEventMetaMap> {
	const id = `ui_bridge_${uniqId()}`;
	return {
		id,
		start(publish) {
			publishRef = publish;
			// Drain any events that were emitted before the loop started.
			const queued = pendingQueue.splice(0);
			for (const e of queued) publish(e);
		},
		stop() {
			publishRef = null;
		},
	};
}
