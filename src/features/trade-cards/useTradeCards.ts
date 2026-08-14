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
 */
export function useTradeCards(): {
	sellerState: TradingStateName | null;
	bidderState: WaitingStateName | null;
	/** Hand cards the seller has ticked so far. */
	offered: CardInstanceId[];
	toggleCard: (cardId: CardInstanceId) => void;
	sendOffer: () => void;
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

		sendOffer() {
			if (offered.length === 0) return;
			emitDomainEvent(MatchUiEvents.trade_offer_sent, { cardIds: offered });
		},

		acceptBid(bidderId: PlayerId) {
			emitDomainEvent(MatchUiEvents.trade_bid_accepted, { bidderId });
		},

		placeBid(coins: number) {
			emitDomainEvent(MatchUiEvents.waiting_bid_placed, { coins });
		},
	};
}
