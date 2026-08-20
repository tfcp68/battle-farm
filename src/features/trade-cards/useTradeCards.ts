import type { CardInstanceId, PlayerId } from '~/entities/game';
import { useFSM } from '@yantrix/react';
import { useMachines } from '~/app/providers/MachinesContext';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import {
	type TradingStateName,
	tradingStateName,
	type WaitingStateName,
	waitingStateName,
} from '~/shared/lib/fsm/selectors';

interface TradingContext {
	/** The ticked set as a map, the same shape the lobby keeps readiness in. */
	offered?: Record<string, unknown> | null;
}

/**
 * TRADE: the one phase where a player who is *not* on turn acts.
 *
 * Two machines, because there are two roles and a peer is only ever in one:
 * `TradingAutomata` collects the seller's set and waits out the bids,
 * `WaitingAutomata` is everyone else deciding whether to bid. Which one is open
 * follows from the model — the seller is whoever the offer says it is — so the
 * page never has to keep a flag for it.
 *
 * The ticked set lives in the seller machine's context rather than in React:
 * adding and removing are separate events because a state's reducer cannot tell
 * which action brought it there, so a toggle is two `+ByPass` states, exactly as
 * the lobby does for its ready map.
 *
 * **Ticking a card *is* the offer.** There is no Offer button: `CARD_ADDED`
 * bypasses straight into `OFFERED`, which emits `trade_offer_committed`, so the
 * set on the table is always exactly the set the seller has picked. Each change
 * republishes it and `offerTrade` starts the bidding over — which is the point,
 * since a bid was made against a different set. Once a bid is in, the machine
 * has left `OFFERED` for `CHOOSING` and the set is sealed.
 */
export function useTradeCards(): {
	sellerState: TradingStateName | null;
	bidderState: WaitingStateName | null;
	/** Hand cards the seller has ticked so far — and therefore has on offer. */
	offered: CardInstanceId[];
	toggleCard: (cardId: CardInstanceId) => void;
	acceptBid: (bidderId: PlayerId) => void;
	placeBid: (coins: number) => void;
} {
	const { trading, waiting } = useMachines();
	const { state: tradingState, getContext } = useFSM<TradingContext>(trading.instance);
	const { state: waitingState } = useFSM(waiting.instance);

	const offered = Object.keys(getContext()?.context?.offered ?? {}) as CardInstanceId[];

	return {
		sellerState: tradingStateName(tradingState),
		bidderState: waitingStateName(waitingState),
		offered,

		toggleCard(cardId: CardInstanceId) {
			const event = offered.includes(cardId)
				? MatchUiEvents.trade_card_removed
				: MatchUiEvents.trade_card_added;
			emitDomainEvent(event, { cardId });
		},

		acceptBid(bidderId: PlayerId) {
			emitDomainEvent(MatchUiEvents.trade_bid_accepted, { bidderId });
		},

		placeBid(coins: number) {
			emitDomainEvent(MatchUiEvents.waiting_bid_placed, { coins });
		},
	};
}
