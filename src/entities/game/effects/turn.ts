import { D4 } from '../model';
import {
	type GameModel,
	hasReachedWinLimit,
	isDeckEmpty,
	isEndgameStarted,
	nextTurnPhase,
	type PlayerId,
	type TurnPhase,
} from '../model';
import { runHarvest } from './harvest';
import { roll } from './helpers';

/**
 * The match and turn lifecycle: what the engine events do to the model.
 *
 * These mirror the two automata of phase 2 — the machines decide *whether* a
 * transition is legal, these decide what the board looks like afterwards.
 */

/** Setup is over; the first turn may begin. */
export function startMatch(model: GameModel): GameModel {
	return model.phase === 'SETUP' ? { ...model, phase: 'IN_PROGRESS' } : model;
}

/**
 * A player's turn opens. The first phase is HARVEST, which resolves immediately:
 * nothing about it is a choice.
 */
export function startTurn(model: GameModel, meta: { activePlayerId: PlayerId; turnNumber: number }): GameModel {
	if (!model.players[meta.activePlayerId]) return model;

	const opened: GameModel = {
		...model,
		turn: {
			...model.turn,
			number: meta.turnNumber,
			activePlayerId: meta.activePlayerId,
			phase: 'HARVEST',
			allowance: null,
			trade: null,
		},
	};
	return runHarvest(opened, meta.activePlayerId);
}

/** Moves to the next phase of the turn and runs whatever that phase opens with. */
export function advancePhase(model: GameModel): GameModel {
	const upcoming = nextTurnPhase(model.turn.phase);
	if (upcoming === null || model.turn.activePlayerId === null) return model;
	return enterPhase({ ...model, turn: { ...model.turn, phase: upcoming } }, upcoming);
}

/**
 * SHOPPING and FERTILIZE both open with a 1d4 that caps what the player may do;
 * TRADE opens with a clean slate.
 */
function enterPhase(model: GameModel, phase: TurnPhase): GameModel {
	if (phase === 'SHOPPING' || phase === 'FERTILIZE') {
		const [allowance, afterRoll] = roll(model, D4);
		return { ...afterRoll, turn: { ...afterRoll.turn, allowance } };
	}
	if (phase === 'TRADE') return { ...model, turn: { ...model.turn, trade: null, allowance: null } };
	return { ...model, turn: { ...model.turn, allowance: null } };
}

/**
 * The turn closes.
 *
 * This is where the endgame is decided: reaching the Win Limit or emptying the
 * Deck makes the current turn the last one for everyone after it. Whoever
 * triggered it is remembered, because the match ends when the turn comes back
 * round to them.
 */
export function endTurn(model: GameModel): GameModel {
	const active = model.turn.activePlayerId;
	const triggered = active !== null && !isEndgameStarted(model) && (hasReachedWinLimit(model, active) || isDeckEmpty(model));

	return {
		...model,
		phase: triggered || isEndgameStarted(model) ? 'LAST_TURN' : model.phase,
		lastTurnTriggeredBy: triggered ? active : model.lastTurnTriggeredBy,
		turn: { ...model.turn, phase: 'WAITING', allowance: null, trade: null },
	};
}

export function endMatch(model: GameModel): GameModel {
	return { ...model, phase: 'FINISHED', turn: { ...model.turn, phase: 'WAITING', allowance: null, trade: null } };
}
