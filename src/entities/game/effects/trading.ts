import {
	addToHand,
	adjustCoins,
	type CardInstanceId,
	type GameModel,
	type PlayerId,
	removeFromHand,
} from '../model';

/**
 * TRADE (`docs/rules.md` → Trade): the active player offers a set of cards,
 * opponents bid coins for the whole set, and the seller may take one bid. No
 * partial deals — the set moves or nothing does.
 */

/**
 * The active player puts cards up. Replaces any previous offer this turn.
 *
 * There is no separate "send" any more: the seller's every pick arrives here, so
 * this runs once per card rather than once per turn, and the last call wins. Two
 * consequences worth stating, because both are deliberate:
 *
 * - **An empty set retracts the offer.** Taking the last card back off the table
 *   is how a seller changes their mind, and leaving a stale set up would be the
 *   one way to trade a card you no longer meant to.
 * - **Bids start over on every change.** They were made against a different set,
 *   so keeping them would let a seller add a card to a price somebody already
 *   agreed to. The seller only gets this window until the first bid lands —
 *   after that `TradingAutomata` is in CHOOSING and sends nothing more.
 */
export function offerTrade(model: GameModel, intent: { playerId: PlayerId; cardIds: CardInstanceId[] }): GameModel {
	const { playerId, cardIds } = intent;
	if (model.turn.phase !== 'TRADE' || model.turn.activePlayerId !== playerId) return model;

	const hand = model.players[playerId]?.hand ?? [];
	const offered = cardIds.filter((cardId) => hand.includes(cardId));
	if (offered.length === 0) {
		return model.turn.trade === null ? model : { ...model, turn: { ...model.turn, trade: null } };
	}

	return { ...model, turn: { ...model.turn, trade: { sellerId: playerId, cardIds: offered, bids: {} } } };
}

/**
 * An opponent bids. A bid beyond the bidder's purse is refused outright rather
 * than clamped: the seller has to be able to trust the number they are shown.
 */
export function placeBid(model: GameModel, intent: { playerId: PlayerId; coins: number }): GameModel {
	const { playerId, coins } = intent;
	const trade = model.turn.trade;
	if (model.turn.phase !== 'TRADE' || !trade) return model;
	if (playerId === trade.sellerId) return model;
	if (coins < 0 || coins > (model.players[playerId]?.coins ?? 0)) return model;

	return {
		...model,
		turn: { ...model.turn, trade: { ...trade, bids: { ...trade.bids, [playerId]: coins } } },
	};
}

/** The seller takes a bid: coins one way, the whole set the other. */
export function acceptBid(model: GameModel, intent: { playerId: PlayerId; bidderId: PlayerId }): GameModel {
	const { playerId, bidderId } = intent;
	const trade = model.turn.trade;
	if (model.turn.phase !== 'TRADE' || !trade || trade.sellerId !== playerId) return model;

	const bid = trade.bids[bidderId];
	if (bid === undefined) return model;

	// The buyer may have spent coins since bidding — the deal simply falls through.
	if ((model.players[bidderId]?.coins ?? 0) < bid) return model;

	const sellerHand = model.players[playerId]?.hand ?? [];
	const moved = trade.cardIds.filter((cardId) => sellerHand.includes(cardId));
	if (moved.length !== trade.cardIds.length) return model;

	let next = moved.reduce((acc, cardId) => removeFromHand(acc, playerId, cardId), model);
	next = addToHand(next, bidderId, moved);
	next = adjustCoins(adjustCoins(next, bidderId, -bid), playerId, bid);

	return { ...next, turn: { ...next.turn, trade: null } };
}
