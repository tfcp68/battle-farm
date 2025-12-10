// src/yantrix/register-functions.ts
import { functionDictionary as windowModeFD } from '~/fsm/window/WindowModeAutomata';
import { functionDictionary as windowMenuFD } from '~/fsm/window/WindowMenuAutomata';
import { functionDictionary as windowLobbyFD } from '~/fsm/window/WindowLobbyAutomata';
import type { Services } from '~/services/createServices';

const registries = [windowModeFD, windowMenuFD, windowLobbyFD].filter(Boolean);
let alreadyRegistered = false;

export function registerYantrixFunctions(services: Services) {
	if (alreadyRegistered) return;
	alreadyRegistered = true;

	const getPlayerId = async () => {
		return await services.controllers.players.getCurrentPlayerId();
	};

	const custom = { getPlayerId };
	for (const fd of registries) fd.register(custom);
}
