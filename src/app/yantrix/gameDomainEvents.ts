import { EventDictionary } from '@yantrix/core';
import { eventDictionary as gameLoopEvents } from '~/shared/lib/fsm/game/GameLoopAutomata';
import { eventDictionary as turnLoopEvents } from '~/shared/lib/fsm/game/TurnLoopAutomata';
import type { CardInstanceId, EffectTarget, MatchSeat, PlayerId } from '~/entities/game';

export type { EffectTarget };

/**
 * Mints ids for events no automaton subscribes to *yet*.
 *
 * Generated automata register their event names in the same global dictionary,
 * so when the phase-5 sub-phase diagrams start subscribing to these names they
 * resolve to these very ids — the registry is keyed by name, not by who asked
 * for it first.
 */
function mintEventIds<const Names extends readonly string[]>(names: Names): Record<Names[number], number> {
	const unknown = names.filter((name) => EventDictionary.getEventValues({ keys: [name] })[0] == null);
	if (unknown.length > 0) EventDictionary.addEvents({ keys: unknown });

	const ids = {} as Record<Names[number], number>;
	for (const name of names) {
		const id = EventDictionary.getEventValues({ keys: [name] })[0];
		if (id == null) throw new Error(`Failed to register domain event "${name}"`);
		ids[name as Names[number]] = id;
	}
	return ids;
}

const intentIds = mintEventIds([
	'card_bought',
	'card_played',
	'fertilizer_used',
	'trade_offered',
	'trade_bid_placed',
	'trade_offer_accepted',
] as const);

/**
 * Domain events of a match, mirroring `windowDomainEvents.ts` for the window
 * flow. Ids come from the generated automata, so the diagrams stay the source of
 * truth; Yantrix registers event names globally, which is why `turn_started` and
 * friends resolve to one id even though both machines subscribe to them.
 *
 * Every event here is emitted by the **host**: it owns the model, applies the
 * rules and broadcasts the result. Guests receive them and their local machines
 * follow along.
 */
export const GameDomainEvents = {
	// Engine — the match and turn machines subscribe to these (phase 2).
	match_created: gameLoopEvents.match_created,
	match_started: gameLoopEvents.match_started,
	turn_started: gameLoopEvents.turn_started,
	turn_phase_ended: turnLoopEvents.turn_phase_ended,
	turn_ended: gameLoopEvents.turn_ended,
	match_ended: gameLoopEvents.match_ended,

	// Player intents — consumed by the Effect Matrix, which validates them
	// against the model. No automaton subscribes to them until phase 5 wires the
	// sub-phase diagrams.
	card_bought: intentIds.card_bought,
	card_played: intentIds.card_played,
	fertilizer_used: intentIds.fertilizer_used,
	trade_offered: intentIds.trade_offered,
	trade_bid_placed: intentIds.trade_bid_placed,
	trade_offer_accepted: intentIds.trade_offer_accepted,
} as const;


/**
 * Payload contracts, one per event. These are the facts the machines' guards and
 * context reducers read — the model itself never enters an event, so a machine
 * can decide a transition without the full snapshot.
 */
export interface GameEventMeta {
	/**
	 * The match is dealt. `seed` and `seats` are the deal itself — `createMatch`
	 * is pure, so these two make every peer build the same opening position
	 * without the board ever travelling; `winLimit` and `playerCount` are the
	 * facts the game-loop FSM subscribes to.
	 */
	match_created: {
		matchId: string;
		seed: number;
		seats: MatchSeat[];
		winLimit: number;
		playerCount: number;
	};
	/** Setup is over and the first turn may begin. */
	match_started: null;
	/** A player's turn began. Broadcast — every client hears it, one acts on it. */
	turn_started: {
		activePlayerId: PlayerId;
		turnNumber: number;
	};
	/** The active player finished a phase of their turn; the next one starts. */
	turn_phase_ended: null;
	/**
	 * A turn is over. Carries the facts both machines need:
	 * `coins`/`winLimit`/`deckEmpty` let the game loop decide whether the endgame
	 * just triggered, and `lastTurn` — which only the host can know — tells the
	 * turn loop this was the final turn of the match.
	 */
	turn_ended: {
		activePlayerId: PlayerId;
		coins: number;
		winLimit: number;
		deckEmpty: 0 | 1;
		lastTurn: 0 | 1;
	};
	/** The match is over, with final scores per player. */
	match_ended: {
		scoreBoard: Record<PlayerId, number>;
	};

	/** A player takes a Market slot during SHOPPING. */
	card_bought: {
		playerId: PlayerId;
		slotIndex: number;
	};
	/**
	 * A player plays a card during PLAYING. A Crop Card needs `bedIndex` to be
	 * planted into; an Action Card needs `target` when its definition asks for one.
	 */
	card_played: {
		playerId: PlayerId;
		cardId: CardInstanceId;
		bedIndex?: number;
		target?: EffectTarget;
	};
	/** A player spends one fertilizer on one of their crops during FERTILIZE. */
	fertilizer_used: {
		playerId: PlayerId;
		bedIndex: number;
	};
	/** The active player puts a set of cards up for trade. */
	trade_offered: {
		playerId: PlayerId;
		cardIds: CardInstanceId[];
	};
	/** An opponent bids coins for the whole offered set. */
	trade_bid_placed: {
		playerId: PlayerId;
		coins: number;
	};
	/** The seller takes one of the bids. */
	trade_offer_accepted: {
		playerId: PlayerId;
		bidderId: PlayerId;
	};
}
