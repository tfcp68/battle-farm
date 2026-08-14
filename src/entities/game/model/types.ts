import type { Brand } from '~/shared/types/brand';
import type { BedTypeId, CardDefId, PlayerClassId } from '../data';

/**
 * The anemic Data Model of a match — a plain serializable snapshot that fully
 * describes the game, in the sense `yantrix/docs/concepts/400_data_flow.md`
 * gives the term: a savegame the app can be restored from.
 *
 * Rules of this module:
 *
 * - **No methods.** The pre-Yantrix `~/shared/types/serializables/game.ts` put
 *   behaviour on `IGame`/`IPlayer` interfaces; that shape cannot travel over the
 *   wire or into storage, which is why this is a separate module rather than an
 *   extension of it. Behaviour lives in the Effect Matrix (phase 3).
 * - **Normalized.** `cards` is the one place a card's data lives; every zone
 *   (deck, market, hand, bed, discard) holds ids. Moving a card between zones
 *   never copies it, and "raise this card's value" is a single write no matter
 *   where the card sits.
 * - **The host owns it.** Guests render a projection of it; `version` lets them
 *   drop snapshots older than the one they already hold, exactly as
 *   `RoomState` does for the lobby.
 */

export type PlayerId = Brand<string, 'PlayerId'>;
export type CardInstanceId = Brand<string, 'CardInstanceId'>;
export type MatchId = Brand<string, 'MatchId'>;

/** Boundary constructors — the room layer and the transport hand us plain strings. */
export const asPlayerId = (value: string): PlayerId => value as PlayerId;
export const asCardInstanceId = (value: string): CardInstanceId => value as CardInstanceId;
export const asMatchId = (value: string): MatchId => value as MatchId;

/** Phases of the whole match. Mirrors `src/shared/lib/fsm/diagrams/gameLoop.mermaid`. */
export const MATCH_PHASES = [
	'PLANNED',
	'ROLLING_CHARACTERS',
	'ROLLING_TURN_ORDER',
	'SETUP',
	'IN_PROGRESS',
	'LAST_TURN',
	'FINISHED',
] as const;

export type MatchPhase = (typeof MATCH_PHASES)[number];

/**
 * Phases inside one player's turn. Mirrors
 * `src/shared/lib/fsm/diagrams/turnLoop.mermaid`.
 *
 * The phase is held here as well as in the FSM on purpose: a guest does not run
 * the host's FSM, so the snapshot has to say what is happening. The host's FSM
 * stays the authority that moves it.
 */
export const TURN_PHASES = [
	'WAITING',
	'HARVEST',
	'SHOPPING',
	'TRADE',
	'PLAYING',
	'FERTILIZE',
	'CALCULATION',
] as const;

export type TurnPhase = (typeof TURN_PHASES)[number];

export interface CardInstance {
	instanceId: CardInstanceId;
	defId: CardDefId;
	/**
	 * Current `Card Value`, which is *not* read from the definition: cards
	 * modify each other's value (`Green Day`, `Thorny Fence`) and a planted crop
	 * carries its `Crop Value` here.
	 */
	value: number;
}

export interface PlantedCrop {
	cardId: CardInstanceId;
	/** Turns left before the harvest; cards and fertilizers move it both ways. */
	reapTimer: number;
}

export interface Bed {
	type: BedTypeId;
	crop: PlantedCrop | null;
	/**
	 * Turn number this bed was emptied on, or `null`. A bed harvested early by a
	 * Fertilizer cannot be replanted the same turn (rules → Using Fertilizers).
	 */
	emptiedOnTurn: number | null;
}

export interface PlayerState {
	playerId: PlayerId;
	nickname: string;
	classId: PlayerClassId;
	coins: number;
	fertilizers: number;
	hand: CardInstanceId[];
	beds: Bed[];
	/** The Class Card activates once per game. */
	classCardUsed: boolean;
}

/** An open trade offer: one seller, one indivisible set of cards, one bid per opponent. */
export interface TradeState {
	sellerId: PlayerId;
	cardIds: CardInstanceId[];
	/** Coins offered for the whole set — the rules allow no partial deals. */
	bids: Record<PlayerId, number>;
}

export interface TurnState {
	/** 1-based and incremented per *player* turn, not per round. */
	number: number;
	activePlayerId: PlayerId | null;
	phase: TurnPhase;
	/** The 1d4 this phase rolled — cards buyable, fertilizers spendable. `null` before the roll. */
	allowance: number | null;
	trade: TradeState | null;
}

export interface RngState {
	/** The seed the match started from, kept so a match can be replayed. */
	seed: number;
	/** mulberry32 state, advanced by every draw. */
	cursor: number;
}

export interface GameModel {
	/** Bumped on every commit so a guest can drop a stale snapshot. */
	version: number;
	matchId: MatchId;
	phase: MatchPhase;
	winLimit: number;
	/** Turn order; index 0 plays first. */
	order: PlayerId[];
	players: Record<PlayerId, PlayerState>;
	/** Every card of the match, wherever it is. The zones below hold ids only. */
	cards: Record<CardInstanceId, CardInstance>;
	deck: CardInstanceId[];
	/** `MARKET_SIZE` slots; a slot is `null` once the Deck can no longer refill it. */
	market: Array<CardInstanceId | null>;
	discard: CardInstanceId[];
	turn: TurnState;
	rng: RngState;
	/**
	 * Who triggered the endgame by reaching the Win Limit or emptying the Deck.
	 * Every following player takes one more turn, and the match ends when the
	 * turn comes back round to them.
	 */
	lastTurnTriggeredBy: PlayerId | null;
}
