import { AutomataEventAdapter, TAutomataEventMetaType } from '@yantrix/core';
import { TWindowMeta, WindowEvents } from './windowEvents';

import { actionsDictionary as modeActions, statesDictionary as modeStates } from '~/fsm/window/WindowModeAutomata';

import { actionsDictionary as menuActions, statesDictionary as menuStates } from '~/fsm/window/WindowMenuAutomata';

import { statesDictionary as lobbyStates } from '~/fsm/window/WindowLobbyAutomata';

export function buildWindowEventAdapter() {
	const adapter = new AutomataEventAdapter();

	adapter.addEventListener(
		WindowEvents.UI_OPEN_MENU,
		(_event: TAutomataEventMetaType<WindowEvents.UI_OPEN_MENU, TWindowMeta>) => ({
			action: menuActions.RESET,
			payload: {},
		})
	);

	adapter.addEventListener(
		WindowEvents.UI_CLOSE_MENU,
		(_event: TAutomataEventMetaType<WindowEvents.UI_CLOSE_MENU, TWindowMeta>) => ({
			action: modeActions.RESET,
			payload: {},
		})
	);

	adapter.addEventListener(
		WindowEvents.UI_SWITCH_MODE,
		(event: TAutomataEventMetaType<WindowEvents.UI_SWITCH_MODE, TWindowMeta>) => {
			const mode = event.meta?.mode;
			switch (mode) {
				case 'menu':
					return {
						action: modeActions.TO_MENU,
						payload: {},
					};
				case 'lobby':
					return {
						action: modeActions.CREATE_GAME,
						payload: {
							gameId: null,
							isHost: 1,
						},
					};
				case 'game':
					return {
						action: modeActions.START_GAME,
						payload: {
							gameId: null,
							playerIds: null,
						},
					};
				default:
					return {
						action: modeActions.RESET,
						payload: {},
					};
			}
		}
	);

	adapter.addEventListener(
		WindowEvents.UI_OPEN_LOBBY,
		(event: TAutomataEventMetaType<WindowEvents.UI_OPEN_LOBBY, TWindowMeta>) => ({
			action: modeActions.JOIN_GAME,
			payload: {
				gameId: event.meta?.lobbyId ?? null,
			},
		})
	);

	const emitUiRender = (machine: 'mode' | 'menu' | 'lobby') => (state: { state: number | null; context: any }) => ({
		event: WindowEvents.UI_RENDER,
		meta: {
			machine,
			state: state.state,
			action: null,
		},
	});

	Object.values(menuStates).forEach((st) => {
		adapter.addEventEmitter(st as number, emitUiRender('menu'));
	});

	Object.values(modeStates).forEach((st) => {
		adapter.addEventEmitter(st as number, emitUiRender('mode'));
	});

	Object.values(lobbyStates).forEach((st) => {
		adapter.addEventEmitter(st as number, emitUiRender('lobby'));
	});

	return adapter;
}