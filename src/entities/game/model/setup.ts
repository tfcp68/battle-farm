import {
	CARD_DEFINITIONS,
	type CardDefId,
	CLASS_DEFINITIONS,
	type ClassBonusCard,
	DECK_CARD_IDS,
	MARKET_SIZE,
	PLAYER_CLASS_IDS,
	type PlayerClassId,
} from '../data';
import { MAX_PLAYERS, MIN_PLAYERS, STARTING_COINS, STARTING_FERTILIZERS, STARTING_HAND_SIZE, winLimitFor } from './rules';
import { createRng, D20, nextRandom, rollDie, shuffle } from './rng';
import {
	asCardInstanceId,
	type Bed,
	type CardInstance,
	type CardInstanceId,
	type GameModel,
	type MatchId,
	type PlayerId,
	type PlayerState,
	type RngState,
} from './types';

/**
 * Game Preparation (`docs/rules.md` → Game Preparation), steps 1-7, as one pure
 * function of `(seats, seed)`.
 *
 * Determinism is the point: the same seed and seats always produce the same
 * opening position, so a match replays from its seed and every test below is
 * exact rather than statistical.
 *
 * Two readings of the rulebook are baked in and worth knowing:
 *
 * - **Classes are dealt without repeats.** Step 1 says "randomly assigned 1 of 6
 *   Classes" without saying whether two players may share one; with the player
 *   cap at 6 and a unique Class Card each, dealing from a shuffled pool is the
 *   reading that keeps both true.
 * - **The Class bed list is the whole layout.** See `../data/classes.ts`.
 */

export interface MatchSeat {
	playerId: PlayerId;
	nickname: string;
}

export interface CreateMatchOptions {
	matchId: MatchId;
	/** Same seed + same seats ⇒ same opening position. */
	seed: number;
	/** Players in the order they sat down; turn order is rolled, not taken from this. */
	seats: readonly MatchSeat[];
}

/** Builds one `CardInstance` per physical card of the standard deck, unshuffled. */
function buildDeckInstances(): CardInstance[] {
	const copies = new Map<CardDefId, number>();
	return DECK_CARD_IDS.map((defId) => {
		const copy = copies.get(defId) ?? 0;
		copies.set(defId, copy + 1);
		return {
			// Readable and deterministic — `crypto.randomUUID()` would break replay.
			instanceId: asCardInstanceId(`${defId}#${copy}`),
			defId,
			value: CARD_DEFINITIONS[defId].value,
		};
	});
}

/** Removes and returns the first card matching the Class bonus filter. */
function takeBonusCard(deck: CardInstanceId[], cards: Record<CardInstanceId, CardInstance>, filter: ClassBonusCard) {
	const index = deck.findIndex((id) => {
		const def = CARD_DEFINITIONS[cards[id].defId];
		return def.kind === filter.kind && def.rarity === filter.rarity;
	});
	// The standard deck always holds Common cards of both kinds; a filter that
	// matches nothing means the deck data drifted from the Class data.
	if (index < 0) throw new Error(`No ${filter.rarity} ${filter.kind} card left for a Class bonus`);
	return deck.splice(index, 1)[0];
}

/** Step 4: everyone rolls 1d20, highest goes first, ties broken randomly. */
function rollTurnOrder(seats: readonly MatchSeat[], rng: RngState): [PlayerId[], RngState] {
	let state = rng;
	const rolls = seats.map((seat) => {
		const [roll, afterRoll] = rollDie(state, D20);
		const [tiebreak, afterTiebreak] = nextRandom(afterRoll);
		state = afterTiebreak;
		return { playerId: seat.playerId, roll, tiebreak };
	});
	rolls.sort((a, b) => b.roll - a.roll || a.tiebreak - b.tiebreak);
	return [rolls.map((entry) => entry.playerId), state];
}

/**
 * Produces the opening position. The match is left in `SETUP`: dealing is done,
 * and it is the game FSM's `START` that moves it to `IN_PROGRESS`.
 */
export function createMatch(options: CreateMatchOptions): GameModel {
	const { matchId, seed, seats } = options;

	if (seats.length < MIN_PLAYERS || seats.length > MAX_PLAYERS) {
		throw new RangeError(`A match needs ${MIN_PLAYERS}-${MAX_PLAYERS} players, got ${seats.length}`);
	}
	const uniqueIds = new Set(seats.map((seat) => seat.playerId));
	if (uniqueIds.size !== seats.length) throw new Error('Duplicate playerId among match seats');

	let rng = createRng(seed);

	const instances = buildDeckInstances();
	const cards: Record<CardInstanceId, CardInstance> = {};
	for (const instance of instances) cards[instance.instanceId] = instance;

	const [shuffled, afterShuffle] = shuffle(
		instances.map((instance) => instance.instanceId),
		rng,
	);
	rng = afterShuffle;
	const deck = shuffled;

	// Step 1: deal Classes from a shuffled pool, so no two players share one.
	const [classPool, afterClasses] = shuffle(PLAYER_CLASS_IDS, rng);
	rng = afterClasses;

	// Steps 2-3: beds, starting resources and Class bonuses.
	const players: Record<PlayerId, PlayerState> = {};
	seats.forEach((seat, seatIndex) => {
		const classId = classPool[seatIndex] as PlayerClassId;
		const classDef = CLASS_DEFINITIONS[classId];

		const hand = deck.splice(0, STARTING_HAND_SIZE);
		if (classDef.bonusCard) hand.push(takeBonusCard(deck, cards, classDef.bonusCard));

		const beds: Bed[] = classDef.beds.map((type) => ({ type, crop: null, emptiedOnTurn: null }));

		players[seat.playerId] = {
			playerId: seat.playerId,
			nickname: seat.nickname,
			classId,
			coins: STARTING_COINS + classDef.bonusCoins,
			fertilizers: STARTING_FERTILIZERS + classDef.bonusFertilizers,
			hand,
			beds,
			classCardUsed: false,
		};
	});

	// Step 4: turn order.
	const [order, afterOrder] = rollTurnOrder(seats, rng);
	rng = afterOrder;

	// Step 5: the first player to act gains 1 extra Fertilizer, the second 2, and so on.
	order.forEach((playerId, position) => {
		players[playerId].fertilizers += position + 1;
	});

	// Steps 6-7: fill the Market face up, the rest stays in the Deck.
	const market: Array<CardInstanceId | null> = Array.from(
		{ length: MARKET_SIZE },
		() => deck.shift() ?? null,
	);

	return {
		version: 1,
		matchId,
		phase: 'SETUP',
		winLimit: winLimitFor(seats.length),
		order,
		players,
		cards,
		deck,
		market,
		discard: [],
		turn: {
			number: 0,
			activePlayerId: null,
			phase: 'WAITING',
			allowance: null,
			trade: null,
		},
		rng,
		lastTurnTriggeredBy: null,
	};
}
