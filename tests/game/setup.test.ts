import { describe, expect, it } from '@jest/globals';
import {
	asMatchId,
	asPlayerId,
	CARD_DEFINITIONS,
	type CardInstanceId,
	CLASS_DEFINITIONS,
	createMatch,
	DECK_SIZE,
	type GameModel,
	MARKET_SIZE,
	type MatchSeat,
	type PlayerId,
	STARTING_COINS,
	STARTING_FERTILIZERS,
	STARTING_HAND_SIZE,
	winLimitFor,
} from '~/entities/game';

const seats = (count: number): MatchSeat[] =>
	Array.from({ length: count }, (_, index) => ({
		playerId: asPlayerId(`p${index + 1}`),
		nickname: `Player ${index + 1}`,
	}));

const match = (count: number, seed = 20260807): GameModel =>
	createMatch({ matchId: asMatchId('m1'), seed, seats: seats(count) });

/** Every card id the model holds, in whichever zone it currently sits. */
function allCardIds(model: GameModel): CardInstanceId[] {
	const inPlay = Object.values(model.players).flatMap((player) => [
		...player.hand,
		...player.beds.flatMap((bed) => (bed.crop ? [bed.crop.cardId] : [])),
	]);
	const inMarket = model.market.filter((id): id is NonNullable<typeof id> => id !== null);
	return [...model.deck, ...inMarket, ...model.discard, ...inPlay];
}

describe('createMatch', () => {
	it('is deterministic: the same seed and seats deal the same position', () => {
		expect(match(4, 777)).toEqual(match(4, 777));
	});

	it('deals a different position from a different seed', () => {
		expect(match(4, 777)).not.toEqual(match(4, 778));
	});

	it.each([1, 7])('refuses to start with %i players', (count) => {
		expect(() => match(count)).toThrow(RangeError);
	});

	it('refuses duplicate players', () => {
		const duplicate: MatchSeat[] = [
			{ playerId: asPlayerId('same'), nickname: 'A' },
			{ playerId: asPlayerId('same'), nickname: 'B' },
		];
		expect(() => createMatch({ matchId: asMatchId('m1'), seed: 1, seats: duplicate })).toThrow(/Duplicate playerId/);
	});

	it('leaves the match in SETUP for the FSM to start', () => {
		expect(match(3).phase).toBe('SETUP');
		expect(match(3).turn).toEqual({
			number: 0,
			activePlayerId: null,
			phase: 'WAITING',
			allowance: null,
			trade: null,
		});
	});

	it('sets the Win Limit for the table size', () => {
		expect(match(2).winLimit).toBe(winLimitFor(2));
		expect(match(6).winLimit).toBe(164);
	});
});

describe('game preparation, step by step', () => {
	it('step 1: deals every player a distinct Class', () => {
		const model = match(6);
		const classes = Object.values(model.players).map((player) => player.classId);
		expect(new Set(classes).size).toBe(6);
	});

	it('step 2-3: gives starting coins and the Class bonus on top', () => {
		const model = match(6);
		for (const player of Object.values(model.players)) {
			expect(player.coins).toBe(STARTING_COINS + CLASS_DEFINITIONS[player.classId].bonusCoins);
		}
		const landBaron = Object.values(model.players).find((player) => player.classId === 'LAND_BARON');
		expect(landBaron?.coins).toBe(5);
	});

	it('step 2-3: deals 3 cards, plus one more to the classes that get one', () => {
		const model = match(6);
		for (const player of Object.values(model.players)) {
			const bonus = CLASS_DEFINITIONS[player.classId].bonusCard ? 1 : 0;
			expect(player.hand).toHaveLength(STARTING_HAND_SIZE + bonus);
		}
	});

	it('step 2-3: draws the Class bonus card of the kind and rarity promised', () => {
		const model = match(6);
		for (const player of Object.values(model.players)) {
			const filter = CLASS_DEFINITIONS[player.classId].bonusCard;
			if (!filter) continue;
			// The bonus card is appended last.
			const bonusId = player.hand[player.hand.length - 1];
			const def = CARD_DEFINITIONS[model.cards[bonusId].defId];
			expect(def.kind).toBe(filter.kind);
			expect(def.rarity).toBe(filter.rarity);
		}
	});

	it('step 3: lays out the beds the Class prescribes', () => {
		const model = match(6);
		for (const player of Object.values(model.players)) {
			expect(player.beds.map((bed) => bed.type)).toEqual([...CLASS_DEFINITIONS[player.classId].beds]);
			expect(player.beds.every((bed) => bed.crop === null)).toBe(true);
		}
	});

	it('step 4: turn order is a permutation of the seated players', () => {
		const model = match(5);
		expect([...model.order].sort()).toEqual(Object.keys(model.players).sort());
	});

	it('step 5: hands out extra fertilizers by turn position', () => {
		const model = match(6);
		model.order.forEach((playerId: PlayerId, position: number) => {
			const player = model.players[playerId];
			const expected = STARTING_FERTILIZERS + CLASS_DEFINITIONS[player.classId].bonusFertilizers + position + 1;
			expect(player.fertilizers).toBe(expected);
		});
	});

	it('step 6: fills the Market face up', () => {
		const model = match(4);
		expect(model.market).toHaveLength(MARKET_SIZE);
		expect(model.market.every((slot) => slot !== null)).toBe(true);
	});

	it('step 7: the rest of the cards stay in the Deck', () => {
		const model = match(4);
		const dealt = Object.values(model.players).reduce((total, player) => total + player.hand.length, 0);
		expect(model.deck).toHaveLength(DECK_SIZE - dealt - MARKET_SIZE);
		expect(model.discard).toHaveLength(0);
	});
});

describe('card conservation', () => {
	it.each([2, 3, 4, 5, 6])('accounts for all 204 cards exactly once with %i players', (count) => {
		const model = match(count);
		const ids = allCardIds(model);
		expect(ids).toHaveLength(DECK_SIZE);
		expect(new Set(ids).size).toBe(DECK_SIZE);
	});

	it('registers every dealt card in the card registry', () => {
		const model = match(4);
		expect(Object.keys(model.cards)).toHaveLength(DECK_SIZE);
		for (const id of allCardIds(model)) {
			expect(model.cards[id]).toBeDefined();
		}
	});

	it('starts every card at its definition value', () => {
		const model = match(4);
		for (const card of Object.values(model.cards)) {
			expect(card.value).toBe(CARD_DEFINITIONS[card.defId].value);
		}
	});

	it('never deals a Class Card from the Deck', () => {
		const model = match(6);
		for (const card of Object.values(model.cards)) {
			const def = CARD_DEFINITIONS[card.defId];
			expect(def.kind === 'action' && def.isClassCard).toBe(false);
		}
	});
});
