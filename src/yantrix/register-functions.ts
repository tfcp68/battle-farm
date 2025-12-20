import { functionDictionary as windowModeFD } from '~/fsm/window/WindowModeAutomata';
import { functionDictionary as windowMenuFD } from '~/fsm/window/WindowMenuAutomata';
import { functionDictionary as windowLobbyFD } from '~/fsm/window/WindowLobbyAutomata';
import { CURRENT_PLAYER_ID_KEY } from '~/hooks/useAuth';

const registries = [windowModeFD, windowMenuFD, windowLobbyFD].filter(Boolean);
let alreadyRegistered = false;


function getPlayerId(): string | null {
	if (typeof window === 'undefined') return null;
	return window.localStorage.getItem(CURRENT_PLAYER_ID_KEY);
}

export function registerYantrixFunctions() {
	if (alreadyRegistered) return;
	alreadyRegistered = true;

	const custom = { getPlayerId };
	for (const fd of registries) fd.register(custom);
}
