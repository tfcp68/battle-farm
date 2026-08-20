import { isLimitReached } from './rules';
import type { GameModel, PlayerId, TurnPhase } from './types';

/**
 * "What happens next" — the turn sequencing rules, as pure reads.
 *
 * Both the Effect Matrix and the host's match driver need these answers, so they
 * live apart from either: the effects use them to update the model, the driver
 * uses them to build the payloads of the engine events (`turn_started`,
 * `turn_ended`, `match_ended`).
 */

/** The phases of a turn, in the order `docs/rules.md` → Turn Sequence lists them. */
export const TURN_PHASE_ORDER: readonly TurnPhase[] = [
	'HARVEST',
	'SHOPPING',
	'TRADE',
	'PLAYING',
	'FERTILIZE',
	'CALCULATION',
];

/** The phase after this one, or `null` when the turn is over. */
export function nextTurnPhase(phase: TurnPhase): TurnPhase | null {
	const index = TURN_PHASE_ORDER.indexOf(phase);
	if (index < 0 || index === TURN_PHASE_ORDER.length - 1) return null;
	return TURN_PHASE_ORDER[index + 1] ?? null;
}

/** Who acts after the given player, wrapping around the table. */
export function playerAfter(model: GameModel, playerId: PlayerId | null): PlayerId | null {
	if (model.order.length === 0) return null;
	if (playerId === null) return model.order[0] ?? null;
	const index = model.order.indexOf(playerId);
	if (index < 0) return model.order[0] ?? null;
	return model.order[(index + 1) % model.order.length] ?? null;
}

/** Who takes the next turn. */
export function nextPlayer(model: GameModel): PlayerId | null {
	return playerAfter(model, model.turn.activePlayerId);
}

/** The Deck can no longer refill the Market — one of the two endgame triggers. */
export function isDeckEmpty(model: GameModel): boolean {
	return model.deck.length === 0;
}

/** The active player has crossed the Win Limit — the other endgame trigger. */
export function hasReachedWinLimit(model: GameModel, playerId: PlayerId): boolean {
	return isLimitReached(model.players[playerId]?.coins ?? 0, model.winLimit);
}

/** The endgame has already been triggered by somebody's turn. */
export function isEndgameStarted(model: GameModel): boolean {
	return model.lastTurnTriggeredBy !== null;
}

/**
 * The turn that is ending now is the last of the match.
 *
 * The rulebook gives every player *after* the trigger one more turn, so the
 * match ends exactly when the turn would come back round to whoever triggered
 * it.
 */
export function isFinalTurn(model: GameModel): boolean {
	if (!isEndgameStarted(model)) return false;
	return nextPlayer(model) === model.lastTurnTriggeredBy;
}
