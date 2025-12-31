/**
 * Client-side entry point for bootstrapping the Yantrix CoreLoop.
 * - Instantiates and registers window FSMs.
 * - Wires event sources (UI bridge and domain events from the query cache).
 * - Wires a destination that executes domain commands (mutations/services).
 * The module is idempotent and uses lazy singleton initialization.
 */

import { CoreLoop } from '@yantrix/core';
import WindowModeAutomata from '~/fsm/window/WindowModeAutomata';
import WindowMenuAutomata from '~/fsm/window/WindowMenuAutomata';
import WindowLobbyAutomata from '~/fsm/window/WindowLobbyAutomata';

import { createUIBridgeSource } from '~/yantrix/sources/uiBridgeSource';
import { createQueryDomainEventSource } from '~/yantrix/sources/queryDomainEventSource';
import { createDomainCommandsDestination } from '~/yantrix/destinations/domainCommandsDestination';

import type { Services } from '~/services/createServices';
import type { QueryClient } from '@tanstack/react-query';

// Numeric event identifier used by the CoreLoop.
type EventId = number;

export const windowAutomataIds = {
	mode: WindowModeAutomata.id,
	menu: WindowMenuAutomata.id,
	lobby: WindowLobbyAutomata.id,
} as const;


/**
 * References to window-level state machines exposed to the UI.
 * Keep these to interact with FSMs from hooks/controllers.
 */
export type Machines = Record<string, {
	instance: WindowModeAutomata | WindowMenuAutomata | WindowLobbyAutomata;
	id: string;
}>

// Single CoreLoop instance for the entire application (lazy singleton).
let loop: CoreLoop<EventId, Record<number, any>> | null = null;
// Cached FSM instances to avoid re-creating them on repeated calls.
let machines: Machines | null = null;

/**
 * Start the Yantrix CoreLoop and wire up FSMs, sources, and destinations.
 * Safe to call multiple times; returns the same machine instances.
 *
 * @param deps.services Domain services used by the destination (mutations).
 * @param deps.queryClient React Query client used as a domain-events source.
 * @returns A struct with created window FSM instances.
 */
export function startYantrixCore(deps: { services: Services; queryClient: QueryClient }): Machines {
	if (loop && machines) return machines; // Already initialized — return the singleton.

	// Initialize the event-processing core.
	loop = new CoreLoop<EventId, Record<number, any>>();

	// Create window state machines.
	const modeFSM = new WindowModeAutomata();
	const menuFSM = new WindowMenuAutomata();
	const lobbyFSM = new WindowLobbyAutomata();

	// Register machines with fixed identifiers.
	loop.registerAutomata(windowAutomataIds.mode, modeFSM);
	loop.registerAutomata(windowAutomataIds.menu, menuFSM);
	loop.registerAutomata(windowAutomataIds.lobby, lobbyFSM);

	loop.start();

	// Event sources:
	// - UI bridge: dispatch user-driven events into the CoreLoop
	loop.registerSource(createUIBridgeSource());
	// - Query client: emit domain events on cache/state changes
	loop.registerSource(createQueryDomainEventSource({ queryClient: deps.queryClient }));

	// Domain commands destination (mutations/service calls) initiated by machines.
	loop.registerDestination(createDomainCommandsDestination({ services: deps.services, queryClient: deps.queryClient }));

	// Expose created machines for UI consumption.
	machines = {
		mode: {
			instance: modeFSM,
			id: windowAutomataIds.mode
		},
		menu: {
				instance: menuFSM,
				id: windowAutomataIds.menu
		},
		lobby: {
				instance: lobbyFSM,
				id: windowAutomataIds.lobby
		}
	};
	return machines;
}
