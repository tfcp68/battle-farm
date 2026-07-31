import { describe, expect, it } from '@jest/globals';
import WindowModeAutomata, {
	eventDictionary as modeEvents,
	statesDictionary as modeStates,
} from '~/shared/lib/fsm/window/WindowModeAutomata';
import { eventDictionary as menuEvents } from '~/shared/lib/fsm/window/WindowMenuAutomata';
import { setCurrentProfile } from '~/entities/profile/currentProfile';

const CODE = 'K7QM2X';

function bootedAutomata() {
	setCurrentProfile({ playerId: 'player-1', nickname: 'Alex' });
	const fsm = new WindowModeAutomata();
	return fsm;
}

/**
 * Drives the machine the way CoreLoop does: the event adapter turns a bus event
 * into actions, which are then dispatched.
 */
function dispatch(fsm: WindowModeAutomata, event: number, meta: Record<string, unknown> | null) {
	const actions = fsm.eventAdapter?.handleEvent({ event, meta }) ?? [];
	for (const action of actions) fsm.dispatch(action);
}

describe('window mode FSM — room entry', () => {
	it('agrees on the numeric id of shared events across automata', () => {
		// windowDomainEvents takes `lobby_created` from the menu dictionary but the
		// mode machine subscribes to it too; a mismatch would silently drop it.
		expect(menuEvents.lobby_created).toBe(modeEvents.lobby_created);
	});

	it('carries the room code into context when the host opens a room', () => {
		const fsm = bootedAutomata();
		dispatch(fsm, modeEvents.session_restored, { playerId: 'player-1' });
		expect(fsm.state).toBe(modeStates.MAIN_MENU);

		dispatch(fsm, modeEvents.room_create_requested, null);
		expect(fsm.state).toBe(modeStates.CONNECTING);

		dispatch(fsm, modeEvents.lobby_created, {
			playerId: 'player-1',
			lobbyId: CODE,
			gameId: CODE,
			isHost: 1,
		});

		expect(fsm.state).toBe(modeStates.GAME_LOBBY);
		expect(fsm.getContext()?.context).toMatchObject({ lobbyId: CODE, gameId: CODE, isHost: 1 });
	});

	it('returns to the menu when connecting fails', () => {
		const fsm = bootedAutomata();
		dispatch(fsm, modeEvents.session_restored, { playerId: 'player-1' });
		dispatch(fsm, modeEvents.join_game_request, { lobbyId: 'NOBODY', playerId: 'player-1' });
		expect(fsm.state).toBe(modeStates.CONNECTING);

		dispatch(fsm, modeEvents.room_connect_failed, { error: 'No response from room NOBODY' });

		// Without this the player is stuck on "Connecting…" with no way back.
		expect(fsm.state).toBe(modeStates.MAIN_MENU);
		expect(fsm.getContext()?.context).toMatchObject({
			authError: 'No response from room NOBODY',
		});
	});

	it('keeps the room in context when the host answers a join request', () => {
		const fsm = bootedAutomata();
		dispatch(fsm, modeEvents.session_restored, { playerId: 'player-1' });
		dispatch(fsm, modeEvents.room_create_requested, null);
		dispatch(fsm, modeEvents.lobby_created, {
			playerId: 'player-1',
			lobbyId: CODE,
			gameId: CODE,
			isHost: 1,
		});

		// APPROVE_REQUEST is a self-transition, so entering GAME_LOBBY runs its
		// context reducer again. It must not wipe what the room is: the lobby page
		// reads lobbyId/isHost from here, and a reset leaves the host looking like
		// a guest in an empty room.
		dispatch(fsm, modeEvents.lobby_request_approved, { requestId: 'guest-1', lobbyId: CODE });

		expect(fsm.state).toBe(modeStates.GAME_LOBBY);
		expect(fsm.getContext()?.context).toMatchObject({
			lobbyId: CODE,
			gameId: CODE,
			isHost: 1,
			playerId: 'player-1',
		});
	});

	it('keeps the room in context when the host rejects a join request', () => {
		const fsm = bootedAutomata();
		dispatch(fsm, modeEvents.session_restored, { playerId: 'player-1' });
		dispatch(fsm, modeEvents.room_create_requested, null);
		dispatch(fsm, modeEvents.lobby_created, {
			playerId: 'player-1',
			lobbyId: CODE,
			gameId: CODE,
			isHost: 1,
		});

		dispatch(fsm, modeEvents.lobby_request_rejected, { requestId: 'guest-1', lobbyId: CODE });

		expect(fsm.getContext()?.context).toMatchObject({ lobbyId: CODE, isHost: 1 });
	});

	it('carries the room code into context when a guest is admitted', () => {
		const fsm = bootedAutomata();
		dispatch(fsm, modeEvents.session_restored, { playerId: 'player-2' });

		dispatch(fsm, modeEvents.join_game_request, { lobbyId: CODE, playerId: 'player-2' });
		expect(fsm.state).toBe(modeStates.CONNECTING);

		dispatch(fsm, modeEvents.room_connected, { lobbyId: CODE, gameId: CODE });
		expect(fsm.state).toBe(modeStates.JOIN_REQUEST);
		expect(fsm.getContext()?.context).toMatchObject({ lobbyId: CODE });

		dispatch(fsm, modeEvents.mode_join_accepted, {
			playerId: 'player-2',
			lobbyId: CODE,
			gameId: CODE,
		});

		expect(fsm.state).toBe(modeStates.GAME_LOBBY);
		expect(fsm.getContext()?.context).toMatchObject({ lobbyId: CODE, gameId: CODE });
	});

	/**
	 * The join request goes out before `room_connected` moves the machine on, so a
	 * host that approves without waiting for a click — anyone already on its roster
	 * — can answer while the guest is still CONNECTING. Dropped, the verdict never
	 * comes again and the guest sits out the 30s timeout.
	 */
	it('admits a guest approved before it left CONNECTING', () => {
		const fsm = bootedAutomata();
		dispatch(fsm, modeEvents.session_restored, { playerId: 'player-2' });

		dispatch(fsm, modeEvents.join_game_request, { lobbyId: CODE, playerId: 'player-2' });
		expect(fsm.state).toBe(modeStates.CONNECTING);

		dispatch(fsm, modeEvents.mode_join_accepted, {
			playerId: 'player-2',
			lobbyId: CODE,
			gameId: CODE,
		});

		expect(fsm.state).toBe(modeStates.GAME_LOBBY);
		expect(fsm.getContext()?.context).toMatchObject({ lobbyId: CODE, gameId: CODE });
	});

	/** A host that vanishes while the guest waits must not cost it the full timeout. */
	it('returns to the menu when the room dies during a join request', () => {
		const fsm = bootedAutomata();
		dispatch(fsm, modeEvents.session_restored, { playerId: 'player-2' });
		dispatch(fsm, modeEvents.join_game_request, { lobbyId: CODE, playerId: 'player-2' });
		dispatch(fsm, modeEvents.room_connected, { lobbyId: CODE, gameId: CODE });
		expect(fsm.state).toBe(modeStates.JOIN_REQUEST);

		dispatch(fsm, modeEvents.lobby_closed, { lobbyId: CODE });
		expect(fsm.state).toBe(modeStates.MAIN_MENU);
	});
});
