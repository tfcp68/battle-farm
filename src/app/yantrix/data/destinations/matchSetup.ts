import type { MatchSeat } from '~/entities/game';
import { asPlayerId, winLimitFor } from '~/entities/game';
import type { RoomPlayer } from '~/entities/room/types';

/**
 * The pure half of the `game_started` → `match_created` seam, kept apart from
 * `MatchSetupDataDestination` so it can be tested: the destination classes pull
 * in the UI bridge, whose HMR guard (`import.meta`) the CJS test build refuses
 * to compile.
 */

/** FNV-1a over the room code — stable everywhere the same code is known. */
export function seedFromRoomCode(code: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < code.length; i++) {
		hash ^= code.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash | 0;
}

/**
 * Seats in the order the mode FSM announced the players, with nicknames looked
 * up in the lobby roster. A player the roster does not know keeps their id as a
 * display name rather than blocking the start.
 */
export function buildSeats(playerIds: readonly string[], roster: readonly RoomPlayer[]): MatchSeat[] {
	const nicknames = new Map(roster.map((player) => [player.playerId, player.nickname]));
	return playerIds.map((playerId) => ({
		playerId: asPlayerId(playerId),
		nickname: nicknames.get(playerId) ?? playerId,
	}));
}

/**
 * The full `match_created` payload for a starting game.
 *
 * `seed` and `seats` are what the model is dealt from; `winLimit` and
 * `playerCount` are what the game-loop FSM subscribes to. Both derive from the
 * seats, so restating them costs nothing and spares the machine a model read it
 * has no way to make.
 */
export function buildMatchSetup(packet: { gameId: string; playerIds: readonly string[] }, roster: readonly RoomPlayer[]) {
	const seats = buildSeats(packet.playerIds, roster);
	return {
		matchId: packet.gameId,
		seed: seedFromRoomCode(packet.gameId),
		seats,
		winLimit: winLimitFor(seats.length),
		playerCount: seats.length,
	};
}
