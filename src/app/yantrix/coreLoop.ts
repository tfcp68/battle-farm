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
import GameLoopAutomata, {
	eventDictionary as gameLoopEvents,
	statesDictionary as gameLoopStates
} from '~/shared/lib/fsm/game/GameLoopAutomata';
import TurnLoopAutomata, {
	eventDictionary as turnLoopEvents,
	statesDictionary as turnLoopStates
} from '~/shared/lib/fsm/game/TurnLoopAutomata';
import PlayingCardsAutomata, {
	eventDictionary as playEvents,
	statesDictionary as playStates
} from '~/shared/lib/fsm/game/PlayingCardsAutomata';
import TargetModeAutomata, {
	statesDictionary as targetStates
} from '~/shared/lib/fsm/game/TargetModeAutomata';
import HarvestAutomata, {
	eventDictionary as harvestEvents,
	statesDictionary as harvestStates
} from '~/shared/lib/fsm/game/HarvestAutomata';
import ShoppingAutomata, {
	eventDictionary as shoppingEvents,
	statesDictionary as shoppingStates
} from '~/shared/lib/fsm/game/ShoppingAutomata';
import TradingAutomata, {
	eventDictionary as tradingEvents,
	statesDictionary as tradingStates
} from '~/shared/lib/fsm/game/TradingAutomata';
import FertilizingAutomata, {
	eventDictionary as fertilizingEvents,
	statesDictionary as fertilizingStates
} from '~/shared/lib/fsm/game/FertilizingAutomata';
import WaitingAutomata, {
	eventDictionary as waitingEvents,
	statesDictionary as waitingStates
} from '~/shared/lib/fsm/game/WaitingAutomata';
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
import { MatchSetupDataDestination } from '~/app/yantrix/data/destinations/MatchSetupDataDestination';
import { MatchEntryDataDestination } from '~/app/yantrix/data/destinations/MatchEntryDataDestination';
import { MatchDriverDataDestination } from '~/app/yantrix/data/destinations/MatchDriverDataDestination';
import { MatchOutcomeDataDestination } from '~/app/yantrix/data/destinations/MatchOutcomeDataDestination';
import { PhaseFactsDataDestination } from '~/app/yantrix/data/destinations/PhaseFactsDataDestination';
import { MatchIntentDataDestination } from '~/app/yantrix/data/destinations/MatchIntentDataDestination';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { attachGameEffects } from '~/app/yantrix/gameModel';
import { emitMatchEvent, isMatchHost, startMatchNet } from '~/app/yantrix/matchNet';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import { startTradeSignals } from '~/app/yantrix/tradeSignals';
import { startPhaseClock } from '~/app/yantrix/phaseClock';
import { asPlayerId, type PlayerId } from '~/entities/game';
import { getCurrentPlayerId } from '~/entities/profile/currentProfile';
import { connectRoomToQueryCache } from '~/entities/room/RoomQueryBridge';

// Promise adapters — Data Source + Data Destination pairs
import { createRoomCommandsAdapter } from '~/app/yantrix/data/adapters/room-commands/createRoomCommandsAdapter';

import type { Services } from '~/shared/services/createServices';
import type { QueryClient } from '@tanstack/react-query';

type EventId = number;

export type Machines = Record<string, {
	instance:
		| WindowModeAutomata
		| WindowMenuAutomata
		| WindowLobbyAutomata
		| GameLoopAutomata
		| TurnLoopAutomata
		| PlayingCardsAutomata
		| TargetModeAutomata
		| HarvestAutomata
		| ShoppingAutomata
		| TradingAutomata
		| FertilizingAutomata
		| WaitingAutomata;
	id: string;
}>;

let loop: TimedCoreLoop<EventId, Record<number, unknown>> | null = null;
let machines: Machines | null = null;
let disconnectRoomBridge: (() => void) | null = null;
let disconnectMatchNet: (() => void) | null = null;
let stopPhaseClock: (() => void) | null = null;
let stopTradeSignals: (() => void) | null = null;

/** The local player as the non-React side of the app sees them. */
const getCurrentViewerId = (): PlayerId | null => {
	const playerId = getCurrentPlayerId();
	return playerId ? asPlayerId(playerId) : null;
};

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		try { loop?.stop?.(); } catch { /* ignore */ }
		disconnectRoomBridge?.();
		disconnectRoomBridge = null;
		disconnectMatchNet?.();
		disconnectMatchNet = null;
		stopPhaseClock?.();
		stopPhaseClock = null;
		stopTradeSignals?.();
		stopTradeSignals = null;
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

	// Match engine. Registered at boot rather than spun up on `game_started`:
	// a session plays one match at a time, and both machines idle harmlessly
	// (PLANNED / WAITING) until `match_created` arrives, which also re-deals them
	// for a second match. Dynamic registration would buy a fresh instance per
	// match at the cost of a lifecycle React has to observe.
	const gameLoopFSM = new GameLoopAutomata();
	const turnLoopFSM = new TurnLoopAutomata();

	// One machine per turn phase, plus target mode: the viewer's local
	// interaction, opened and closed by `startPhaseSelection` off the model.
	// Local to this peer — see `matchUiEvents.ts` — and all idle on someone
	// else's turn, except `waiting`, which is the flow for exactly that.
	const playFSM = new PlayingCardsAutomata();
	const targetFSM = new TargetModeAutomata();
	const harvestFSM = new HarvestAutomata();
	const shoppingFSM = new ShoppingAutomata();
	const tradingFSM = new TradingAutomata();
	const fertilizingFSM = new FertilizingAutomata();
	const waitingFSM = new WaitingAutomata();

	loop.registerAutomata(modeFSM);
	loop.registerAutomata(menuFSM);
	loop.registerAutomata(lobbyFSM);
	loop.registerAutomata(gameLoopFSM);
	loop.registerAutomata(turnLoopFSM);
	loop.registerAutomata(playFSM);
	loop.registerAutomata(targetFSM);
	loop.registerAutomata(harvestFSM);
	loop.registerAutomata(shoppingFSM);
	loop.registerAutomata(tradingFSM);
	loop.registerAutomata(fertilizingFSM);
	loop.registerAutomata(waitingFSM);

	// The Effect Layer joins the bus after every automaton: subscribers run in
	// subscription order, and FSM transitions must precede model writes.
	const modelStore = attachGameEffects(loop);

	const eventNames = new Map<number, string>();
	for (const [n, id] of Object.entries(modeEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(menuEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(lobbyEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(gameLoopEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(turnLoopEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(playEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(harvestEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(shoppingEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(tradingEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(fertilizingEvents)) eventNames.set(id, n);
	for (const [n, id] of Object.entries(waitingEvents)) eventNames.set(id, n);
	const logger = new FsmDevLogger(
		[
			{ name: 'mode',  instance: modeFSM,  states: modeStates  },
			{ name: 'menu',  instance: menuFSM,  states: menuStates  },
			{ name: 'lobby', instance: lobbyFSM, states: lobbyStates },
			{ name: 'game',  instance: gameLoopFSM, states: gameLoopStates },
			{ name: 'turn',  instance: turnLoopFSM, states: turnLoopStates },
			{ name: 'play',  instance: playFSM, states: playStates },
			{ name: 'target', instance: targetFSM, states: targetStates },
			{ name: 'harvest', instance: harvestFSM, states: harvestStates },
			{ name: 'shopping', instance: shoppingFSM, states: shoppingStates },
			{ name: 'trading', instance: tradingFSM, states: tradingStates },
			{ name: 'fertilizing', instance: fertilizingFSM, states: fertilizingStates },
			{ name: 'waiting', instance: waitingFSM, states: waitingStates },
		],
		eventNames,
	);
	setFsmDevLogger(logger);
	logger.snapshot('initial (before loop.start)');

	loop.start();

	// Room snapshots land in the query cache, which QueryDomainDataSource diffs
	// into domain events — the P2P transport's only touchpoint with the FSM layer.
	disconnectRoomBridge = connectRoomToQueryCache(deps.services.rooms, deps.queryClient);

	// The match's own channel over the same room: opens with the room, so a peer
	// that joins mid-game has asked for the event stream before the first event
	// of its own turn exists.
	disconnectMatchNet = startMatchNet({ rooms: deps.services.rooms });

	// The referee's clock. Watches the model rather than the bus, because what
	// starts a phase's window is the model landing in that phase — whether it got
	// there from a local move or from a peer's event down the wire.
	stopPhaseClock = startPhaseClock({
		store: modelStore,
		emit: emitMatchEvent,
		isSequencer: isMatchHost,
	});

	// The two trade cues no turn transition produces, because both depend on what
	// another player did. The phase boundaries themselves are the turn machine's
	// own `emit/*_phase_opened` — see `PhaseFactsDataDestination` below.
	stopTradeSignals = startTradeSignals({
		store: modelStore,
		emit: (event, meta) => emitDomainEvent(MatchUiEvents[event], meta),
		getViewerId: getCurrentViewerId,
	});

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
	loop.registerDestination(new MatchSetupDataDestination({ queryClient: deps.queryClient }));
	loop.registerDestination(new MatchEntryDataDestination({ modeFSM }));
	loop.registerDestination(new MatchDriverDataDestination());
	loop.registerDestination(new MatchOutcomeDataDestination());
	loop.registerDestination(
		new PhaseFactsDataDestination({ store: modelStore, getViewerId: getCurrentViewerId }),
	);
	loop.registerDestination(new MatchIntentDataDestination());

	logger.snapshot('after all sources+destinations registered');

	machines = {
		mode: { instance: modeFSM, id: modeFSM.correlationId },
		menu: { instance: menuFSM, id: menuFSM.correlationId },
		lobby: { instance: lobbyFSM, id: lobbyFSM.correlationId },
		game: { instance: gameLoopFSM, id: gameLoopFSM.correlationId },
		turn: { instance: turnLoopFSM, id: turnLoopFSM.correlationId },
		play: { instance: playFSM, id: playFSM.correlationId },
		target: { instance: targetFSM, id: targetFSM.correlationId },
		harvest: { instance: harvestFSM, id: harvestFSM.correlationId },
		shopping: { instance: shoppingFSM, id: shoppingFSM.correlationId },
		trading: { instance: tradingFSM, id: tradingFSM.correlationId },
		fertilizing: { instance: fertilizingFSM, id: fertilizingFSM.correlationId },
		waiting: { instance: waitingFSM, id: waitingFSM.correlationId },
	};
	return machines;
}
