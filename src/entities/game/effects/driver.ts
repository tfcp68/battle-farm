import {
	type GameModel,
	isDeckEmpty,
	isFinalTurn,
	nextPlayer,
	scoreBoard,
} from '../model';
import { endTurn } from './turn';

/**
 * The host's match driver: given an event that just finished applying to the
 * model, what does the engine say next?
 *
 * Pure on purpose. The host wraps it in a Data Destination (which sees the
 * model *after* the Effect Layer ran — bus subscription order guarantees it);
 * the bot test wraps it in a plain loop. Same sequencing either way, so the
 * bot match exercises exactly what production will run.
 *
 * Only the host calls this. Guests receive the emissions through the event
 * stream and never sequence anything themselves.
 */

export type DriverEventName = 'match_started' | 'turn_phase_ended' | 'turn_ended';

export interface EngineEmission {
	name: 'turn_started' | 'turn_ended' | 'match_ended';
	meta: Record<string, unknown>;
}

/** The `turn_ended` payload, computed from the model as the turn closes. */
function turnEndedMeta(model: GameModel): Record<string, unknown> {
	const active = model.turn.activePlayerId;
	return {
		activePlayerId: active,
		coins: active === null ? 0 : model.players[active]?.coins ?? 0,
		winLimit: model.winLimit,
		deckEmpty: isDeckEmpty(model) ? 1 : 0,
		// Whether this very turn is the match's last is only knowable by peeking
		// at what `endTurn` will decide — it is pure, so peek.
		lastTurn: isFinalTurn(endTurn(model)) ? 1 : 0,
	};
}

/**
 * `model` is the state *after* the event's effects have been applied.
 * Returns the events the host must emit next, in order; usually zero or one.
 */
export function driveMatch(eventName: DriverEventName, model: GameModel | null): EngineEmission[] {
	if (!model || model.phase === 'FINISHED') return [];

	switch (eventName) {
		// Setup is over — the first player of the rolled order opens the match.
		case 'match_started': {
			const first = model.order[0];
			if (!first) return [];
			return [{ name: 'turn_started', meta: { activePlayerId: first, turnNumber: 1 } }];
		}

		// Phases advance on the active player's say-so; when the advance landed
		// in CALCULATION there is nothing left to decide — close the turn.
		case 'turn_phase_ended': {
			if (model.turn.phase !== 'CALCULATION') return [];
			return [{ name: 'turn_ended', meta: turnEndedMeta(model) }];
		}

		// The turn has closed (endTurn already ran): either the match is over,
		// or the next player is up.
		case 'turn_ended': {
			if (isFinalTurn(model)) {
				return [{ name: 'match_ended', meta: { scoreBoard: scoreBoard(model) } }];
			}
			const upNext = nextPlayer(model);
			if (!upNext) return [];
			return [{ name: 'turn_started', meta: { activePlayerId: upNext, turnNumber: model.turn.number + 1 } }];
		}
	}
}
