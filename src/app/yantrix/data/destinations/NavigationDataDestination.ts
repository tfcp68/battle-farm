import { uniqId } from '@yantrix/core';
import WindowModeAutomata, { statesDictionary } from '~/shared/lib/fsm/window/WindowModeAutomata';
import { getStateName } from '~/shared/helpers/fsm';
import { navigateTo } from '~/app/yantrix/navigationRef';
import { ROUTE_BY_STATE_ID } from '~/app/routes';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { fsmLogger } from '~/shared/lib/fsm/devLogger';
import {
	AbstractWindowDataDestination,
	type DomainEvent,
} from '../shared/AbstractWindowDataDestination';

// Events that may trigger a route change (superset — false positives re-check the current state).
const NAV_EVENTS = [
	WindowDomainEvents.profile_created,
	WindowDomainEvents.profile_cleared,
	WindowDomainEvents.session_restored,
	WindowDomainEvents.intro_complete,
	WindowDomainEvents.room_create_requested,
	WindowDomainEvents.room_connected,
	WindowDomainEvents.room_connect_failed,
	WindowDomainEvents.lobby_created,
	WindowDomainEvents.mode_join_accepted,
	WindowDomainEvents.menu_join_accepted,
	WindowDomainEvents.request_rejected,
	WindowDomainEvents.request_timeout,
	WindowDomainEvents.join_game_request,
	WindowDomainEvents.cancel_game_request,
	WindowDomainEvents.lobby_closed,
	WindowDomainEvents.player_exit,
	WindowDomainEvents.player_cancel,
];

interface NavigationPacket {
	/** May be `null` for events without a numeric id (defensive — shouldn't happen in practice). */
	eventId: number | null;
}

/**
 * Navigation destination — re-routes the React Router on FSM transitions.
 *
 * Class-based replacement for `defineDestination`-style
 * `createNavigationDestination`. Microtask deferral (which `defineDestination`
 * provided manually) is given for free by the framework: `resolver` is invoked
 * inside `_sendDataPacket().then(...)`, so by the time `resolve()` runs the
 * synchronously-subscribed FSM has already consumed the event and transitioned.
 */
export class NavigationDataDestination extends AbstractWindowDataDestination<NavigationPacket> {
	readonly #modeFSM: InstanceType<typeof WindowModeAutomata>;
	#lastRoute: string | null = null;

	constructor(opts: { modeFSM: InstanceType<typeof WindowModeAutomata>; id?: string }) {
		super({
			id: opts.id ?? `navigation_${uniqId(4)}`,
			triggers: Object.fromEntries(
				NAV_EVENTS.map((eventId) => [
					eventId,
					(event: DomainEvent): NavigationPacket | null => ({ eventId: event.event }),
				]),
			),
		});
		this.#modeFSM = opts.modeFSM;
	}

	protected resolve(packet: NavigationPacket): null {
		const state = this.#modeFSM.state;
		if (state === null) {
			fsmLogger()?.logNavigationSkipped('modeFSM.state is null');
			return null;
		}
		// Only for log messages — routing itself is keyed by state id.
		const stateName = getStateName(statesDictionary, state) ?? String(state);

		const route = ROUTE_BY_STATE_ID[state];
		if (!route) {
			fsmLogger()?.logNavigationSkipped(`no route mapped for state=${stateName}`);
		} else if (route === this.#lastRoute) {
			fsmLogger()?.logNavigationSkipped(`already at ${route} (state=${stateName})`);
		} else {
			fsmLogger()?.logNavigation(
				route,
				`${stateName} (event=${fsmLogger()?.getEventName(packet.eventId)})`,
			);
			this.#lastRoute = route;
			navigateTo(route, { replace: true });
		}
		return null;
	}
}
