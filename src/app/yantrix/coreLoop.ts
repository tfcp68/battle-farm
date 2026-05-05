/**
 * Client-side entry point for bootstrapping the Yantrix CoreLoop.
 * Canonical location: src/app/yantrix/coreLoop.ts
 */

import { CoreLoop } from '@yantrix/core';
import WindowModeAutomata from '~/shared/lib/fsm/window/WindowModeAutomata';
import WindowMenuAutomata from '~/shared/lib/fsm/window/WindowMenuAutomata';
import WindowLobbyAutomata from '~/shared/lib/fsm/window/WindowLobbyAutomata';

import { createUIBridgeSource } from '~/app/yantrix/sources/uiBridgeSource';
import { createQueryDomainEventSource } from '~/app/yantrix/sources/queryDomainEventSource';
import { createDomainCommandsDestination } from '~/app/yantrix/destinations/domainCommandsDestination';

import type { Services } from '~/shared/services/createServices';
import type { QueryClient } from '@tanstack/react-query';

type EventId = number;

export const windowAutomataIds = {
	mode: WindowModeAutomata.id,
	menu: WindowMenuAutomata.id,
	lobby: WindowLobbyAutomata.id,
} as const;

export type Machines = Record<string, {
	instance: WindowModeAutomata | WindowMenuAutomata | WindowLobbyAutomata;
	id: string;
}>;

let loop: CoreLoop<EventId, Record<number, unknown>> | null = null;
let machines: Machines | null = null;

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		try { loop?.stop?.(); } catch { /* ignore */ }
		loop = null;
		machines = null;
	});
}

export function startYantrixCore(deps: { services: Services; queryClient: QueryClient }): Machines {
	if (loop && machines) return machines;

	loop = new CoreLoop<EventId, Record<number, unknown>>();

	const modeFSM = new WindowModeAutomata();
	const menuFSM = new WindowMenuAutomata();
	const lobbyFSM = new WindowLobbyAutomata();

	loop.registerAutomata(windowAutomataIds.mode, modeFSM);
	loop.registerAutomata(windowAutomataIds.menu, menuFSM);
	loop.registerAutomata(windowAutomataIds.lobby, lobbyFSM);

	loop.start();

	loop.registerSource(createUIBridgeSource());
	loop.registerSource(createQueryDomainEventSource({ queryClient: deps.queryClient }));
	loop.registerDestination(createDomainCommandsDestination({ services: deps.services, queryClient: deps.queryClient }));


	machines = {
		mode: { instance: modeFSM, id: windowAutomataIds.mode },
		menu: { instance: menuFSM, id: windowAutomataIds.menu },
		lobby: { instance: lobbyFSM, id: windowAutomataIds.lobby },
	};
	return machines;
}
