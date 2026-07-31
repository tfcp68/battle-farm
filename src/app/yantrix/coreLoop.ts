import { TimedCoreLoop } from '@yantrix/core';
import WindowModeAutomata, {
	eventDictionary as modeEvents,
	statesDictionary as modeStates
} from '~/shared/lib/fsm/window/WindowModeAutomata';
import WindowMenuAutomata, {
	eventDictionary as menuEvents,
	statesDictionary as menuStates
} from '~/shared/lib/fsm/window/WindowMenuAutomata';
import WindowLobbyAutomata, {
	eventDictionary as lobbyEvents,
	statesDictionary as lobbyStates
} from '~/shared/lib/fsm/window/WindowLobbyAutomata';
import { FsmDevLogger, setFsmDevLogger } from '~/shared/lib/fsm/devLogger';
import { UIBridgeDataSource } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { QueryDomainDataSource } from '~/app/yantrix/data/sources/QueryDomainDataSource';
import { RoomRequestResultDataSource } from '~/app/yantrix/data/sources/RoomRequestResultDataSource';
import { RoomClosedDataSource } from '~/app/yantrix/data/sources/RoomClosedDataSource';
import { InviteLinkDataSource } from '~/app/yantrix/data/sources/InviteLinkDataSource';
import { JoinRequestTimeoutDataSource } from '~/app/yantrix/data/sources/JoinRequestTimeoutDataSource';
import { ProfileStatusDataSource } from '~/app/yantrix/data/sources/ProfileStatusDataSource';
import { ProfileClearedDataDestination } from '~/app/yantrix/data/destinations/ProfileClearedDataDestination';
import { NavigationDataDestination } from '~/app/yantrix/data/destinations/NavigationDataDestination';
import { NotificationsDataDestination } from '~/app/yantrix/data/destinations/NotificationsDataDestination';
import { LobbyRequestsDataDestination } from '~/app/yantrix/data/destinations/LobbyRequestsDataDestination';
import { DomainCommandsDataDestination } from '~/app/yantrix/data/destinations/DomainCommandsDataDestination';
import { connectRoomToQueryCache } from '~/entities/room/RoomQueryBridge';

// Promise adapters — Data Source + Data Destination pairs
import { createRoomCommandsAdapter } from '~/app/yantrix/data/adapters/room-commands/createRoomCommandsAdapter';

import type { Services } from '~/shared/services/createServices';
import type { QueryClient } from '@tanstack/react-query';

type EventId = number;

export type Machines = Record<string, {
	instance: WindowModeAutomata | WindowMenuAutomata | WindowLobbyAutomata;
	id: string;
}>;

let loop: TimedCoreLoop<EventId, Record<number, unknown>> | null = null;
let machines: Machines | null = null;
let disconnectRoomBridge: (() => void) | null = null;

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		try { loop?.stop?.(); } catch { /* ignore */ }
		disconnectRoomBridge?.();
		disconnectRoomBridge = null;
		loop = null;
		machines = null;
	});
}

export function startYantrixCore(deps: { services: Services; queryClient: QueryClient }): Machines {
	if (loop && machines) return machines;

	loop = new TimedCoreLoop<EventId, Record<number, unknown>>();

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

	// Room snapshots land in the query cache, which QueryDomainDataSource diffs
	// into domain events — the P2P transport's only touchpoint with the FSM layer.
	disconnectRoomBridge = connectRoomToQueryCache(deps.services.rooms, deps.queryClient);

	// ── Sources ───────────────────────────────────────────────────────────────
	// Each source only enqueues events; CoreLoop drains every source's `eventEmitter()`
	// generator on its tick and publishes to the bus.

	loop.registerSource(new UIBridgeDataSource());
	loop.registerSource(new QueryDomainDataSource({ queryClient: deps.queryClient }));
	loop.registerSource(new RoomRequestResultDataSource({ services: deps.services }));
	loop.registerSource(new RoomClosedDataSource({ services: deps.services }));
	loop.registerSource(new InviteLinkDataSource({ modeFSM }));
	loop.registerSource(new JoinRequestTimeoutDataSource({ modeFSM }));
	loop.registerSource(new ProfileStatusDataSource());

	// ── Promise adapters ──────────────────────────────────────────────────────
	// Each adapter pairs a Data Source with a Data Destination via the
	// IOPromiseAdapter pattern (resolver -> onResolved -> source.push -> responseMapper -> bus).

	const roomCommandsAdapter = createRoomCommandsAdapter({
		services: deps.services,
		queryClient: deps.queryClient,
	});
	loop.registerSource(roomCommandsAdapter.source);
	loop.registerDestination(roomCommandsAdapter.destination);

	// ── Fire-and-forget destinations ──────────────────────────────────────────
	// No paired source — these just run a side effect, no follow-up event.

	loop.registerDestination(
		new ProfileClearedDataDestination({ services: deps.services, queryClient: deps.queryClient }),
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
