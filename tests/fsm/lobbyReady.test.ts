import { describe, expect, it } from '@jest/globals';
import WindowLobbyAutomata, {
	eventDictionary as lobbyEvents,
	statesDictionary as lobbyStates,
} from '~/shared/lib/fsm/window/WindowLobbyAutomata';
import { canStart } from '~/features/start-game/canStart';

const CODE = 'K7QM2X';
const HOST = 'player-host';
const GUEST = 'player-guest';

/** Drives the machine the way CoreLoop does: bus event → actions → dispatch. */
function dispatch(fsm: WindowLobbyAutomata, event: number, meta: Record<string, unknown> | null) {
	const actions = fsm.eventAdapter?.handleEvent({ event, meta }) ?? [];
	for (const action of actions) fsm.dispatch(action);
}

function readyMapOf(fsm: WindowLobbyAutomata): Record<string, number> {
	return (fsm.getContext()?.context?.playerReadyMap ?? {}) as Record<string, number>;
}

/** A room the host opened, with one guest admitted — the smallest legal table. */
function twoPlayerLobby() {
	const fsm = new WindowLobbyAutomata();
	dispatch(fsm, lobbyEvents.lobby_created, { gameId: CODE, playerId: HOST, isHost: 1 });
	dispatch(fsm, lobbyEvents.join_game_request, { gameId: CODE, playerId: GUEST });
	return fsm;
}

describe('lobby FSM — readiness', () => {
	it('has an event bound to READY at all', () => {
		// The transition existed from the first diagram with nothing subscribed to
		// it, so the whole ready path was unreachable. This is the binding.
		expect(lobbyEvents.player_ready_changed).toEqual(expect.any(Number));
	});

	/**
	 * `setAttr` writes into the object it is given, so `setAttr(#playerReadyMap, …)`
	 * would rewrite the *previous* context in place and every before/after
	 * comparison would see nothing happen — which is how the trade panel went
	 * blind (see `tests/fsm/phaseMachines.test.ts`). The reducer copies first.
	 */
	it('leaves the previous context alone when readiness changes', () => {
		const fsm = twoPlayerLobby();
		const previous = fsm.getContext()?.context as Record<string, unknown>;
		const snapshot = JSON.stringify(previous);

		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: GUEST, isReady: 1 });

		expect(JSON.stringify(previous)).toBe(snapshot);
		expect(readyMapOf(fsm)).toEqual({ [HOST]: 0, [GUEST]: 1 });
	});

	it('records a player as ready and takes it back', () => {
		const fsm = twoPlayerLobby();
		expect(readyMapOf(fsm)).toEqual({ [HOST]: 0, [GUEST]: 0 });

		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: GUEST, isReady: 1 });
		expect(readyMapOf(fsm)).toEqual({ [HOST]: 0, [GUEST]: 1 });
		expect(fsm.state).toBe(lobbyStates.LOBBY);

		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: GUEST, isReady: 0 });
		expect(readyMapOf(fsm)).toEqual({ [HOST]: 0, [GUEST]: 0 });
	});

	it('reaches GAME_STARTING only once everyone has said so, host included', () => {
		const fsm = twoPlayerLobby();

		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: GUEST, isReady: 1 });
		expect(fsm.state).toBe(lobbyStates.LOBBY);

		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: HOST, isReady: 1 });
		expect(fsm.state).toBe(lobbyStates.GAME_STARTING);
	});

	it('does not call a lone host ready — the rules seat two', () => {
		const fsm = new WindowLobbyAutomata();
		dispatch(fsm, lobbyEvents.lobby_created, { gameId: CODE, playerId: HOST, isHost: 1 });

		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: HOST, isReady: 1 });

		expect(readyMapOf(fsm)).toEqual({ [HOST]: 1 });
		expect(fsm.state).toBe(lobbyStates.LOBBY);
	});

	it('leaves GAME_STARTING when someone withdraws', () => {
		const fsm = twoPlayerLobby();
		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: GUEST, isReady: 1 });
		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: HOST, isReady: 1 });
		expect(fsm.state).toBe(lobbyStates.GAME_STARTING);

		// Without an edge out of GAME_STARTING the machine was a trap: un-readying
		// left the roster stuck one state past the lobby.
		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: GUEST, isReady: 0 });
		expect(fsm.state).toBe(lobbyStates.LOBBY);
		expect(readyMapOf(fsm)).toEqual({ [HOST]: 1, [GUEST]: 0 });
	});

	it('still admits a joiner and still takes host corrections from GAME_STARTING', () => {
		const fsm = twoPlayerLobby();
		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: GUEST, isReady: 1 });
		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: HOST, isReady: 1 });

		dispatch(fsm, lobbyEvents.join_game_request, { gameId: CODE, playerId: 'player-late' });
		expect(Object.keys(readyMapOf(fsm))).toHaveLength(3);
		// A new arrival resets the table, so the room is no longer ready.
		expect(fsm.state).toBe(lobbyStates.LOBBY);
	});

	it('takes the authoritative ready map from the host over its own optimistic one', () => {
		const fsm = twoPlayerLobby();
		dispatch(fsm, lobbyEvents.player_ready_changed, { playerId: GUEST, isReady: 1 });

		// The roster round-trip disagrees — the host's answer wins.
		dispatch(fsm, lobbyEvents.player_state_change, {
			playerReadyMap: { [HOST]: 0, [GUEST]: 0 },
		});

		expect(readyMapOf(fsm)).toEqual({ [HOST]: 0, [GUEST]: 0 });
	});

	it('caps the room at six, matching DEFAULT_MAX_PLAYERS', () => {
		const fsm = new WindowLobbyAutomata();
		dispatch(fsm, lobbyEvents.lobby_created, { gameId: CODE, playerId: HOST, isHost: 1 });
		for (let i = 1; i <= 6; i += 1) {
			dispatch(fsm, lobbyEvents.join_game_request, { gameId: CODE, playerId: `guest-${i}` });
		}

		// Host plus five guests; the sixth guest finds no slot.
		expect(Object.keys(readyMapOf(fsm))).toHaveLength(6);
		expect(readyMapOf(fsm)['guest-6']).toBeUndefined();
	});
});

describe('canStart', () => {
	it('needs every seat ready, the host as well', () => {
		expect(canStart([HOST, GUEST], { [HOST]: 1, [GUEST]: 0 })).toBe(false);
		expect(canStart([HOST, GUEST], { [HOST]: 0, [GUEST]: 1 })).toBe(false);
		expect(canStart([HOST, GUEST], { [HOST]: 1, [GUEST]: 1 })).toBe(true);
	});

	it('refuses rosters the rules cannot seat', () => {
		expect(canStart([HOST], { [HOST]: 1 })).toBe(false);
		const seven = Array.from({ length: 7 }, (_, i) => `p${i}`);
		expect(canStart(seven, Object.fromEntries(seven.map((id) => [id, 1])))).toBe(false);
	});
});
