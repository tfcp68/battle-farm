import { functionDictionary as windowModeFD } from '~/shared/lib/fsm/window/WindowModeAutomata';
import { functionDictionary as windowMenuFD } from '~/shared/lib/fsm/window/WindowMenuAutomata';
import { functionDictionary as windowLobbyFD } from '~/shared/lib/fsm/window/WindowLobbyAutomata';
import { CURRENT_PLAYER_ID_KEY } from '~/entities/auth/queries';

const registries = [windowModeFD, windowMenuFD, windowLobbyFD].filter(Boolean);
let alreadyRegistered = false;

export function getPlayerId(): string | null {
	if (typeof window === 'undefined') return null;
	return window.localStorage.getItem(CURRENT_PLAYER_ID_KEY);
}

export function registerYantrixFunctions() {
	if (alreadyRegistered) return;
	alreadyRegistered = true;
	const custom = { getPlayerId };
	for (const fd of registries) fd.register(custom);
}
