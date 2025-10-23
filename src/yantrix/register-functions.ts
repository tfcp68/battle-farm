// Единая точка регистрации пользовательских функций Yantrix без localStorage.
// Источник данных — runtime-config (обновляем через React провайдер или напрямую).

import { functionDictionary as windowModeFD } from '~/src/fsm/window/WindowModeAutomata';
import { functionDictionary as windowMenuFD } from '~/src/fsm/window/WindowMenuAutomata';
import { functionDictionary as windowLobbyFD } from '~/src/fsm/window/WindowLobbyAutomata';
import { getRuntimeConfig } from './runtime-config';

const registries = [windowModeFD, windowMenuFD, windowLobbyFD].filter(Boolean);

let alreadyRegistered = false;

export function registerYantrixFunctions() {
	if (alreadyRegistered) return;
	alreadyRegistered = true;

	const getPlayerId = () => {
		const { playerId } = getRuntimeConfig();
		return playerId ?? 'P1';
	};

	const custom = {
		getPlayerId,
	};

	for (const fd of registries) {
		fd.register(custom);
	}
}