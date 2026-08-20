import {
	addToHand,
	adjustCoins,
	definitionOf,
	type GameModel,
	marketPriceOf,
	type PlayerId,
	refillMarket,
	takeFromMarket,
} from '../model';

/**
 * SHOPPING (`docs/rules.md` → Buying Seeds): the active player rolls 1d4 and may
 * take up to that many Market cards they can pay for. A taken slot is refilled
 * from the Deck straight away.
 */

/**
 * Every check here is deliberate, not defensive noise: the host applies this to
 * intents that arrive over the network, where nothing guarantees the sender's
 * local FSM agreed the move was legal.
 */
export function buyCard(model: GameModel, intent: { playerId: PlayerId; slotIndex: number }): GameModel {
	const { playerId, slotIndex } = intent;
	if (model.turn.phase !== 'SHOPPING' || model.turn.activePlayerId !== playerId) return model;
	if ((model.turn.allowance ?? 0) <= 0) return model;

	const cardId = model.market[slotIndex] ?? null;
	if (cardId === null) return model;

	const price = marketPriceOf(definitionOf(model, cardId));
	const coins = model.players[playerId]?.coins ?? 0;
	if (price === null || price > coins) return model;

	const [taken, afterTake] = takeFromMarket(model, slotIndex);
	if (taken === null) return model;

	const paid = adjustCoins(afterTake, playerId, -price);
	const inHand = addToHand(paid, playerId, [taken]);
	return {
		...refillMarket(inHand),
		turn: { ...inHand.turn, allowance: (inHand.turn.allowance ?? 1) - 1 },
	};
}
