import { statesDictionary as modeStates } from '~/shared/lib/fsm/window/WindowModeAutomata';

/**
 * The pure half of the `match_created` → `game_start` seam, kept apart from
 * `MatchEntryDataDestination` for the same reason as `matchSetup.ts`: the
 * destination classes pull in the UI bridge, whose HMR guard (`import.meta`)
 * the CJS test build refuses to compile.
 */

export interface MatchEntryPacket {
	gameId: string;
	playerIds: string[];
	lobbyId: string;
}

interface MatchCreatedMeta {
	matchId: string;
	seats: { playerId: string }[];
}

/**
 * Catches a window flow up to a match that started without it.
 *
 * The host starts a match by emitting `game_start`, which is what moves its mode
 * FSM out of the lobby. A guest never emits that event — all it ever sees is the
 * canonical stream — so its mode FSM sat in GAME_LOBBY while its model was being
 * dealt underneath, and the whole match played out on the `/lobby` route.
 *
 * `modeState` is the guard *and* the reason this needs no host/guest branch:
 * GAME_LOBBY is the only state with a `START_GAME` transition, so the check is
 * "can this event still be consumed?" rather than "who am I?". On the host the
 * FSM is already IN_GAME by the time its own `match_created` comes back off the
 * bus, which is also what stops `MatchSetupDataDestination` — subscribed to
 * `game_start` — from dealing the match a second time, and then forever.
 */
export function buildMatchEntry(modeState: number | null, eventMeta: unknown): MatchEntryPacket | null {
	if (modeState !== modeStates.GAME_LOBBY) return null;

	const { matchId, seats } = (eventMeta ?? {}) as Partial<MatchCreatedMeta>;
	if (!matchId || !Array.isArray(seats) || seats.length === 0) return null;

	const playerIds = seats.map((seat) => seat?.playerId).filter((id): id is string => !!id);
	if (playerIds.length !== seats.length) return null;

	// One value under three names: the room code is the lobby id, the match id
	// and the seed's source (`seedFromRoomCode`), and `useStartGame` passes it
	// as all three too.
	return { gameId: matchId, playerIds, lobbyId: matchId };
}
