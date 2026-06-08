import { CoreLoop } from '@yantrix/core';
import WindowModeAutomata, {
	eventDictionary as modeEvents,
	statesDictionary as modeStates,
} from '~/shared/lib/fsm/window/WindowModeAutomata';
import WindowMenuAutomata, {
	eventDictionary as menuEvents,
	statesDictionary as menuStates,
} from '~/shared/lib/fsm/window/WindowMenuAutomata';
import WindowLobbyAutomata, {
	eventDictionary as lobbyEvents,
	statesDictionary as lobbyStates,
} from '~/shared/lib/fsm/window/WindowLobbyAutomata';
import { FsmDevLogger, setFsmDevLogger } from '~/shared/lib/fsm/devLogger';

// Data Sources (real IDataSource classes inheriting from createDataSourceAdapter/NamedDataSource).
// Registered directly with CoreLoop, which pumps each source's `eventEmitter()` generator (woken
// by the inherited `setNotifier`). No bus bridge needed.
import { UIBridgeDataSource } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { QueryDomainDataSource } from '~/app/yantrix/data/sources/QueryDomainDataSource';
import { JoinRequestStatusDataSource } from '~/app/yantrix/data/sources/JoinRequestStatusDataSource';
import { JoinRequestTimeoutDataSource } from '~/app/yantrix/data/sources/JoinRequestTimeoutDataSource';
import { AuthStatusDataSource } from '~/app/yantrix/data/sources/AuthStatusDataSource';

// Data Destinations (real IDataDestination classes inheriting from createDataDestinationAdapter/
// NamedDataDestination). Registered directly with CoreLoop, which subscribes their bound events.
import { AuthSignedOutDataDestination } from '~/app/yantrix/data/destinations/AuthSignedOutDataDestination';
import { NavigationDataDestination } from '~/app/yantrix/data/destinations/NavigationDataDestination';
import { NotificationsDataDestination } from '~/app/yantrix/data/destinations/NotificationsDataDestination';
import { LobbyRequestsDataDestination } from '~/app/yantrix/data/destinations/LobbyRequestsDataDestination';
import { DomainCommandsDataDestination } from '~/app/yantrix/data/destinations/DomainCommandsDataDestination';

// Promise adapters — Data Source + Data Destination pairs wired via IOPromiseAdapter pattern.
import { createAuthAdapter } from '~/app/yantrix/data/adapters/auth/createAuthAdapter';
import { createLobbyCommandsAdapter } from '~/app/yantrix/data/adapters/lobby-commands/createLobbyCommandsAdapter';

import type { Services } from '~/shared/services/createServices';
import type { QueryClient } from '@tanstack/react-query';

type EventId = number;

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

	loop.registerAutomata(modeFSM);
	loop.registerAutomata(menuFSM);
	loop.registerAutomata(lobbyFSM);

	const eventNames = new Map<number, string>();
	for (const [n, id] of Object.entries(modeEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(menuEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(lobbyEvents)) eventNames.set(id, n);
	const logger = new FsmDevLogger(
		[
			{ name: 'mode',  instance: modeFSM,  states: modeStates  },
			{ name: 'menu',  instance: menuFSM,  states: menuStates  },
			{ name: 'lobby', instance: lobbyFSM, states: lobbyStates },
		],
		eventNames,
	);
	setFsmDevLogger(logger);
	logger.snapshot('initial (before loop.start)');

	loop.start();

	// ── Sources ───────────────────────────────────────────────────────────────
	// Every source is a real IDataSource; CoreLoop pumps its `eventEmitter()` generator,
	// woken by the inherited `setNotifier` after each push. No bus bridge, no tick.

	loop.registerSource(new UIBridgeDataSource());
	loop.registerSource(new QueryDomainDataSource({ queryClient: deps.queryClient }));
	loop.registerSource(new JoinRequestStatusDataSource({
		queryClient: deps.queryClient,
		modeFSM,
		services: deps.services,
	}));
	loop.registerSource(new JoinRequestTimeoutDataSource({ modeFSM }));
	loop.registerSource(new AuthStatusDataSource());

	// ── Promise adapters ──────────────────────────────────────────────────────
	// Each adapter pairs a Data Source with a Data Destination via the
	// IOPromiseAdapter pattern (resolver → onResolved → source.push → responseMapper → bus).

	const authAdapter = createAuthAdapter({
		services: deps.services,
		queryClient: deps.queryClient,
	});
	loop.registerSource(authAdapter.source);
	loop.registerDestination(authAdapter.destination);

	const lobbyCommandsAdapter = createLobbyCommandsAdapter({
		services: deps.services,
		queryClient: deps.queryClient,
	});
	loop.registerSource(lobbyCommandsAdapter.source);
	loop.registerDestination(lobbyCommandsAdapter.destination);

	// ── Fire-and-forget destinations ──────────────────────────────────────────
	// No paired source — these just run a side effect, no follow-up event.

	loop.registerDestination(
		new AuthSignedOutDataDestination({ services: deps.services, queryClient: deps.queryClient }),
	);
	loop.registerDestination(
		new DomainCommandsDataDestination({ services: deps.services, queryClient: deps.queryClient }),
	);
	loop.registerDestination(
		new LobbyRequestsDataDestination({ services: deps.services, queryClient: deps.queryClient }),
	);
	loop.registerDestination(new NavigationDataDestination({ modeFSM }));
	loop.registerDestination(new NotificationsDataDestination());

	logger.snapshot('after all sources+destinations registered');

	machines = {
		mode: { instance: modeFSM, id: modeFSM.correlationId },
		menu: { instance: menuFSM, id: menuFSM.correlationId },
		lobby: { instance: lobbyFSM, id: lobbyFSM.correlationId },
	};
	return machines;
}
