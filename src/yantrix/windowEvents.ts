import { EventDictionary as GlobalEventDictionary } from '@yantrix/core';

export enum WindowEvents {
	UI_OPEN_MENU = 1,
	UI_CLOSE_MENU = 2,
	UI_SWITCH_MODE = 3,
	UI_OPEN_LOBBY = 4,
	UI_RENDER = 5,
}

export type TWindowMeta = {
	[WindowEvents.UI_OPEN_MENU]: { from?: string | null };
	[WindowEvents.UI_CLOSE_MENU]: { reason?: string | null };
	[WindowEvents.UI_SWITCH_MODE]: { mode: string };
	[WindowEvents.UI_OPEN_LOBBY]: { lobbyId?: string | null };
	[WindowEvents.UI_RENDER]: {
		machine: 'mode' | 'menu' | 'lobby';
		state: any;
		action?: any;
	};
};

export function registerWindowEvents(): void {
	GlobalEventDictionary.addEvents({
		keys: [
			'ui/window/openMenu',
			'ui/window/closeMenu',
			'ui/window/switchMode',
			'ui/window/openLobby',
			'ui/render',
		],
	});
}