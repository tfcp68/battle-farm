import { describe, expect, it } from '@jest/globals';
import {
	affordableMarketSlots,
	type AppModel,
	CARD_DEFINITIONS,
	type CardInstanceId,
	createGameEffectMatrix,
	DECK_SIZE,
	emptyAppModel,
	type GameModel,
	isCropDefinition,
	isFinalTurn,
	type MatchEventIds,
	nextPlayer,
	parseGameModel,
	plantableBeds,
	type PlayerId,
	scoreBoard,
} from '~/entities/game';
import { buildMatchSetup, seedFromRoomCode } from '~/app/yantrix/data/destinations/matchSetup';

/**
 * The whole of phase 3 under one roof: two bots play a complete match by
 * dispatching the same domain events the CoreLoop bus will carry, through the
 * same Effect Matrix `startYantrixCore` attaches. If any card ability, phase
 * effect or lifecycle rule corrupts the model, a few hundred turns of this
 * find it.
 *
 * Event ids are arbitrary numbers on purpose — the matrix is data, bound to
 * whatever dictionary the app supplies.
 */

const EVENTS: MatchEventIds = {
	match_created: 1,
	match_started: 2,
	turn_started: 3,
	turn_phase_ended: 4,
	turn_ended: 5,
	match_ended: 6,
	card_bought: 7,
	card_played: 8,
	fertilizer_used: 9,
	trade_offered: 10,
	trade_bid_placed: 11,
	trade_offer_accepted: 12,
};

const matrix = createGameEffectMatrix(EVENTS);

interface Sim {
	model: AppModel;
	dispatch: (event: number, meta: unknown) => void;
}

function createSim(): Sim {
	const sim: Sim = {
		model: emptyAppModel(),
		dispatch: (event, meta) => {
			const effects = matrix[event] ?? [];
			sim.model = effects.reduce((model, effect) => effect({ event, meta } as never, model), sim.model);
		},
	};
	return sim;
}

/** Every card the match holds, wherever it currently sits. */
function allCardIds(match: GameModel): CardInstanceId[] {
	const inPlay = Object.values(match.players).flatMap((player) => [
		...player.hand,
		...player.beds.flatMap((bed) => (bed.crop ? [bed.crop.cardId] : [])),
	]);
	const inMarket = match.market.filter((slot): slot is CardInstanceId => slot !== null);
	return [...match.deck, ...inMarket, ...match.discard, ...inPlay];
}

/** Greedy but legal: buy what is affordable, plant what fits, fertilize what grows. */
function playTurn(sim: Sim, active: PlayerId) {
	const match = () => sim.model.match!;

	// HARVEST resolved by turn_started; SHOPPING is next.
	sim.dispatch(EVENTS.turn_phase_ended, null);
	while ((match().turn.allowance ?? 0) > 0) {
		const slots = affordableMarketSlots(match(), active);
		if (slots.length === 0) break;
		const before = match().version;
		sim.dispatch(EVENTS.card_bought, { playerId: active, slotIndex: slots[0] });
		if (match().version === before) break; // refused → stop rather than spin
	}

	// TRADE — bots do not haggle.
	sim.dispatch(EVENTS.turn_phase_ended, null);

	// PLAYING — plant every crop card that still finds a bed.
	sim.dispatch(EVENTS.turn_phase_ended, null);
	for (;;) {
		const current = match();
		const hand = current.players[active]?.hand ?? [];
		const beds = plantableBeds(current, active);
		const cropCard = hand.find((cardId) => {
			const defId = current.cards[cardId]?.defId;
			return defId !== undefined && isCropDefinition(CARD_DEFINITIONS[defId]);
		});
		if (!cropCard || beds.length === 0) break;
		const before = current.version;
		sim.dispatch(EVENTS.card_played, { playerId: active, cardId: cropCard, bedIndex: beds[0] });
		if (match().version === before) break;
	}

	// FERTILIZE — pour the allowance into the first growing crop.
	sim.dispatch(EVENTS.turn_phase_ended, null);
	while ((match().turn.allowance ?? 0) > 0) {
		const grown = match().players[active]?.beds.findIndex((bed) => bed.crop !== null) ?? -1;
		if (grown < 0) break;
		const before = match().version;
		sim.dispatch(EVENTS.fertilizer_used, { playerId: active, bedIndex: grown });
		if (match().version === before) break;
	}

	// CALCULATION, then the turn closes.
	sim.dispatch(EVENTS.turn_phase_ended, null);
	sim.dispatch(EVENTS.turn_ended, null);
}

describe('a full bot match through the Effect Matrix', () => {
	it('deals from the seam payload and plays to FINISHED intact', () => {
		const sim = createSim();

		// The exact payload MatchSetupDataDestination emits on `game_started`.
		const setup = buildMatchSetup({ gameId: 'K7QM2X', playerIds: ['bot-a', 'bot-b'] }, [
			{ playerId: 'bot-a', nickname: 'Ann', isHost: true, isReady: true },
			{ playerId: 'bot-b', nickname: 'Bob', isHost: false, isReady: true },
		]);
		sim.dispatch(EVENTS.match_created, setup);

		expect(sim.model.match).not.toBeNull();
		expect(sim.model.match?.phase).toBe('SETUP');
		expect(sim.model.match?.players['bot-a' as PlayerId]?.nickname).toBe('Ann');

		sim.dispatch(EVENTS.match_started, null);
		expect(sim.model.match?.phase).toBe('IN_PROGRESS');

		// The host driver of phase 4, in miniature: announce turns until the
		// engine says the match is over.
		let turnNumber = 0;
		while (sim.model.match!.phase !== 'FINISHED') {
			expect(++turnNumber).toBeLessThanOrEqual(600);

			const active = nextPlayer(sim.model.match!)!;
			sim.dispatch(EVENTS.turn_started, { activePlayerId: active, turnNumber });
			playTurn(sim, active);

			if (isFinalTurn(sim.model.match!)) {
				sim.dispatch(EVENTS.match_ended, { scoreBoard: scoreBoard(sim.model.match!) });
			}
		}

		const final = sim.model.match!;

		// The endgame actually triggered, and not by fiat.
		expect(final.lastTurnTriggeredBy).not.toBeNull();

		// Conservation: every one of the 204 cards is still somewhere, once.
		const ids = allCardIds(final);
		expect(ids).toHaveLength(DECK_SIZE);
		expect(new Set(ids).size).toBe(DECK_SIZE);

		// The model survived hundreds of commits as a valid snapshot.
		expect(parseGameModel(JSON.parse(JSON.stringify(final)))).not.toBeNull();

		// Somebody actually earned something along the way.
		const scores = Object.values(scoreBoard(final));
		expect(Math.max(...scores)).toBeGreaterThan(3);
	});

	it('deals the same match for the same room code on every peer', () => {
		const roster = [{ playerId: 'p1', nickname: 'Ann', isHost: true, isReady: true }];
		const here = createSim();
		const there = createSim();

		const payload = buildMatchSetup({ gameId: 'ROOM42', playerIds: ['p1', 'p2'] }, roster);
		here.dispatch(EVENTS.match_created, payload);
		there.dispatch(EVENTS.match_created, payload);

		expect(here.model.match).toEqual(there.model.match);
		expect(seedFromRoomCode('ROOM42')).toBe(seedFromRoomCode('ROOM42'));
		expect(seedFromRoomCode('ROOM42')).not.toBe(seedFromRoomCode('ROOM43'));
	});

	it('ignores intents while no match is running', () => {
		const sim = createSim();
		const before = sim.model;

		sim.dispatch(EVENTS.card_bought, { playerId: 'ghost', slotIndex: 0 });
		sim.dispatch(EVENTS.turn_started, { activePlayerId: 'ghost', turnNumber: 1 });

		expect(sim.model).toBe(before);
	});
});
