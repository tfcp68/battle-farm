import { describe, expect, it } from '@jest/globals';
import { asCardInstanceId, asPlayerId, CARD_DEFINITIONS, plantTargetOf, selectionKindOf } from '~/entities/game';
import type { CardDefinition, CropDefinition } from '~/entities/game';
import { isCropDefinition } from '~/entities/game';
import FertilizingAutomata, {
	eventDictionary as fertilizingEvents,
	statesDictionary as fertilizingStates,
} from '~/shared/lib/fsm/game/FertilizingAutomata';
import PlayingCardsAutomata, {
	eventDictionary as playEvents,
	statesDictionary as playStates,
} from '~/shared/lib/fsm/game/PlayingCardsAutomata';
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
 * When a move is final, and how a destination knows.
 *
 * It used to be a state comparison in TypeScript — "is the machine back in
 * BROWSING? then the buy went through" — which restated the diagram badly
 * enough to let two real bugs through (both reproduced below). Now the machine
 * enters a state that means *committed* and emits from it.
 *
 * The emitter is not enough on its own: it re-fires on every accepted dispatch
 * while the machine rests in that state, including actions with no edge out of
 * it (trap 7). What makes it exact is `seq`, bumped by the state's reducer —
 * because a state's reducer does NOT run on a dead dispatch. A repeated
 * emission with an unchanged `seq` is a re-issue, not a new move.
 */

const ME = asPlayerId('p-one');
const CARD_A = asCardInstanceId('a#1');
const CARD_B = asCardInstanceId('b#2');

type Machine =
	| FertilizingAutomata
	| PlayingCardsAutomata
	| ShoppingAutomata
	| TradingAutomata
	| WaitingAutomata;

interface Emission {
	event: number;
	meta: Record<string, unknown>;
}

/** Dispatch, then collect what the CoreLoop would put back on the bus. */
function drive(machine: Machine, event: number, meta: Record<string, unknown> | null): Emission[] {
	const adapter = machine.eventAdapter;
	const actions = adapter?.handleEvent({ event, meta }) ?? [];
	for (const action of actions) machine.dispatch(action);
	return (adapter?.handleTransition(machine.getContext()) ?? []) as unknown as Emission[];
}

const seqOf = (machine: Machine) => (machine.getContext()?.context as { seq?: number } | null)?.seq;

describe('shopping commits on the confirmation', () => {
	const open = () => {
		const shopping = new ShoppingAutomata();
		drive(shopping, shoppingEvents.shopping_phase_started, {
			viewerId: ME,
			coins: 5,
			marketPrices: [2, 5],
		});
		return shopping;
	};

	it('emits once, with the slot and the buyer', () => {
		const shopping = open();
		expect(drive(shopping, shoppingEvents.market_slot_picked, { slotIndex: 3 })).toEqual([]);
		expect(shopping.state).toBe(shoppingStates.CONFIRM);

		const emitted = drive(shopping, shoppingEvents.market_purchase_confirmed, null);
		expect(shopping.state).toBe(shoppingStates.PURCHASED);
		expect(emitted).toHaveLength(1);
		expect(emitted[0]?.meta).toMatchObject({ viewerId: ME, slotIndex: 3, seq: 1 });
	});

	/**
	 * Live bug this closes. The old gate was `shoppingState === BROWSING`, and a
	 * confirm arriving from BROWSING with nothing picked leaves the machine in
	 * BROWSING — so the gate passed and a phantom buy went to the table. Only
	 * `useBuyCard`'s `if (pendingSlot === null) return` stopped it, which put the
	 * rule in the UI instead of in the machine.
	 */
	it('does not buy from BROWSING with no slot picked', () => {
		const shopping = open();
		expect(shopping.state).toBe(shoppingStates.BROWSING);

		const emitted = drive(shopping, shoppingEvents.market_purchase_confirmed, { slotIndex: 3 });

		expect(shopping.state).toBe(shoppingStates.BROWSING);
		expect(emitted).toEqual([]);
	});

	it('keeps buying, one commit per confirmation', () => {
		const shopping = open();
		drive(shopping, shoppingEvents.market_slot_picked, { slotIndex: 3 });
		drive(shopping, shoppingEvents.market_purchase_confirmed, null);

		drive(shopping, shoppingEvents.market_slot_picked, { slotIndex: 1 });
		const second = drive(shopping, shoppingEvents.market_purchase_confirmed, null);
		expect(second[0]?.meta).toMatchObject({ slotIndex: 1, seq: 2 });
	});

	/** Trap 7: the emitter re-fires while resting, but `seq` stands still. */
	it('re-issues the same seq on a dispatch it has no edge for', () => {
		const shopping = open();
		drive(shopping, shoppingEvents.market_slot_picked, { slotIndex: 3 });
		drive(shopping, shoppingEvents.market_purchase_confirmed, null);
		expect(seqOf(shopping)).toBe(1);

		drive(shopping, shoppingEvents.market_purchase_confirmed, null);
		drive(shopping, shoppingEvents.selection_cancelled, null);
		expect(seqOf(shopping)).toBe(1);
	});
});

describe('fertilizing commits on the confirmation', () => {
	const open = () => {
		const fertilizing = new FertilizingAutomata();
		drive(fertilizing, fertilizingEvents.fertilize_phase_started, {
			viewerId: ME,
			fertilizers: 2,
			crops: [{ bedIndex: 1, reapTimer: 3 }],
		});
		return fertilizing;
	};

	it('emits once, with the bed and the player', () => {
		const fertilizing = open();
		drive(fertilizing, fertilizingEvents.fertilize_crop_picked, { bedIndex: 1 });
		expect(fertilizing.state).toBe(fertilizingStates.CROP_CONFIRM);

		const emitted = drive(fertilizing, fertilizingEvents.fertilize_confirmed, null);
		expect(fertilizing.state).toBe(fertilizingStates.FERTILIZED);
		expect(emitted[0]?.meta).toMatchObject({ viewerId: ME, bedIndex: 1, seq: 1 });
	});

	it('does not fertilize from CROP_SELECTION with no bed picked', () => {
		const fertilizing = open();
		expect(drive(fertilizing, fertilizingEvents.fertilize_confirmed, { bedIndex: 1 })).toEqual([]);
		expect(fertilizing.state).toBe(fertilizingStates.CROP_SELECTION);
	});
});

describe('trading commits twice — offering and accepting', () => {
	const open = () => {
		const trading = new TradingAutomata();
		drive(trading, tradingEvents.trade_phase_started, { viewerId: ME, hand: [CARD_A, CARD_B] });
		return trading;
	};

	/**
	 * The offered set travels as the map the machine keeps, not as an array:
	 * `keys(#offered)` in the emit meta generates code referencing an undeclared
	 * `prevContext` and throws (trap 6). The destination does the conversion.
	 */
	it('emits the offered set as a map', () => {
		const trading = open();
		drive(trading, tradingEvents.trade_card_added, { cardId: CARD_A });
		drive(trading, tradingEvents.trade_card_added, { cardId: CARD_B });

		const emitted = drive(trading, tradingEvents.trade_offer_sent, null);
		expect(trading.state).toBe(tradingStates.OFFERED);
		expect(emitted[0]?.meta).toMatchObject({ viewerId: ME, seq: 1 });
		expect(Object.keys((emitted[0]?.meta as { offered: object }).offered).sort()).toEqual(
			[CARD_A, CARD_B].sort(),
		);
	});

	it('emits the accepted bidder from its own state', () => {
		const trading = open();
		drive(trading, tradingEvents.trade_card_added, { cardId: CARD_A });
		drive(trading, tradingEvents.trade_offer_sent, null);
		drive(trading, tradingEvents.trade_bids_gathered, { bids: { 'p-two': 3 } });
		expect(trading.state).toBe(tradingStates.CHOOSING);

		const emitted = drive(trading, tradingEvents.trade_bid_accepted, { bidderId: 'p-two' });
		expect(trading.state).toBe(tradingStates.ACCEPTED);
		expect(emitted[0]?.meta).toMatchObject({ viewerId: ME, bidderId: 'p-two', seq: 2 });
	});

	it('cannot accept a bid before any arrived', () => {
		const trading = open();
		drive(trading, tradingEvents.trade_card_added, { cardId: CARD_A });
		drive(trading, tradingEvents.trade_offer_sent, null);

		const emitted = drive(trading, tradingEvents.trade_bid_accepted, { bidderId: 'p-two' });
		expect(trading.state).toBe(tradingStates.OFFERED);
		// The offer's own emission re-issues, but with the seq it already had.
		expect(emitted.every((e) => e.meta.seq === 1)).toBe(true);
		expect(emitted.some((e) => 'bidderId' in e.meta)).toBe(false);
	});
});

describe('bidding commits once per offer', () => {
	const open = () => {
		const waiting = new WaitingAutomata();
		drive(waiting, waitingEvents.trade_offer_appeared, { viewerId: ME, coins: 4 });
		return waiting;
	};

	it('emits the bid with the bidder', () => {
		const waiting = open();
		expect(waiting.state).toBe(waitingStates.HAS_TRADE);

		const emitted = drive(waiting, waitingEvents.waiting_bid_placed, { coins: 3 });
		expect(waiting.state).toBe(waitingStates.BID_SENT);
		expect(emitted[0]?.meta).toMatchObject({ viewerId: ME, bid: 3, seq: 1 });
	});

	/**
	 * Live bug this closes. The old gate was `waitingState === BID_SENT`, and a
	 * second `waiting_bid_placed` while already in BID_SENT leaves the state
	 * unchanged — so the gate passed again and a second bid went to the table
	 * against an offer this player had already answered.
	 */
	it('does not let a second bid through', () => {
		const waiting = open();
		drive(waiting, waitingEvents.waiting_bid_placed, { coins: 3 });
		expect(seqOf(waiting)).toBe(1);

		const second = drive(waiting, waitingEvents.waiting_bid_placed, { coins: 4 });

		expect(waiting.state).toBe(waitingStates.BID_SENT);
		expect(seqOf(waiting)).toBe(1);
		// The emitter re-issues, but every copy carries the first bid and seq 1.
		expect(second.every((e) => e.meta.seq === 1 && e.meta.bid === 3)).toBe(true);
	});
});

describe('playing commits on whichever pick finishes the card', () => {
	const definition = (id: keyof typeof CARD_DEFINITIONS): CardDefinition => CARD_DEFINITIONS[id];
	const cropDefinition = (id: keyof typeof CARD_DEFINITIONS): CropDefinition => {
		const def = definition(id);
		if (!isCropDefinition(def)) throw new Error(`${String(id)} is not a Crop Card`);
		return def;
	};

	const open = () => {
		const play = new PlayingCardsAutomata();
		drive(play, playEvents.play_phase_started, { viewerId: ME, hand: [CARD_A, CARD_B] });
		return play;
	};

	/**
	 * Three routes into PLAYED, and trap 4 eats any of them whose (source →
	 * target) edge already exists from another action of that source. Each is
	 * asserted separately for exactly that reason.
	 */
	it('route 1 — a no-target Action Card, on the first click', () => {
		const play = open();
		const card = definition('LUCKY_FIND');

		const emitted = drive(play, playEvents.play_card_picked, {
			cardId: CARD_A,
			cardKind: card.kind,
			targetKind: selectionKindOf(card),
		});

		expect(play.state).toBe(playStates.PLAYED);
		expect(emitted[0]?.meta).toMatchObject({ viewerId: ME, cardId: CARD_A, seq: 1 });
	});

	it('route 2 — a Crop with no on-plant target, on the bed', () => {
		const play = open();
		const card = cropDefinition('WHEAT');

		drive(play, playEvents.play_card_picked, {
			cardId: CARD_A,
			cardKind: card.kind,
			targetKind: selectionKindOf(card),
		});
		expect(play.state).toBe(playStates.PLANTING);

		const emitted = drive(play, playEvents.play_bed_picked, {
			cardId: CARD_A,
			bedIndex: 2,
			targetKind: plantTargetOf(card),
		});

		expect(play.state).toBe(playStates.PLAYED);
		expect(emitted[0]?.meta).toMatchObject({ cardId: CARD_A, bedIndex: 2, seq: 1 });
	});

	it('route 3 — anything that asked for a target, on the target', () => {
		const play = open();
		const card = definition('GARDEN_GOURMET');

		drive(play, playEvents.play_card_picked, {
			cardId: CARD_A,
			cardKind: card.kind,
			targetKind: selectionKindOf(card),
		});
		expect(play.state).toBe(playStates.TARGETING);

		const emitted = drive(play, playEvents.play_target_picked, {
			cardId: CARD_A,
			target: { playerId: 'p-2', bedIndex: 1 },
		});

		expect(play.state).toBe(playStates.PLAYED);
		expect(emitted[0]?.meta).toMatchObject({
			cardId: CARD_A,
			target: { playerId: 'p-2', bedIndex: 1 },
			seq: 1,
		});
	});

	it('plays a second card straight out of PLAYED', () => {
		const play = open();
		const first = definition('LUCKY_FIND');
		drive(play, playEvents.play_card_picked, {
			cardId: CARD_A,
			cardKind: first.kind,
			targetKind: selectionKindOf(first),
		});

		const second = definition('LUCKY_FIND');
		const emitted = drive(play, playEvents.play_card_picked, {
			cardId: CARD_B,
			cardKind: second.kind,
			targetKind: selectionKindOf(second),
		});

		expect(play.state).toBe(playStates.PLAYED);
		expect(emitted[0]?.meta).toMatchObject({ cardId: CARD_B, seq: 2 });
	});

	it('does not carry a bed from one card to the next', () => {
		const play = open();
		const crop = cropDefinition('WHEAT');
		drive(play, playEvents.play_card_picked, {
			cardId: CARD_A,
			cardKind: crop.kind,
			targetKind: selectionKindOf(crop),
		});
		drive(play, playEvents.play_bed_picked, { cardId: CARD_A, bedIndex: 2, targetKind: 'none' });

		const action = definition('LUCKY_FIND');
		const emitted = drive(play, playEvents.play_card_picked, {
			cardId: CARD_B,
			cardKind: action.kind,
			targetKind: selectionKindOf(action),
		});

		expect(emitted[0]?.meta).toMatchObject({ cardId: CARD_B, bedIndex: -1 });
	});
});
