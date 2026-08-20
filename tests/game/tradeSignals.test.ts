import { beforeEach, describe, expect, it } from '@jest/globals';
import { type AppModel, asPlayerId, emptyAppModel, type PlayerId, type TurnPhase } from '~/entities/game';
import { startTradeSignals } from '~/app/yantrix/tradeSignals';
import { ModelStore } from '~/shared/lib/model';
import { testMatch } from './harness';

/**
 * The two trade cues that no turn transition produces.
 *
 * The phase boundaries themselves moved into `TurnLoopAutomata`, which walks
 * them and emits its own openings — see `tests/fsm/phaseBoundaries.test.ts`.
 * What is left here depends on what *another* player did: a bid landing, and an
 * offer appearing while it is not your turn. The rig is a real store plus a list
 * of what it announced.
 */

const ME = asPlayerId('p-one');
const RIVAL = asPlayerId('p-two');

interface BoardSpec {
	phase: TurnPhase;
	active?: string;
	hand?: 'full' | 'empty';
	crops?: boolean;
	fertilizers?: number;
	coins?: number;
	trade?: { sellerId: PlayerId; bids?: Record<string, number> };
}

function board(spec: BoardSpec): AppModel {
	const built = testMatch({
		players: [
			{
				id: 'p-one',
				hand: spec.hand === 'empty' ? [] : ['WHEAT', 'LUCKY_FIND'],
				coins: spec.coins ?? 5,
				fertilizers: spec.fertilizers ?? 2,
				beds: spec.crops === false ? [{}] : [{ crop: { defId: 'WHEAT', reapTimer: 0 } }],
			},
			{ id: 'p-two' },
		],
		phase: spec.phase,
		active: spec.active ?? 'p-one',
		market: ['WHEAT', 'LUCKY_FIND'],
	});

	const match = spec.trade
		? {
				...built.model,
				turn: {
					...built.model.turn,
					trade: {
						sellerId: spec.trade.sellerId,
						cardIds: [],
						bids: (spec.trade.bids ?? {}) as Record<PlayerId, number>,
					},
				},
			}
		: built.model;

	return { match };
}

describe('the trade cues', () => {
	let store: ModelStore<AppModel>;
	let announced: Array<[string, unknown]>;
	let viewerId: PlayerId | null;
	let stop: () => void;

	const names = () => announced.map(([event]) => event);

	beforeEach(() => {
		store = new ModelStore<AppModel>(emptyAppModel());
		announced = [];
		viewerId = ME;
		stop = startTradeSignals({
			store,
			emit: (event: string, meta: unknown) => announced.push([event, meta]),
			getViewerId: () => viewerId,
		});
	});

	/** A turn with no open offer produces no cue at all — that is the common case. */
	it('stays quiet while nobody is trading', () => {
		store.commit(board({ phase: 'PLAYING' }));
		store.commit(board({ phase: 'FERTILIZE' }));
		expect(names()).toEqual([]);
		stop();
	});

	it('stays shut for a browser with no profile', () => {
		viewerId = null;
		store.commit(board({ phase: 'PLAYING' }));
		expect(names()).toEqual([]);
		stop();
	});

	it('wakes the bidder when someone else opens a trade', () => {
		store.commit(board({ phase: 'TRADE', active: 'p-two', trade: { sellerId: RIVAL } }));

		expect(names()).toEqual(['trade_offer_appeared']);
		expect(announced[0]?.[1]).toMatchObject({ coins: 5 });

		store.commit(board({ phase: 'TRADE', active: 'p-two' }));
		expect(names()).toEqual(['trade_offer_appeared', 'trade_offer_closed']);
		stop();
	});

	it('leaves the seller out of their own bidding', () => {
		store.commit(board({ phase: 'TRADE', trade: { sellerId: ME } }));

		expect(names()).not.toContain('trade_offer_appeared');
		stop();
	});

	it('tells the seller only once there is something to choose between', () => {
		store.commit(board({ phase: 'TRADE', trade: { sellerId: ME } }));
		expect(names()).not.toContain('trade_bids_gathered');

		store.commit(board({ phase: 'TRADE', trade: { sellerId: ME, bids: { 'p-two': 3 } } }));
		expect(names()).toContain('trade_bids_gathered');
		stop();
	});

	/**
	 * The seller's cue has no closing event of its own: `turn_phase_ended` takes
	 * them out of CHOOSING, and the trading machine subscribes to it directly. A
	 * second road to the same transition would be two events racing for one edge.
	 */
	it('never closes the seller cue itself', () => {
		store.commit(board({ phase: 'TRADE', trade: { sellerId: ME, bids: { 'p-two': 3 } } }));
		expect(names()).toEqual(['trade_bids_gathered']);

		store.commit(board({ phase: 'PLAYING' }));
		expect(names()).toEqual(['trade_bids_gathered']);
		stop();
	});

	it('says nothing more once detached', () => {
		store.commit(board({ phase: 'TRADE', active: 'p-two', trade: { sellerId: RIVAL } }));
		const before = announced.length;
		stop();

		store.commit(board({ phase: 'PLAYING' }));
		expect(announced).toHaveLength(before);
	});
});
