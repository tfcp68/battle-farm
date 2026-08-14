import {
	definitionOf,
	type GameModel,
	MARKET_SIZE,
	marketPriceOf,
	type PlayerId,
	valueOf,
} from '~/entities/game';
import { DRAG_TYPES } from '~/features/drag-drop/dragModel';
import { CardFace } from './CardFace';
import { DraggableCard } from './DraggableCard';

/**
 * The Market row, plus the two piles whose sizes the endgame hangs on — an empty
 * Deck is one of the two triggers, so the counter is not decoration.
 *
 * Buying is one click. `ShoppingAutomata` no longer holds a slot between two
 * steps; `BROWSING -> PURCHASED` fires on the same `CHOOSE_SLOT` event,
 * regardless of whether the gesture was a click or a drag, and the coins leave
 * the purse on that single event. The allowance (1d4/1d6/1d20) is still
 * enforced by the model — `canBuy` is what the page uses to gate the slot.
 */
export function Market(props: {
	match: GameModel;
	viewerId: PlayerId | null;
	canBuy: boolean;
	onBuy: (slotIndex: number) => void;
}) {
	const { match, viewerId, canBuy, onBuy } = props;
	const coins = viewerId ? (match.players[viewerId]?.coins ?? 0) : 0;

	return (
		<div className="panel">
			<div className="row" style={{ justifyContent: 'space-between' }}>
				<h4 className="section-title">Market</h4>
				<div className="row">
					<small className="muted">Deck {match.deck.length}</small>
					<small className="muted">Discard {match.discard.length}</small>
				</div>
			</div>

			<div className="market">
				{Array.from({ length: MARKET_SIZE }, (_, slotIndex) => {
					const cardId = match.market[slotIndex] ?? null;
					if (!cardId) {
						return (
							<div key={slotIndex} className="market-slot empty">
								<small className="muted">empty</small>
							</div>
						);
					}

					const definition = definitionOf(match, cardId);
					const price = marketPriceOf(definition);
					const affordable = price !== null && price <= coins;
					const takeable = canBuy && affordable;
					const face = {
						cardId,
						definition,
						value: valueOf(match, cardId),
						footer: price === null ? '—' : `${price} coin(s)`,
						selected: false,
						disabled: !takeable,
						onClick: takeable ? () => onBuy(slotIndex) : undefined,
					};

					return (
						<div key={slotIndex} className="market-slot">
							{takeable ? (
								<DraggableCard
									{...face}
									dragId={`market:${slotIndex}`}
									dragType={DRAG_TYPES.marketCard}
									dragData={{ slotIndex }}
								/>
							) : (
								<CardFace {...face} />
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
