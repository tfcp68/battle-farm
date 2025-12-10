import {
	AutomataEventAdapter,
	CoreLoop,
	EventDictionary as GlobalEventDictionary
} from '@yantrix/core';
import WindowModeAutomata from '~/fsm/window/WindowModeAutomata';
import WindowMenuAutomata from '~/fsm/window/WindowMenuAutomata';
import WindowLobbyAutomata from '~/fsm/window/WindowLobbyAutomata';
import { useEffect } from 'react';
import { registerYantrixFunctions } from './register-functions';
import { useServices } from '~/providers/AppServicesProvider';
import { windowAutomataIds } from '~/yantrix/automataIds';
import { WindowEvents, TWindowMeta, registerWindowEvents } from '~/yantrix/windowEvents';
import { buildWindowEventAdapter } from '~/yantrix/buildWindowAdapter';
import { TAutomata } from '../../../yantrix/packages/react';

type Machines = {
	mode: WindowModeAutomata;
	menu: WindowMenuAutomata;
	lobby: WindowLobbyAutomata;
};

let loop: CoreLoop<WindowEvents, TWindowMeta> | null = null;
let machines: Machines | null = null;
let eventAdapter: AutomataEventAdapter | null = null;

export function startYantrixCore(): void {
	if (loop) return;

	registerWindowEvents();

	loop = new CoreLoop<WindowEvents, TWindowMeta>();
	const mode = new WindowModeAutomata();
	const menu = new WindowMenuAutomata();
	const lobby = new WindowLobbyAutomata();

	eventAdapter = buildWindowEventAdapter();

	loop.registerAutomata(windowAutomataIds.mode, mode, eventAdapter);
	loop.registerAutomata(windowAutomataIds.menu, menu, eventAdapter);
	loop.registerAutomata(windowAutomataIds.lobby, lobby, eventAdapter);

	loop.start();
	machines = { mode, menu, lobby };
}

export function registerAutomataToCoreLoop(id: string, snapshotAutomata: TAutomata): void {
	if (!loop) throw new Error('Yantrix CoreLoop is not started');
	if(!eventAdapter) throw new Error('Event Adapter is not built');

	loop.registerAutomata(id, snapshotAutomata, eventAdapter);
}

export function getBus() {
	if (!loop) throw new Error('Yantrix CoreLoop is not started');
	return loop.getBus();
}

export function getMachines(): Machines {
	if (!machines) throw new Error('Yantrix CoreLoop is not started');
	return machines;
}

export function subscribeUiRender(onRender: () => void): () => void {
	const bus = getBus();
	const handler = () => {
		onRender();
		return {
			event: WindowEvents.UI_RENDER,
			meta: {} as TWindowMeta[WindowEvents.UI_RENDER],
			task_id: 'ui_render',
			result: null,
		};
	};
	bus.subscribe(WindowEvents.UI_RENDER, handler);
	return () => bus.unsubscribe(WindowEvents.UI_RENDER, handler );
}

export function subscribeAllEvents(onAnyEvent: () => void): () => void {
	const bus = getBus();
	const dict = GlobalEventDictionary.getDictionary();
	const unsubs: Array<() => void> = [];

	Object.values(dict).forEach((evtId) => {
		const handler = () => {
			onAnyEvent();
			return {
				event: evtId,
				meta: {},
				task_id: `ui_pulse_${String(evtId)}`,
				result: null,
			};
		};
		bus.subscribe(evtId , handler );
		unsubs.push(() => bus.unsubscribe(evtId , handler ));
	});

	return () => {
		unsubs.forEach(u => u());
	};
}

export function dispatchEvent(name: string, meta: any = {}): void {
	const bus = getBus();
	const id = GlobalEventDictionary.getDictionary()[name];
	if (!id) throw new Error(`Unknown event name: ${name}`);
	bus.dispatch({ event: id , meta });
}

export function YantrixBootstrap() {
	const services = useServices();

	useEffect(() => {
		registerYantrixFunctions(services);
	}, [services]);

	return null;
}