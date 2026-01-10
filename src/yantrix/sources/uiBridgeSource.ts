import type { IEventSource, TAutomataEventMetaType } from '@yantrix/core';
import { uniqId } from '@yantrix/core';

type WindowEventId = number;

type WindowEventMetaMap = Record<number, unknown>;

let publishRef: null | ((e: TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>) => void) = null;

export function emitDomainEvent(event: TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>['event'],
								meta: TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>['meta'] = null) {
	if (!publishRef) {
		throw new Error(
			`uiBridgeSource.publishRef is null. CoreLoop is not started yet (event=${String(event)}). ` +
				`Make sure MachinesProvider mounted and startYantrixCore() was called before emitting UI events.`
		);
	}
	console.log(`Emitting UI Bridge Event: ${String(event)}`, publishRef);
	publishRef({ event, meta });
}

export function createUIBridgeSource(): IEventSource<WindowEventId, WindowEventMetaMap> {
	const id = `ui_bridge_${uniqId()}`;
	return {
		id,
		start(publish) {
			console.log('ui_bridge source started');
			publishRef = publish;
		},
		stop() {
			publishRef = null;
		},
	};
}