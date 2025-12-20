import { AutomataEventAdapter, CoreLoop, EventDictionary as GlobalEventDictionary } from '@yantrix/core';
import WindowModeAutomata from '~/fsm/window/WindowModeAutomata';
import WindowMenuAutomata from '~/fsm/window/WindowMenuAutomata';
import WindowLobbyAutomata from '~/fsm/window/WindowLobbyAutomata';
import { windowAutomataIds } from '~/yantrix/automataIds';
import { registerWindowEvents, TWindowMeta, WindowEvents } from '~/yantrix/windowEvents';
import { buildWindowEventAdapter } from '~/yantrix/buildWindowAdapter';

type Machines = {
	modeFSM: WindowModeAutomata;
	menuFSM: WindowMenuAutomata;
	lobbyFSM: WindowLobbyAutomata;
};

let loop: CoreLoop<WindowEvents, TWindowMeta> | null = null;
let eventAdapter: AutomataEventAdapter | null = null;

export function startYantrixCore() {
	if (loop) return;

	registerWindowEvents();


	loop = new CoreLoop<WindowEvents, TWindowMeta>();
	const modeFSM = new WindowModeAutomata();
	const menuFSM = new WindowMenuAutomata();
	const lobbyFSM = new WindowLobbyAutomata();

	eventAdapter = buildWindowEventAdapter();

	loop.registerAutomata(windowAutomataIds.mode, modeFSM);
	loop.registerAutomata(windowAutomataIds.menu, menuFSM);
	loop.registerAutomata(windowAutomataIds.lobby, lobbyFSM);

	loop.start();

	console.log(GlobalEventDictionary.getDictionary())

	return { modeFSM, menuFSM, lobbyFSM }
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