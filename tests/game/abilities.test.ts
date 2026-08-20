import { describe, expect, it } from '@jest/globals';
import {
	ABILITIES_HANDLED_ELSEWHERE,
	applyCardAbility,
	CARD_ABILITIES,
	CARD_DEF_IDS,
	type CardInstanceId,
	createRng,
	firesOn,
	type GameModel,
	type PlayerId,
	rollDie,
	runHarvest,
} from '~/entities/game';
import { pid, testMatch } from './harness';

/**
 * Card abilities. The inventory case is the load-bearing one: it pins the rule
 * that *every* card's text is implemented somewhere, so a new card cannot
 * silently ship as a no-op.
 *
 * Rolls are deterministic per seed, so branchy abilities are tested by
 * *searching* for a seed that produces the branch, not by mocking the RNG.
 */

/** The first seed whose opening roll of `sides` satisfies the predicate. */
function findSeed(sides: number, accept: (value: number) => boolean): number {
	for (let seed = 0; seed < 10_000; seed++) {
		const [value] = rollDie(createRng(seed), sides);
		if (accept(value)) return seed;
	}
	throw new Error('No seed under 10000 produces the wanted roll');
}

const fire = (
	model: GameModel,
	playerId: PlayerId,
	cardId: CardInstanceId,
	extras: { bedIndex?: number; target?: { playerId?: PlayerId; bedIndex?: number; cardId?: CardInstanceId; color?: 'RED' | 'GREEN' | 'YELLOW' } } = {},
	trigger: 'on_play' | 'on_plant' | 'on_harvest' | 'on_fertilize' = 'on_play',
) => applyCardAbility(model, { playerId, cardId, trigger, ...extras });

describe('the ability inventory is complete', () => {
	it('implements every card, in the registry or explicitly elsewhere', () => {
		const missing = CARD_DEF_IDS.filter(
			(defId) => !(defId in CARD_ABILITIES) && !(defId in ABILITIES_HANDLED_ELSEWHERE),
		);
		expect(missing).toEqual([]);
	});

	it('routes crop triggers from the definitions and actions to on_play', () => {
		expect(firesOn('WHEAT', 'on_fertilize')).toBe(true);
		expect(firesOn('WHEAT', 'on_harvest')).toBe(false);
		expect(firesOn('TANGERINE', 'on_plant')).toBe(true);
		expect(firesOn('TANGERINE', 'on_harvest')).toBe(true);
		expect(firesOn('LUCKY_FIND', 'on_play')).toBe(true);
		expect(firesOn('LUCKY_FIND', 'on_harvest')).toBe(false);
	});
});

describe('crop abilities', () => {
	it('Cherry Picking raises every other Common card in hand', () => {
		const { model, hands, crops } = testMatch({
			players: [{ id: 'me', hand: ['WHEAT', 'MANGO'], beds: [{ crop: { defId: 'CHERRY', reapTimer: 0 } }] }],
		});

		const next = fire(model, pid('me'), crops.me[0]!, {}, 'on_harvest');

		expect(next.cards[hands.me[0]!]?.value).toBe(3); // Common wheat: 2 → 3
		expect(next.cards[hands.me[1]!]?.value).toBe(5); // Uncommon mango untouched
	});

	it('Root Rot draws a Potato on a 4, a fertilizer otherwise', () => {
		const build = (seed: number) =>
			testMatch({
				players: [{ id: 'me', fertilizers: 0, beds: [{ crop: { defId: 'POTATO', reapTimer: 0 } }] }],
				deck: ['POTATO', 'WHEAT'],
				seed,
			});

		const lucky = build(findSeed(4, (v) => v === 4));
		const won = fire(lucky.model, pid('me'), lucky.crops.me[0]!, {}, 'on_harvest');
		expect(won.players[pid('me')]?.hand).toEqual([lucky.deck[0]]);

		const unlucky = build(findSeed(4, (v) => v !== 4));
		const consolation = fire(unlucky.model, pid('me'), unlucky.crops.me[0]!, {}, 'on_harvest');
		expect(consolation.players[pid('me')]?.fertilizers).toBe(1);
		expect(consolation.players[pid('me')]?.hand).toHaveLength(0);
	});

	it('Melon Mania only pays from the second melon on', () => {
		// Driven through the real harvest, because the ability counts melons in
		// the discard pile — where the collected card lands before its text fires.
		const build = (discardPile: 'MELON'[]) =>
			testMatch({
				players: [{ id: 'me', coins: 0, beds: [{ crop: { defId: 'MELON', reapTimer: 0, value: 6 } }] }],
				discardPile,
			});

		const second = build(['MELON']);
		const paid = runHarvest(second.model, pid('me'));
		expect(paid.players[pid('me')]?.coins).toBeGreaterThanOrEqual(6 + 1);

		const first = build([]);
		expect(runHarvest(first.model, pid('me')).players[pid('me')]?.coins).toBe(6);
	});

	it('Radish Rally steals only while a second Wasabi waits in hand', () => {
		const armed = testMatch({
			players: [
				{ id: 'me', coins: 0, hand: ['WASABI'], beds: [{ crop: { defId: 'WASABI', reapTimer: 2 } }] },
				{ id: 'foe', coins: 2 },
			],
		});
		const robbed = fire(armed.model, pid('me'), armed.crops.me[0]!, { target: { playerId: pid('foe') } }, 'on_plant');
		// The 1d4 is capped by the victim's two coins.
		expect(robbed.players[pid('foe')]?.coins).toBeLessThan(2);
		expect(robbed.players[pid('me')]?.coins).toBe(2 - (robbed.players[pid('foe')]?.coins ?? 0));

		const unarmed = testMatch({
			players: [
				{ id: 'me', hand: ['WHEAT'], beds: [{ crop: { defId: 'WASABI', reapTimer: 2 } }] },
				{ id: 'foe', coins: 2 },
			],
		});
		expect(fire(unarmed.model, pid('me'), unarmed.crops.me[0]!, { target: { playerId: pid('foe') } }, 'on_plant')).toBe(
			unarmed.model,
		);
	});

	it('Pineapple Punch destroys a chosen crop into the deck, but not a Greenhouse one', () => {
		const { model, crops } = testMatch({
			players: [
				{ id: 'me', beds: [{ crop: { defId: 'PINEAPPLE', reapTimer: 0 } }] },
				{
					id: 'foe',
					beds: [
						{ crop: { defId: 'CHERRY', reapTimer: 2 } },
						{ type: 'GREENHOUSE', crop: { defId: 'GRAPE', reapTimer: 3 } },
					],
				},
			],
		});

		const smashed = fire(model, pid('me'), crops.me[0]!, { target: { playerId: pid('foe'), bedIndex: 0 } }, 'on_harvest');
		expect(smashed.players[pid('foe')]?.beds[0]?.crop).toBeNull();
		expect(smashed.deck).toContain(crops.foe[0]);
		expect(smashed.discard).not.toContain(crops.foe[0]);

		expect(fire(model, pid('me'), crops.me[0]!, { target: { playerId: pid('foe'), bedIndex: 1 } }, 'on_harvest')).toBe(
			model,
		);
	});

	it('Sweet and Sour raises your other crops and leaves itself alone', () => {
		const { model, crops } = testMatch({
			players: [
				{
					id: 'me',
					beds: [
						{ crop: { defId: 'TANGERINE', reapTimer: 4, value: 15 } },
						{ crop: { defId: 'WHEAT', reapTimer: 1, value: 2 } },
					],
				},
				{ id: 'foe', beds: [{ crop: { defId: 'CORN', reapTimer: 1, value: 3 } }] },
			],
		});

		const next = fire(model, pid('me'), crops.me[0]!, {}, 'on_plant');

		expect(next.cards[crops.me[1]!]?.value).toBe(3);
		expect(next.cards[crops.me[0]!]?.value).toBe(15);
		expect(next.cards[crops.foe[0]!]?.value).toBe(3);
	});

	it('Trick or Treat collects a coin per fertilizer, capped by each purse', () => {
		const { model, crops } = testMatch({
			players: [
				{ id: 'me', coins: 0, beds: [{ crop: { defId: 'PUMPKIN', reapTimer: 0 } }] },
				{ id: 'rich', coins: 10, fertilizers: 3 },
				{ id: 'broke', coins: 1, fertilizers: 5 },
			],
		});

		const next = fire(model, pid('me'), crops.me[0]!, {}, 'on_harvest');

		expect(next.players[pid('rich')]?.coins).toBe(7);
		expect(next.players[pid('broke')]?.coins).toBe(0); // owed 5, had 1
		expect(next.players[pid('me')]?.coins).toBe(3 + 1);
	});

	it('Grapevine upgrades a plain bed or pays four coins from a special one', () => {
		const plain = testMatch({
			players: [{ id: 'me', coins: 0, beds: [{ type: 'RAISED', crop: { defId: 'GRAPE', reapTimer: 0 } }] }],
		});
		const upgraded = fire(plain.model, pid('me'), plain.crops.me[0]!, { bedIndex: 0 }, 'on_harvest');
		expect(upgraded.players[pid('me')]?.beds[0]?.type).toBe('HYDROPONIC');

		const special = testMatch({
			players: [{ id: 'me', coins: 0, beds: [{ type: 'TRELLIS', crop: { defId: 'GRAPE', reapTimer: 0 } }] }],
		});
		const paid = fire(special.model, pid('me'), special.crops.me[0]!, { bedIndex: 0 }, 'on_harvest');
		expect(paid.players[pid('me')]?.beds[0]?.type).toBe('TRELLIS');
		expect(paid.players[pid('me')]?.coins).toBe(4);
	});

	it('Berry Blitz sends every opponent best card to the deck at value 1', () => {
		const { model, hands, crops } = testMatch({
			players: [
				{ id: 'me', beds: [{ crop: { defId: 'CLOUDBERRY', reapTimer: 5 } }] },
				{ id: 'foe', hand: ['WHEAT', 'STRAWBERRY'] }, // strawberry is the fat one
				{ id: 'empty' },
			],
		});

		const next = fire(model, pid('me'), crops.me[0]!, {}, 'on_plant');

		expect(next.players[pid('foe')]?.hand).toEqual([hands.foe[0]]);
		expect(next.deck).toContain(hands.foe[1]);
		expect(next.cards[hands.foe[1]!]?.value).toBe(1);
	});

	it('Blueberry Boom downgrades a bed; a Greenhouse trades itself for the crop', () => {
		const { model, crops } = testMatch({
			players: [
				{ id: 'me', beds: [{ crop: { defId: 'BLUEBERRY', reapTimer: 5 } }] },
				{
					id: 'foe',
					beds: [
						{ type: 'RAISED', crop: { defId: 'CHERRY', reapTimer: 2 } },
						{ type: 'GREENHOUSE', crop: { defId: 'GRAPE', reapTimer: 3 } },
					],
				},
			],
		});

		const openField = fire(model, pid('me'), crops.me[0]!, { target: { playerId: pid('foe'), bedIndex: 0 } }, 'on_plant');
		expect(openField.players[pid('foe')]?.beds[0]?.type).toBe('COMMON');
		expect(openField.players[pid('foe')]?.beds[0]?.crop).toBeNull();

		const sheltered = fire(model, pid('me'), crops.me[0]!, { target: { playerId: pid('foe'), bedIndex: 1 } }, 'on_plant');
		expect(sheltered.players[pid('foe')]?.beds[1]?.type).toBe('COMMON');
		expect(sheltered.players[pid('foe')]?.beds[1]?.crop?.cardId).toBe(crops.foe[1]);
	});
});

describe('action abilities', () => {
	it('Recycle converts a card into fertilizers by rarity grade, plus one', () => {
		const { model, hands } = testMatch({
			players: [{ id: 'me', fertilizers: 0, hand: ['RECYCLE', 'PINEAPPLE'] }],
		});

		const next = fire(model, pid('me'), hands.me[0]!, { target: { cardId: hands.me[1]! } });

		expect(next.players[pid('me')]?.fertilizers).toBe(3 + 1); // Rare = grade 3
		expect(next.discard).toContain(hands.me[1]);
	});

	it('Fungus Flay withers a colour except Greenhouses, never below zero', () => {
		const { model, hands, crops } = testMatch({
			players: [
				{ id: 'me', hand: ['FUNGUS_FLAY'] },
				{
					id: 'foe',
					beds: [
						{ crop: { defId: 'CABBAGE', reapTimer: 1, value: 0 } },
						{ type: 'GREENHOUSE', crop: { defId: 'POTATO', reapTimer: 2, value: 5 } },
						{ crop: { defId: 'CHERRY', reapTimer: 1, value: 2 } },
					],
				},
			],
		});

		const next = fire(model, pid('me'), hands.me[0]!, { target: { color: 'GREEN' } });

		expect(next.cards[crops.foe[0]!]?.value).toBe(0); // floored
		expect(next.cards[crops.foe[1]!]?.value).toBe(5); // sheltered
		expect(next.cards[crops.foe[2]!]?.value).toBe(2); // wrong colour
	});

	it('Seed Sprout draws one card per colour grown, capped at three', () => {
		const { model, hands } = testMatch({
			players: [
				{
					id: 'me',
					hand: ['SEED_SPROUT'],
					beds: [
						{ crop: { defId: 'WHEAT', reapTimer: 1 } }, // yellow
						{ crop: { defId: 'CHERRY', reapTimer: 1 } }, // red
						{ crop: { defId: 'CABBAGE', reapTimer: 1 } }, // green
						{ crop: { defId: 'CORN', reapTimer: 1 } }, // yellow again
					],
				},
			],
			deck: ['WHEAT', 'CORN', 'MANGO', 'BEANS'],
		});

		const next = fire(model, pid('me'), hands.me[0]!);

		expect(next.players[pid('me')]?.hand).toHaveLength(1 + 3);
		expect(next.deck).toHaveLength(1);
	});

	it('Garden Gnome makes each opponent discard one random card per point of value', () => {
		const { model, hands } = testMatch({
			players: [
				{ id: 'me', hand: ['GARDEN_GNOME'] },
				{ id: 'a', hand: ['WHEAT', 'CORN'] },
				{ id: 'b', hand: ['MANGO'] },
			],
		});

		const next = fire(model, pid('me'), hands.me[0]!);

		expect(next.players[pid('a')]?.hand).toHaveLength(1);
		expect(next.players[pid('b')]?.hand).toHaveLength(0);
		expect(next.discard).toHaveLength(2);
	});

	it('Soil Enrichment and Drought move reap timers both ways', () => {
		const { model, hands, crops } = testMatch({
			players: [
				{ id: 'me', hand: ['SOIL_ENRICHMENT', 'DROUGHT'], beds: [{ crop: { defId: 'PINEAPPLE', reapTimer: 3 } }] },
				{ id: 'foe', beds: [{ crop: { defId: 'CHERRY', reapTimer: 1 } }] },
			],
		});

		const enriched = fire(model, pid('me'), hands.me[0]!);
		expect(enriched.players[pid('me')]?.beds[0]?.crop?.reapTimer).toBe(2);
		expect(enriched.players[pid('foe')]?.beds[0]?.crop?.reapTimer).toBe(1); // mine only

		const dried = fire(model, pid('me'), hands.me[1]!);
		expect(dried.players[pid('me')]?.beds[0]?.crop?.reapTimer).toBe(5); // everyone
		expect(dried.players[pid('foe')]?.beds[0]?.crop?.reapTimer).toBe(3);
		expect(crops.foe[0]).toBeDefined();
	});

	it('Clone pulls a copy of the targeted crop out of the deck', () => {
		const { model, hands, deck } = testMatch({
			players: [
				{ id: 'me', hand: ['CLONE'] },
				{ id: 'foe', beds: [{ crop: { defId: 'STRAWBERRY', reapTimer: 4 } }] },
			],
			deck: ['WHEAT', 'STRAWBERRY'],
		});

		const next = fire(model, pid('me'), hands.me[0]!, { target: { playerId: pid('foe'), bedIndex: 0 } });

		expect(next.players[pid('me')]?.hand).toContain(deck[1]);
		expect(next.deck).toEqual([deck[0]]);
	});

	it('Demon of Harvest: jackpot reaps the world, a bad roll without fuel kills your garden', () => {
		const build = (seed: number, fertilizers: number) =>
			testMatch({
				players: [
					{
						id: 'me',
						coins: 0,
						fertilizers,
						hand: ['DEMON'],
						beds: [{ crop: { defId: 'WHEAT', reapTimer: 1, value: 4 } }],
					},
					{ id: 'foe', coins: 0, beds: [{ crop: { defId: 'CHERRY', reapTimer: 2, value: 2 } }] },
				],
				seed,
			});

		const jackpotSeed = findSeed(20, (v) => v === 20);
		const jackpot = build(jackpotSeed, 0);
		const reaped = fire(jackpot.model, pid('me'), jackpot.hands.me[0]!);
		// Every crop in the game is collected for its owner.
		expect(reaped.players[pid('me')]?.coins).toBe(4);
		expect(reaped.players[pid('foe')]?.coins).toBe(2);
		expect(reaped.players[pid('foe')]?.beds[0]?.crop).toBeNull();

		const bustSeed = findSeed(20, (v) => v > 1 && v < 20);
		const bust = build(bustSeed, 0); // cannot pay the roll
		const burned = fire(bust.model, pid('me'), bust.hands.me[0]!);
		expect(burned.players[pid('me')]?.beds[0]?.crop).toBeNull();
		expect(burned.players[pid('me')]?.coins).toBe(0); // died, not harvested
		expect(burned.players[pid('foe')]?.beds[0]?.crop).not.toBeNull();
	});

	it('Black Friday returns hands to the deck, discards the market, and pays per card', () => {
		const { model, hands } = testMatch({
			players: [
				{ id: 'me', coins: 0, hand: ['BLACK_FRIDAY', 'WHEAT'] },
				{ id: 'foe', hand: ['CORN', 'MANGO'] },
			],
			market: ['CHERRY', 'BEANS', null, null, null, null],
			deck: ['POTATO'],
		});

		// Fired via applyCardAbility directly: playCard would have discarded the
		// card itself first; here the hand still holds it, and it counts itself.
		const next = fire(model, pid('me'), hands.me[0]!);

		// 2 (mine incl. the card) + 2 (foe) hands + 2 market = 6 affected.
		expect(next.players[pid('me')]?.coins).toBe(6);
		expect(next.players[pid('me')]?.hand).toHaveLength(0);
		expect(next.players[pid('foe')]?.hand).toHaveLength(0);
		// The market was refilled from a deck that swallowed the hands.
		expect(next.market.filter((slot) => slot !== null).length).toBeGreaterThan(0);
	});

	it('Reap And Sow strips a colour of crop cards from every opponent hand', () => {
		const { model, hands } = testMatch({
			players: [
				{ id: 'me', hand: ['REAP_AND_SOW'] },
				{ id: 'a', hand: ['CHERRY', 'CABBAGE', 'RED_HEAT'] }, // red crop, green crop, red-ish action
				{ id: 'b', hand: ['TOMATO'] },
			],
		});

		const next = fire(model, pid('me'), hands.me[0]!, { target: { color: 'RED' } });

		expect(next.players[pid('me')]?.hand).toEqual(
			expect.arrayContaining([hands.me[0], hands.a[0], hands.b[0]]),
		);
		expect(next.players[pid('a')]?.hand).toEqual(expect.arrayContaining([hands.a[1], hands.a[2]]));
	});

	it('Early Bird collects your whole garden at once and draws a card', () => {
		const { model, hands } = testMatch({
			players: [
				{
					id: 'me',
					coins: 0,
					hand: ['EARLY_BIRD'],
					beds: [
						{ crop: { defId: 'WHEAT', reapTimer: 1, value: 4 } },
						{ crop: { defId: 'CORN', reapTimer: 3, value: 3 } },
					],
				},
			],
			deck: ['MANGO'],
		});

		const next = fire(model, pid('me'), hands.me[0]!);

		expect(next.players[pid('me')]?.coins).toBe(7);
		expect(next.players[pid('me')]?.beds.every((bed) => bed.crop === null)).toBe(true);
		expect(next.players[pid('me')]?.hand).toHaveLength(2); // EARLY_BIRD + the drawn mango
	});

	it('Genetic Modification doubles the value of every growing crop of yours', () => {
		const { model, hands, crops } = testMatch({
			players: [
				{ id: 'me', hand: ['GENETIC_MODIFICATION'], beds: [{ crop: { defId: 'PINEAPPLE', reapTimer: 2, value: 9 } }] },
				{ id: 'foe', beds: [{ crop: { defId: 'CHERRY', reapTimer: 1, value: 2 } }] },
			],
		});

		const next = fire(model, pid('me'), hands.me[0]!);

		expect(next.cards[crops.me[0]!]?.value).toBe(18);
		expect(next.cards[crops.foe[0]!]?.value).toBe(2);
	});

	it('Cloud Cover delays every crop of a chosen opponent by 1d4 each', () => {
		const { model, hands } = testMatch({
			players: [
				{ id: 'me', hand: ['CLOUD_COVER'] },
				{ id: 'foe', beds: [{ crop: { defId: 'CHERRY', reapTimer: 1 } }, { crop: { defId: 'GRAPE', reapTimer: 3 } }] },
			],
		});

		const next = fire(model, pid('me'), hands.me[0]!, { target: { playerId: pid('foe') } });

		const first = next.players[pid('foe')]?.beds[0]?.crop?.reapTimer ?? 0;
		const second = next.players[pid('foe')]?.beds[1]?.crop?.reapTimer ?? 0;
		expect(first).toBeGreaterThanOrEqual(2);
		expect(first).toBeLessThanOrEqual(5);
		expect(second).toBeGreaterThanOrEqual(4);
		expect(second).toBeLessThanOrEqual(7);
	});

	it('Land Reclamation retrieves a discarded card and its twin from the deck', () => {
		const { model, hands, discardPile, deck } = testMatch({
			players: [{ id: 'me', hand: ['LAND_RECLAMATION'] }],
			discardPile: ['STRAWBERRY'],
			deck: ['WHEAT', 'STRAWBERRY'],
		});

		const next = fire(model, pid('me'), hands.me[0]!, { target: { cardId: discardPile[0]! } });

		expect(next.players[pid('me')]?.hand).toEqual(
			expect.arrayContaining([discardPile[0], deck[1]]),
		);
		expect(next.discard).toHaveLength(0);
	});

	it('declines cleanly when a required target is missing', () => {
		const { model, hands } = testMatch({
			players: [{ id: 'me', hand: ['WITHER', 'CLONE', 'THORNY_FENCE'] }],
		});

		for (const cardId of hands.me) {
			expect(fire(model, pid('me'), cardId!)).toBe(model);
		}
	});
});
