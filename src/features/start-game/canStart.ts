import { MAX_PLAYERS, MIN_PLAYERS } from '~/entities/game';

/**
 * Whether this roster can legally start — the rules seat 2 to 6, and everyone
 * has to have said ready, the host included. That last part is what the lobby
 * FSM's `game_ready` predicate checks as well (`len(keys) == sum(values)` and
 * more than one seat); exempting the host here would light the Start button up
 * in a state the machine does not call ready.
 *
 * Kept out of {@link useStartGame} so it can be tested: the hook module pulls in
 * the UI bridge, which uses `import.meta` and cannot be loaded under Jest's CJS
 * build.
 */
export function canStart(playerIds: readonly string[], readyMap: Record<string, number>): boolean {
	if (playerIds.length < MIN_PLAYERS || playerIds.length > MAX_PLAYERS) return false;
	return playerIds.every((playerId) => !!readyMap[playerId]);
}
