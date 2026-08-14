import { describe, expect, it } from '@jest/globals';
import {
	acceptBid,
	advancePhase,
	buyCard,
	createRng,
	D4,
	endMatch,
	endTurn,
	isFinalTurn,
	offerTrade,
	placeBid,
	plantableBeds,
	playCard,
	rollDie,
	runHarvest,
	startTurn,
	useFertilizer,
} from '~/entities/game';
import { pid, testMatch } from './harness';

/**
 * The turn-phase effects. A recurring assertion style: a refused intent returns
 * the *same model reference*, which is the contract the Effect Layer's
 * "no commit when unchanged" and the host's version bumping both rely on.
 */

describe('HARVEST', () => {
	it('ticks the active player timers and collects what reaches zero', () => {
		const { model, crops } = testMatch({
			players: [
				{
					id: 'me',
					coins: 0,
					beds: [
						{ crop: { defId: 'WHEAT', reapTimer: 1, value: 4 } },
						{ crop: { defId: 'PINEAPPLE', reapTimer: 3 } },
					],
				},
				{ id: 'foe', beds: [{ crop: { defId: 'CHERRY', reapTimer: 1 } }] },
			],
		});

		const next = runHarvest(model, pid('me'));

		// The wheat came in: paid out at its planted value, bed emptied, card discarded.
		expect(next.players[pid('me')]?.coins).toBe(4);
		expect(next.players[pid('me')]?.beds[0]?.crop).toBeNull();
		expect(next.players[pid('me')]?.beds[0]?.emptiedOnTurn).toBe(1);
		expect(next.discard).toContain(crops.me[0]);
		// The pineapple only ripened a step.
		expect(next.players[pid('me')]?.beds[1]?.crop?.reapTimer).toBe(2);
		// The opponent's garden is not touched on my turn.
		expect(next.players[pid('foe')]?.beds[0]?.crop?.reapTimer).toBe(1);
	});

	it('fires the on-harvest ability after the payout', () => {
		// Cabbage: +1 coin per other growing Green crop. One other green grows.
		const { model } = testMatch({
			players: [
				{ id: 'me', coins: 0, beds: [{ crop: { defId: 'CABBAGE', reapTimer: 1, value: 2 } }] },
				{ id: 'foe', beds: [{ crop: { defId: 'POTATO', reapTimer: 3 } }] },
			],
		});

		const next = runHarvest(model, pid('me'));

		expect(next.players[pid('me')]?.coins).toBe(2 + 1);
	});

	it('pays the Tomato its passive bonus at collection time', () => {
		// Catch up: +1 per opponent holding more coins than the tomato's owner.
		const { model } = testMatch({
			players: [
				{ id: 'me', coins: 0, beds: [{ crop: { defId: 'TOMATO', reapTimer: 1, value: 5 } }] },
				{ id: 'rich', coins: 30 },
				{ id: 'poor', coins: 0 },
			],
		});

		const next = runHarvest(model, pid('me'));

		expect(next.players[pid('me')]?.coins).toBe(5 + 1);
	});
});

describe('SHOPPING — buyCard', () => {
	const shop = () =>
		testMatch({
			players: [{ id: 'me', coins: 3 }, { id: 'foe' }],
			phase: 'SHOPPING',
			allowance: 2,
			market: ['WHEAT', 'CLOUDBERRY', null, null, null, null],
			deck: ['CORN'],
		});

	it('sells an affordable card and refills the slot from the deck', () => {
		const { model, market, deck } = shop();

		const next = buyCard(model, { playerId: pid('me'), slotIndex: 0 });

		expect(next.players[pid('me')]?.hand).toContain(market[0]);
		expect(next.players[pid('me')]?.coins).toBe(3 - 1); // Common costs 1
		expect(next.market[0]).toBe(deck[0]);
		expect(next.deck).toHaveLength(0);
		expect(next.turn.allowance).toBe(1);
	});

	it('leaves the slot empty when the deck cannot refill it', () => {
		const { model } = testMatch({
			players: [{ id: 'me', coins: 3 }],
			phase: 'SHOPPING',
			allowance: 1,
			market: ['WHEAT', null, null, null, null, null],
		});

		const next = buyCard(model, { playerId: pid('me'), slotIndex: 0 });

		expect(next.market[0]).toBeNull();
	});

	it.each([
		['wrong phase', (m: ReturnType<typeof shop>) => ({ ...m.model, turn: { ...m.model.turn, phase: 'TRADE' as const } }), { playerId: pid('me'), slotIndex: 0 }],
		['not the active player', (m: ReturnType<typeof shop>) => m.model, { playerId: pid('foe'), slotIndex: 0 }],
		['no allowance left', (m: ReturnType<typeof shop>) => ({ ...m.model, turn: { ...m.model.turn, allowance: 0 } }), { playerId: pid('me'), slotIndex: 0 }],
		['cannot afford it', (m: ReturnType<typeof shop>) => m.model, { playerId: pid('me'), slotIndex: 1 }], // Mythic costs 8, purse holds 3
		['empty slot', (m: ReturnType<typeof shop>) => m.model, { playerId: pid('me'), slotIndex: 2 }],
	])('refuses and returns the same model when %s', (_name, prepare, intent) => {
		const match = shop();
		const model = prepare(match);
		expect(buyCard(model, intent)).toBe(model);
	});
});

describe('PLAYING — playCard', () => {
	it('plants a crop with the bed bonus folded into value and timer', () => {
		// Cloudberry (Yellow, Mythic, 21) into a Trellis: value 22; timer 5.
		const { model, hands } = testMatch({
			players: [{ id: 'me', hand: ['CLOUDBERRY'], beds: [{ type: 'TRELLIS' }] }, { id: 'foe' }],
			phase: 'PLAYING',
		});

		const next = playCard(model, { playerId: pid('me'), cardId: hands.me[0]!, bedIndex: 0 });

		expect(next.players[pid('me')]?.hand).toHaveLength(0);
		expect(next.players[pid('me')]?.beds[0]?.crop?.cardId).toBe(hands.me[0]);
		expect(next.players[pid('me')]?.beds[0]?.crop?.reapTimer).toBe(5);
		expect(next.cards[hands.me[0]!]?.value).toBe(22);
	});

	it('shortens the timer in a Hydroponic for Rare and better', () => {
		const { model, hands } = testMatch({
			players: [{ id: 'me', hand: ['PINEAPPLE'], beds: [{ type: 'HYDROPONIC' }] }],
			phase: 'PLAYING',
		});

		const next = playCard(model, { playerId: pid('me'), cardId: hands.me[0]!, bedIndex: 0 });

		expect(next.players[pid('me')]?.beds[0]?.crop?.reapTimer).toBe(2);
	});

	it('fires the on-plant ability', () => {
		// Onion Ring: a fertilizer per other Onion in hand, a coin per Onion growing.
		const { model, hands } = testMatch({
			players: [
				{
					id: 'me',
					coins: 0,
					fertilizers: 0,
					hand: ['ONION', 'ONION', 'ONION'],
					beds: [{ type: 'COMMON' }, { crop: { defId: 'ONION', reapTimer: 1 } }],
				},
			],
			phase: 'PLAYING',
		});

		const next = playCard(model, { playerId: pid('me'), cardId: hands.me[0]!, bedIndex: 0 });

		expect(next.players[pid('me')]?.fertilizers).toBe(2); // two onions left in hand
		expect(next.players[pid('me')]?.coins).toBe(2); // the planted one and the growing one
	});

	it('refuses an occupied bed and a bed emptied this turn', () => {
		const { model, hands } = testMatch({
			players: [
				{
					id: 'me',
					hand: ['WHEAT', 'CORN'],
					beds: [{ crop: { defId: 'CHERRY', reapTimer: 2 } }, { emptiedOnTurn: 1 }],
				},
			],
			phase: 'PLAYING',
			turnNumber: 1,
		});

		expect(playCard(model, { playerId: pid('me'), cardId: hands.me[0]!, bedIndex: 0 })).toBe(model);
		expect(playCard(model, { playerId: pid('me'), cardId: hands.me[1]!, bedIndex: 1 })).toBe(model);
		expect(plantableBeds(model, pid('me'))).toEqual([]);
	});

	it('plays an action card: pays fertilizers, discards it, applies the text', () => {
		// Garden Gourmet (value 1): +1 to a chosen crop, costs 1 fertilizer.
		const { model, hands, crops } = testMatch({
			players: [
				{ id: 'me', fertilizers: 1, hand: ['GARDEN_GOURMET'] },
				{ id: 'foe', beds: [{ crop: { defId: 'CHERRY', reapTimer: 2, value: 2 } }] },
			],
			phase: 'PLAYING',
		});

		const next = playCard(model, {
			playerId: pid('me'),
			cardId: hands.me[0]!,
			target: { playerId: pid('foe'), bedIndex: 0 },
		});

		expect(next.players[pid('me')]?.fertilizers).toBe(0);
		expect(next.discard).toContain(hands.me[0]);
		expect(next.cards[crops.foe[0]!]?.value).toBe(3);
	});

	it('refuses an action the player cannot fuel', () => {
		// Cartel Agreement costs 4 fertilizers.
		const { model, hands } = testMatch({
			players: [{ id: 'me', fertilizers: 3, hand: ['CARTEL_AGREEMENT'] }],
			phase: 'PLAYING',
			market: ['WHEAT', null, null, null, null, null],
		});

		expect(playCard(model, { playerId: pid('me'), cardId: hands.me[0]! })).toBe(model);
	});

	it('counts Weed Whacker coins over the hand without itself', () => {
		const { model, hands } = testMatch({
			players: [{ id: 'me', coins: 0, fertilizers: 2, hand: ['WEED_WHACKER', 'WHEAT', 'CORN'] }],
			phase: 'PLAYING',
		});

		const next = playCard(model, { playerId: pid('me'), cardId: hands.me[0]! });

		expect(next.players[pid('me')]?.coins).toBe(2);
	});
});

describe('FERTILIZE — useFertilizer', () => {
	it('spends one fertilizer and one allowance per application', () => {
		const { model } = testMatch({
			players: [{ id: 'me', fertilizers: 3, beds: [{ crop: { defId: 'PINEAPPLE', reapTimer: 3 } }] }],
			phase: 'FERTILIZE',
			allowance: 2,
		});

		const next = useFertilizer(model, { playerId: pid('me'), bedIndex: 0 });

		expect(next.players[pid('me')]?.fertilizers).toBe(2);
		expect(next.turn.allowance).toBe(1);
		expect(next.players[pid('me')]?.beds[0]?.crop?.reapTimer).toBe(2);
	});

	it('raises Wheat value before an instant harvest pays out', () => {
		// Bake it Up: +2 value when fertilized; the timer hits 0 → harvested at 4+2.
		const { model } = testMatch({
			players: [{ id: 'me', coins: 0, fertilizers: 1, beds: [{ crop: { defId: 'WHEAT', reapTimer: 1, value: 4 } }] }],
			phase: 'FERTILIZE',
			allowance: 1,
			turnNumber: 7,
		});

		const next = useFertilizer(model, { playerId: pid('me'), bedIndex: 0 });

		expect(next.players[pid('me')]?.coins).toBe(6);
		expect(next.players[pid('me')]?.beds[0]?.crop).toBeNull();
		// The bed is burnt for the rest of this turn.
		expect(next.players[pid('me')]?.beds[0]?.emptiedOnTurn).toBe(7);
		expect(plantableBeds(next, pid('me'))).toEqual([]);
	});

	it.each([
		['no allowance', { allowance: 0 }],
		['no fertilizers', { fertilizers: 0 }],
	])('refuses with %s', (_name, override) => {
		const { model } = testMatch({
			players: [{ id: 'me', fertilizers: 'fertilizers' in override ? 0 : 3, beds: [{ crop: { defId: 'CORN', reapTimer: 2 } }] }],
			phase: 'FERTILIZE',
			allowance: 'allowance' in override ? 0 : 2,
		});
		expect(useFertilizer(model, { playerId: pid('me'), bedIndex: 0 })).toBe(model);
	});

	it('refuses an empty bed', () => {
		const { model } = testMatch({
			players: [{ id: 'me', fertilizers: 3, beds: [{}] }],
			phase: 'FERTILIZE',
			allowance: 2,
		});
		expect(useFertilizer(model, { playerId: pid('me'), bedIndex: 0 })).toBe(model);
	});
});

describe('TRADE', () => {
	const table = () =>
		testMatch({
			players: [
				{ id: 'seller', hand: ['WHEAT', 'CORN', 'CLOUDBERRY'] },
				{ id: 'buyer', coins: 10 },
				{ id: 'other', coins: 2 },
			],
			phase: 'TRADE',
			active: 'seller',
		});

	it('runs a full deal: offer, bids, acceptance', () => {
		const { model, hands } = table();
		const offered = [hands.seller[0]!, hands.seller[2]!];

		let next = offerTrade(model, { playerId: pid('seller'), cardIds: offered });
		expect(next.turn.trade?.cardIds).toEqual(offered);

		next = placeBid(next, { playerId: pid('buyer'), coins: 7 });
		next = placeBid(next, { playerId: pid('other'), coins: 2 });
		expect(next.turn.trade?.bids).toEqual({ [pid('buyer')]: 7, [pid('other')]: 2 });

		next = acceptBid(next, { playerId: pid('seller'), bidderId: pid('buyer') });

		expect(next.players[pid('seller')]?.coins).toBe(10 + 7);
		expect(next.players[pid('buyer')]?.coins).toBe(10 - 7);
		expect(next.players[pid('buyer')]?.hand).toEqual(expect.arrayContaining(offered));
		expect(next.players[pid('seller')]?.hand).toHaveLength(1);
		expect(next.turn.trade).toBeNull();
	});

	it('drops offered cards the seller does not actually hold', () => {
		const { model, hands } = table();
		const foreign = hands.buyer[0]; // buyer has no hand → undefined
		expect(foreign).toBeUndefined();

		const next = offerTrade(model, {
			playerId: pid('seller'),
			cardIds: [hands.seller[1]!, 'GHOST#1' as never],
		});

		expect(next.turn.trade?.cardIds).toEqual([hands.seller[1]]);
	});

	/**
	 * There is no "send" step any more: every card the seller picks arrives as
	 * its own offer, so this runs once per card and the last one wins.
	 */
	it('republishes the set as the seller changes it, and starts the bidding over', () => {
		const { model, hands } = table();

		let next = offerTrade(model, { playerId: pid('seller'), cardIds: [hands.seller[0]!] });
		next = placeBid(next, { playerId: pid('buyer'), coins: 7 });
		expect(next.turn.trade?.bids).toEqual({ [pid('buyer')]: 7 });

		// A second card is a different deal — the old price does not carry over.
		next = offerTrade(next, { playerId: pid('seller'), cardIds: [hands.seller[0]!, hands.seller[1]!] });
		expect(next.turn.trade?.cardIds).toEqual([hands.seller[0], hands.seller[1]]);
		expect(next.turn.trade?.bids).toEqual({});
	});

	/** Taking the last card back off the table is how a seller changes their mind. */
	it('retracts the offer when the set empties', () => {
		const { model, hands } = table();

		const open = offerTrade(model, { playerId: pid('seller'), cardIds: [hands.seller[0]!] });
		expect(open.turn.trade).not.toBeNull();

		expect(offerTrade(open, { playerId: pid('seller'), cardIds: [] }).turn.trade).toBeNull();
		// Nothing on the table and nothing offered is not a change at all.
		expect(offerTrade(model, { playerId: pid('seller'), cardIds: [] })).toBe(model);
	});

	it('refuses a bid beyond the purse, a negative bid, and the seller bidding', () => {
		const { model, hands } = table();
		const open = offerTrade(model, { playerId: pid('seller'), cardIds: [hands.seller[0]!] });

		expect(placeBid(open, { playerId: pid('other'), coins: 3 })).toBe(open);
		expect(placeBid(open, { playerId: pid('buyer'), coins: -1 })).toBe(open);
		expect(placeBid(open, { playerId: pid('seller'), coins: 1 })).toBe(open);
	});

	it('lets the deal fall through when the buyer can no longer pay', () => {
		const { model, hands } = table();
		let next = offerTrade(model, { playerId: pid('seller'), cardIds: [hands.seller[0]!] });
		next = placeBid(next, { playerId: pid('buyer'), coins: 10 });

		// The buyer's coins vanish between bid and acceptance (another effect).
		const broke = {
			...next,
			players: { ...next.players, [pid('buyer')]: { ...next.players[pid('buyer')]!, coins: 4 } },
		};

		expect(acceptBid(broke, { playerId: pid('seller'), bidderId: pid('buyer') })).toBe(broke);
	});
});

describe('turn lifecycle', () => {
	it('startTurn opens on HARVEST and resolves it immediately', () => {
		const { model } = testMatch({
			players: [{ id: 'me', coins: 0, beds: [{ crop: { defId: 'WHEAT', reapTimer: 1, value: 3 } }] }, { id: 'foe' }],
			active: null,
			turnNumber: 0,
		});

		const next = startTurn(model, { activePlayerId: pid('me'), turnNumber: 1 });

		expect(next.turn).toMatchObject({ activePlayerId: pid('me'), number: 1, phase: 'HARVEST' });
		expect(next.players[pid('me')]?.coins).toBe(3);
	});

	it('advancePhase walks the order and rolls the 1d4 allowances', () => {
		const { model } = testMatch({ players: [{ id: 'me' }], phase: 'HARVEST', seed: 7 });

		const shopping = advancePhase(model);
		expect(shopping.turn.phase).toBe('SHOPPING');
		// The allowance is the next d4 out of the model's own RNG stream.
		const [expected] = rollDie(createRng(7), D4);
		expect(shopping.turn.allowance).toBe(expected);

		const trade = advancePhase(shopping);
		expect(trade.turn.phase).toBe('TRADE');
		expect(trade.turn.allowance).toBeNull();

		const playing = advancePhase(trade);
		const fertilize = advancePhase(playing);
		expect(fertilize.turn.phase).toBe('FERTILIZE');
		expect(fertilize.turn.allowance).toBeGreaterThanOrEqual(1);
		expect(fertilize.turn.allowance).toBeLessThanOrEqual(4);

		expect(advancePhase(fertilize).turn.phase).toBe('CALCULATION');
	});

	it('endTurn without a trigger just hands the turn back', () => {
		const { model } = testMatch({ players: [{ id: 'me', coins: 10 }, { id: 'foe' }], phase: 'CALCULATION', deck: ['WHEAT'] });

		const next = endTurn(model);

		expect(next.phase).toBe('IN_PROGRESS');
		expect(next.lastTurnTriggeredBy).toBeNull();
		expect(next.turn.phase).toBe('WAITING');
	});

	it('endTurn starts the endgame on the Win Limit and remembers who', () => {
		const { model } = testMatch({
			players: [{ id: 'me', coins: 250 }, { id: 'foe' }],
			phase: 'CALCULATION',
			deck: ['WHEAT'],
			winLimit: 250,
		});

		const next = endTurn(model);

		expect(next.phase).toBe('LAST_TURN');
		expect(next.lastTurnTriggeredBy).toBe(pid('me'));
		// The next player is not the trigger, so the match is not over yet…
		expect(isFinalTurn(next)).toBe(false);

		// …but once the turn passes to the last opponent, it is.
		const lastOpponent = startTurn(next, { activePlayerId: pid('foe'), turnNumber: 2 });
		expect(isFinalTurn(endTurn(lastOpponent))).toBe(true);
	});

	it('endTurn starts the endgame on an empty deck', () => {
		const { model } = testMatch({ players: [{ id: 'me' }, { id: 'foe' }], phase: 'CALCULATION', deck: [] });

		expect(endTurn(model).phase).toBe('LAST_TURN');
	});

	it('endMatch freezes the model in FINISHED', () => {
		const { model } = testMatch({ players: [{ id: 'me' }] });
		expect(endMatch(model).phase).toBe('FINISHED');
	});
});
