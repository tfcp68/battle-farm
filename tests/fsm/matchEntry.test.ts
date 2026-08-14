import { describe, expect, it } from '@jest/globals';
import WindowModeAutomata, {
	eventDictionary as modeEvents,
	statesDictionary as modeStates,
} from '~/shared/lib/fsm/window/WindowModeAutomata';
import { AppRoutes, ROUTE_BY_STATE_ID } from '~/app/routes';
import { buildMatchEntry } from '~/app/yantrix/data/destinations/matchEntry';
import { buildMatchSetup } from '~/app/yantrix/data/destinations/matchSetup';
import { setCurrentProfile } from '~/entities/profile/currentProfile';

/**
 * A guest never presses Start, so nothing ever emitted `game_start` on its side:
 * its model was dealt off the stream while its window FSM stayed in GAME_LOBBY,
 * and the match played out under the `/lobby` route.
 *
 * The payload is built with the host's own `buildMatchSetup` rather than a
 * hand-written literal — the two halves only meet over the wire, so a drift in
 * that shape is exactly the failure this seam cannot see coming.
 */

const CODE = 'K7QM2X';
const SEATS = ['p-host', 'p-guest'];
const SETUP = buildMatchSetup({ gameId: CODE, playerIds: SEATS }, []);

function dispatch(fsm: WindowModeAutomata, event: number, meta: Record<string, unknown> | null) {
	const actions = fsm.eventAdapter?.handleEvent({ event, meta }) ?? [];
	for (const action of actions) fsm.dispatch(action);
}

/** A guest that was admitted to the room and is sitting in the lobby. */
function admittedGuest() {
	setCurrentProfile({ playerId: 'p-guest', nickname: 'Sam' });
	const fsm = new WindowModeAutomata();
	dispatch(fsm, modeEvents.session_restored, { playerId: 'p-guest' });
	dispatch(fsm, modeEvents.join_game_request, { lobbyId: CODE, playerId: 'p-guest' });
	dispatch(fsm, modeEvents.mode_join_accepted, { playerId: 'p-guest', lobbyId: CODE, gameId: CODE });
	return fsm;
}

describe('a guest entering the match off the stream', () => {
	it('takes the window flow from the lobby to the game screen', () => {
		const fsm = admittedGuest();
		expect(fsm.state).toBe(modeStates.GAME_LOBBY);

		const packet = buildMatchEntry(fsm.state, SETUP);
		expect(packet).toEqual({ gameId: CODE, playerIds: SEATS, lobbyId: CODE });

		dispatch(fsm, modeEvents.game_start, packet as unknown as Record<string, unknown>);

		expect(fsm.state).toBe(modeStates.IN_GAME);
		expect(ROUTE_BY_STATE_ID[modeStates.IN_GAME]).toBe(AppRoutes.game);
	});

	it('stays quiet once the flow is already in the game', () => {
		// The host hears its own `match_created` come back off the bus. Answering it
		// would re-emit `game_start`, which deals a second match — and that one's
		// `match_created` would deal a third.
		const fsm = admittedGuest();
		dispatch(fsm, modeEvents.game_start, { gameId: CODE, playerIds: SEATS, lobbyId: CODE });
		expect(fsm.state).toBe(modeStates.IN_GAME);

		expect(buildMatchEntry(fsm.state, SETUP)).toBeNull();
	});

	it('stays quiet outside the lobby entirely', () => {
		expect(buildMatchEntry(modeStates.MAIN_MENU, SETUP)).toBeNull();
		expect(buildMatchEntry(modeStates.JOIN_REQUEST, SETUP)).toBeNull();
		expect(buildMatchEntry(null, SETUP)).toBeNull();
	});

	it('refuses a payload it cannot seat the table from', () => {
		const lobby = modeStates.GAME_LOBBY;
		expect(buildMatchEntry(lobby, null)).toBeNull();
		expect(buildMatchEntry(lobby, { seats: SETUP.seats })).toBeNull();
		expect(buildMatchEntry(lobby, { matchId: CODE, seats: [] })).toBeNull();
		expect(buildMatchEntry(lobby, { matchId: CODE, seats: 'p-host' })).toBeNull();
		// One nameless seat would otherwise shrink the roster the FSM announces.
		expect(buildMatchEntry(lobby, { matchId: CODE, seats: [{ nickname: 'Sam' }] })).toBeNull();
	});
});
