import { describe, expect, it } from '@jest/globals';
import { asCardInstanceId } from '~/entities/game';
import FertilizingAutomata, {
	eventDictionary as fertilizingEvents,
	statesDictionary as fertilizingStates,
} from '~/shared/lib/fsm/game/FertilizingAutomata';
import HarvestAutomata, {
	eventDictionary as harvestEvents,
	statesDictionary as harvestStates,
} from '~/shared/lib/fsm/game/HarvestAutomata';
import ShoppingAutomata, {
	eventDictionary as shoppingEvents,
	statesDictionary as shoppingStates,
} from '~/shared/lib/fsm/game/ShoppingAutomata';
import TradingAutomata, {
	eventDictionary as tradingEvents,
	statesDictionary as tradingStates,
} from '~/shared/lib/fsm/game/TradingAutomata';
import WaitingAutomata, {
	eventDictionary as waitingEvents,
	statesDictionary as waitingStates,
} from '~/shared/lib/fsm/game/WaitingAutomata';

/**
 * The five phase machines the pilot left dead, driven as the CoreLoop drives
 * them. The claim under test is the same one the play machines make: a move
 * leaves this peer only when the machine took the click, so a confirm with
 * nothing picked, a bid from the seller or a phase that never opened all leave
 * the table untouched.
 */

interface Machine {
	state: number | null;
	eventAdapter?: { handleEvent: (event: { event: number; meta: unknown }) => unknown[] } | null;
	dispatch: (action: never) => unknown;
	getContext: () => { context: Record<string, unknown> } | null;
}

function dispatch(machine: Machine, event: number, meta: Record<string, unknown> | null) {
	const actions = machine.eventAdapter?.handleEvent({ event, meta }) ?? [];
	for (const action of actions) machine.dispatch(action as never);
}

describe('harvest', () => {
	it('runs only when something is ripe', () => {
		const harvest = new HarvestAutomata();

		dispatch(harvest, harvestEvents.harvest_phase_started, { crops: [{ bedIndex: 0, reapTimer: 2 }] });
		expect(harvest.state).toBe(harvestStates.IDLE);

		dispatch(harvest, harvestEvents.harvest_phase_started, { crops: [{ bedIndex: 0, reapTimer: 0 }] });
		expect(harvest.state).toBe(harvestStates.HARVESTING);

		dispatch(harvest, harvestEvents.turn_phase_ended, null);
		expect(harvest.state).toBe(harvestStates.IDLE);
	});
});

describe('shopping', () => {
	const open = (coins: number) => {
		const shopping = new ShoppingAutomata();
		dispatch(shopping, shoppingEvents.shopping_phase_started, { coins, marketPrices: [2, 5] });
		return shopping;
	};

	it('stays shut for a purse that can afford nothing', () => {
		expect(open(1).state).toBe(shoppingStates.IDLE);
	});

	it('spends on the slot pick', () => {
		const shopping = open(5);
		expect(shopping.state).toBe(shoppingStates.BROWSING);

		dispatch(shopping, shoppingEvents.market_slot_picked, { slotIndex: 3 });
		expect(shopping.state).toBe(shoppingStates.PURCHASED);
		expect(shopping.getContext()?.context).toMatchObject({ slotIndex: 3 });
	});

	it('closes with the phase, mid-pick or not', () => {
		const shopping = open(5);
		dispatch(shopping, shoppingEvents.market_slot_picked, { slotIndex: 1 });
		dispatch(shopping, shoppingEvents.turn_phase_ended, null);

		expect(shopping.state).toBe(shoppingStates.IDLE);
	});
});

describe('fertilizing', () => {
	const open = (fertilizers: number, crops: Array<{ bedIndex: number; reapTimer: number }>) => {
		const fertilizing = new FertilizingAutomata();
		dispatch(fertilizing, fertilizingEvents.fertilize_phase_started, { fertilizers, crops });
		return fertilizing;
	};

	it('stays shut without a fertilizer or without a crop', () => {
		expect(open(0, [{ bedIndex: 0, reapTimer: 2 }]).state).toBe(fertilizingStates.IDLE);
		expect(open(2, []).state).toBe(fertilizingStates.IDLE);
	});

	it('spends on the crop pick', () => {
		const fertilizing = open(2, [{ bedIndex: 1, reapTimer: 3 }]);
		expect(fertilizing.state).toBe(fertilizingStates.CROP_SELECTION);

		dispatch(fertilizing, fertilizingEvents.fertilize_crop_picked, { bedIndex: 1 });
		expect(fertilizing.state).toBe(fertilizingStates.FERTILIZED);
	});
});

describe('trading — the seller', () => {
	const CARD_A = asCardInstanceId('a#1');
	const CARD_B = asCardInstanceId('b#2');

	const open = () => {
		const trading = new TradingAutomata();
		dispatch(trading, tradingEvents.trade_phase_started, { hand: [CARD_A, CARD_B] });
		return trading;
	};

	const offered = (trading: TradingAutomata) =>
		Object.keys((trading.getContext()?.context?.offered ?? {}) as Record<string, unknown>);

	it('stays shut with an empty hand', () => {
		const trading = new TradingAutomata();
		dispatch(trading, tradingEvents.trade_phase_started, { hand: [] });
		expect(trading.state).toBe(tradingStates.IDLE);
	});

	it('collects a set one card at a time', () => {
		const trading = open();
		expect(trading.state).toBe(tradingStates.COLLECT);

		dispatch(trading, tradingEvents.trade_card_added, { cardId: CARD_A });
		dispatch(trading, tradingEvents.trade_card_added, { cardId: CARD_B });
		expect(offered(trading).sort()).toEqual([CARD_A, CARD_B].sort());

		dispatch(trading, tradingEvents.trade_card_removed, { cardId: CARD_A });
		expect(offered(trading)).toEqual([CARD_B]);
		// Both toggles pass through a `+ByPass` state and land in OFFERED, which
		// is what republishes the set: COLLECT is only ever the empty table.
		expect(trading.state).toBe(tradingStates.OFFERED);
	});

	/**
	 * `setAttr` mutates the object it is handed, so `setAttr(#offered, …)` would
	 * rewrite the *previous* context in place. Everything that compares before
	 * with after then sees no change — `@yantrix/react`'s dispatch patch holds
	 * exactly such a reference and stops notifying React, which froze the trade
	 * panel on "Offer 0 card(s)". The reducer copies first (`omit(#offered,[])`).
	 */
	it('leaves the previous context alone when a card is ticked', () => {
		const trading = open();
		const previous = trading.getContext()?.context as Record<string, unknown>;
		const snapshot = JSON.stringify(previous);

		dispatch(trading, tradingEvents.trade_card_added, { cardId: CARD_A });

		expect(JSON.stringify(previous)).toBe(snapshot);
		expect(offered(trading)).toEqual([CARD_A]);
	});

	/**
	 * Ticking a card *is* offering it — there is no send step between the two.
	 * `CARD_ADDED` bypasses into `OFFERED`, which is what puts the set on the
	 * table, and the set stays editable from there until a bid seals it.
	 */
	it('offers on the first card, then waits for a bid before it can accept', () => {
		const trading = open();

		dispatch(trading, tradingEvents.trade_card_added, { cardId: CARD_A });
		expect(trading.state).toBe(tradingStates.OFFERED);
		expect(offered(trading)).toEqual([CARD_A]);

		dispatch(trading, tradingEvents.trade_card_added, { cardId: CARD_B });
		expect(trading.state).toBe(tradingStates.OFFERED);
		expect(offered(trading).sort()).toEqual([CARD_A, CARD_B].sort());

		dispatch(trading, tradingEvents.trade_card_removed, { cardId: CARD_A });
		expect(offered(trading)).toEqual([CARD_B]);

		dispatch(trading, tradingEvents.trade_bids_gathered, { bids: { 'p-two': 3 } });
		expect(trading.state).toBe(tradingStates.CHOOSING);

		dispatch(trading, tradingEvents.trade_bid_accepted, { bidderId: 'p-two' });
		expect(trading.state).toBe(tradingStates.ACCEPTED);
	});

	it('starts the next trade phase with an empty set', () => {
		const trading = open();
		dispatch(trading, tradingEvents.trade_card_added, { cardId: CARD_A });
		dispatch(trading, tradingEvents.turn_phase_ended, null);

		dispatch(trading, tradingEvents.trade_phase_started, { hand: [CARD_B] });
		expect(trading.state).toBe(tradingStates.COLLECT);
		expect(offered(trading)).toEqual([]);
	});
});

describe('trading — everyone else', () => {
	const open = (coins: number) => {
		const waiting = new WaitingAutomata();
		dispatch(waiting, waitingEvents.trade_offer_appeared, { coins });
		return waiting;
	};

	it('stays shut for a player with nothing to bid', () => {
		expect(open(0).state).toBe(waitingStates.IDLE);
	});

	it('bids once, and only once', () => {
		const waiting = open(4);
		expect(waiting.state).toBe(waitingStates.HAS_TRADE);

		dispatch(waiting, waitingEvents.waiting_bid_placed, { coins: 3 });
		expect(waiting.state).toBe(waitingStates.BID_SENT);

		// A second bid has no edge to take: the offer is answered.
		dispatch(waiting, waitingEvents.waiting_bid_placed, { coins: 4 });
		expect(waiting.state).toBe(waitingStates.BID_SENT);
	});

	it('closes when the offer does', () => {
		const waiting = open(4);
		dispatch(waiting, waitingEvents.waiting_bid_placed, { coins: 3 });
		dispatch(waiting, waitingEvents.trade_offer_closed, null);

		expect(waiting.state).toBe(waitingStates.IDLE);
	});
});
