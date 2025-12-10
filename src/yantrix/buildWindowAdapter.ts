import {
	AutomataEventAdapter,
	TAutomataEventMetaType,
} from '@yantrix/core';
import { WindowEvents, TWindowMeta } from './windowEvents';

import  {
	actionsDictionary as modeActions,
	statesDictionary as modeStates,
} from '~/fsm/window/WindowModeAutomata';

import {
	actionsDictionary as menuActions,
	statesDictionary as menuStates,
} from '~/fsm/window/WindowMenuAutomata';

import {
	statesDictionary as lobbyStates,
} from '~/fsm/window/WindowLobbyAutomata';

/**
 * Адаптер событий для оконных автоматов.
 * Тут только "чистая" маршрутизация Events -> Actions и States -> Events,
 * никаких прямых вызовов dispatch/Bus.
 */
export function buildWindowEventAdapter() {
	const adapter = new AutomataEventAdapter();

	/* =======================
	 * Events -> Actions
	 * ======================= */

	// Открыть меню (UI), просто уводим в IN_MENU
	adapter.addEventListener(
		WindowEvents.UI_OPEN_MENU,
		(_event: TAutomataEventMetaType<WindowEvents.UI_OPEN_MENU, TWindowMeta>) => ({
			action: menuActions.RESET,
			payload: {},
		}),
	);

	// Закрыть меню – возвращаемся в INTRO (через RESET у mode)
	adapter.addEventListener(
		WindowEvents.UI_CLOSE_MENU,
		(_event: TAutomataEventMetaType<WindowEvents.UI_CLOSE_MENU, TWindowMeta>) => ({
			action: modeActions.RESET,
			payload: {},
		}),
	);

	// UI_SWITCH_MODE: для простоты – три "режима":
	// 'menu'  -> MAIN_MENU
	// 'lobby' -> GAME_LOBBY (create game)
	// 'game'  -> IN_GAME (если уже стартовали)
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
					// создаём лобби – WindowMode -> GAME_LOBBY
					return {
						action: modeActions.CREATE_GAME,
						payload: {
							gameId: null,
							isHost: 1,
						},
					};
				case 'game':
					// если уже есть игра – в IN_GAME, формально триггерим START_GAME
					return {
						action: modeActions.START_GAME,
						payload: {
							gameId: null,
							playerIds: null,
						},
					};
				default:
					// неизвестный режим – игнор
					return {
						action: modeActions.RESET,
						payload: {},
					};
			}
		},
	);

	// Открыть конкретный лобби (например, join по id)
	adapter.addEventListener(
		WindowEvents.UI_OPEN_LOBBY,
		(event: TAutomataEventMetaType<WindowEvents.UI_OPEN_LOBBY, TWindowMeta>) => ({
			// UI-join для WindowMode
			action: modeActions.JOIN_GAME,
			payload: {
				gameId: event.meta?.lobbyId ?? null,
			},
		}),
	);

	/* =======================
	 * States -> Events (UI_RENDER)
	 * ======================= */

	// Удобный хелпер, чтобы не дублировать код
	const emitUiRender =
		(machine: 'mode' | 'menu' | 'lobby') =>
			(state: { state: number | null; context: any }) => ({
				event: WindowEvents.UI_RENDER,
				meta: {
					machine,
					state: state.state,
					action: null,
				},
			});

	// Любое изменение меню → UI_RENDER
	Object.values(menuStates).forEach((st) => {
		adapter.addEventEmitter(st as number, emitUiRender('menu'));
	});

	// Любое изменение режима окна → UI_RENDER
	Object.values(modeStates).forEach((st) => {
		adapter.addEventEmitter(st as number, emitUiRender('mode'));
	});

	// Любое изменение лобби → UI_RENDER
	Object.values(lobbyStates).forEach((st) => {
		adapter.addEventEmitter(st as number, emitUiRender('lobby'));
	});

	return adapter;
}