import { describe, expect, it } from '@jest/globals';
import { asMatchId, asPlayerId, createMatch, type GameModel, type MatchSeat, parseGameModel } from '~/entities/game';

const seats: MatchSeat[] = [
	{ playerId: asPlayerId('p1'), nickname: 'Alice' },
	{ playerId: asPlayerId('p2'), nickname: 'Bob' },
];

const model = (): GameModel => createMatch({ matchId: asMatchId('m1'), seed: 4242, seats });

/** What the transport and the storage adapter actually hand back: parsed JSON. */
const overTheWire = (value: GameModel): unknown => JSON.parse(JSON.stringify(value));

/**
 * Deliberately untyped: every case below writes a value the `GameModel` type
 * forbids — that is exactly what the schema is there to catch, so the draft
 * cannot be typed as a model without defeating the test.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Draft = any;

/** A structural clone the tests can corrupt without touching the original. */
const corrupt = (mutate: (draft: Draft) => void): unknown => {
	const draft = overTheWire(model());
	mutate(draft);
	return draft;
};

describe('parseGameModel', () => {
	it('round-trips a freshly dealt match through JSON unchanged', () => {
		const original = model();
		expect(parseGameModel(overTheWire(original))).toEqual(original);
	});

	it('accepts a match in progress, with a planted crop and an open trade', () => {
		const draft: Draft = overTheWire(model());
		const [seller, buyer] = draft.order;
		const plantedId = draft.players[seller].hand[0];

		draft.phase = 'IN_PROGRESS';
		draft.players[seller].hand = draft.players[seller].hand.slice(1);
		draft.players[seller].beds[0].crop = { cardId: plantedId, reapTimer: 2 };
		draft.turn = {
			number: 3,
			activePlayerId: seller,
			phase: 'TRADE',
			allowance: 2,
			trade: { sellerId: seller, cardIds: [draft.players[seller].hand[0]], bids: { [buyer]: 4 } },
		};

		expect(parseGameModel(draft)).not.toBeNull();
	});

	it('rejects values that are not models at all', () => {
		expect(parseGameModel(null)).toBeNull();
		expect(parseGameModel('{}')).toBeNull();
		expect(parseGameModel({})).toBeNull();
	});

	it('rejects a missing field', () => {
		expect(parseGameModel(corrupt((draft) => delete draft.winLimit))).toBeNull();
	});

	it('rejects a phase outside the state diagram', () => {
		expect(parseGameModel(corrupt((draft) => (draft.phase = 'MOWING')))).toBeNull();
		expect(parseGameModel(corrupt((draft) => (draft.turn.phase = 'NAPPING')))).toBeNull();
	});

	it('rejects a Market that is not six slots wide', () => {
		expect(parseGameModel(corrupt((draft) => draft.market.pop()))).toBeNull();
	});

	it('rejects a card id the build does not know', () => {
		expect(
			parseGameModel(
				corrupt((draft) => {
					draft.cards[draft.deck[0]].defId = 'TURNIP';
				}),
			),
		).toBeNull();
	});

	it('rejects negative resources', () => {
		expect(
			parseGameModel(
				corrupt((draft) => {
					draft.players[draft.order[0]].coins = -1;
				}),
			),
		).toBeNull();
	});

	// Referential integrity — the failures that would otherwise surface far from the boundary.

	it('rejects a hand holding a card that is not in the registry', () => {
		expect(
			parseGameModel(
				corrupt((draft) => {
					draft.players[draft.order[0]].hand.push('GHOST#1');
				}),
			),
		).toBeNull();
	});

	it('rejects a Market slot holding an unknown card', () => {
		expect(parseGameModel(corrupt((draft) => (draft.market[0] = 'GHOST#1')))).toBeNull();
	});

	it('rejects a planted crop that is not in the registry', () => {
		expect(
			parseGameModel(
				corrupt((draft) => {
					draft.players[draft.order[0]].beds[0].crop = { cardId: 'GHOST#1', reapTimer: 1 };
				}),
			),
		).toBeNull();
	});

	it('rejects a turn order naming someone who is not at the table', () => {
		expect(parseGameModel(corrupt((draft) => draft.order.push('p9')))).toBeNull();
	});

	it('rejects an active player who is not at the table', () => {
		expect(parseGameModel(corrupt((draft) => (draft.turn.activePlayerId = 'p9')))).toBeNull();
	});

	it('accepts an empty Market slot, which is what a dry Deck leaves behind', () => {
		expect(parseGameModel(corrupt((draft) => (draft.market[0] = null)))).not.toBeNull();
	});
});
