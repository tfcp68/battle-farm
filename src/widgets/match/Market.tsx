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
 * Buying takes two clicks. `ShoppingAutomata` holds the slot between them, so
 * `pendingSlot` is read off the machine rather than kept here: a phase that ends
 * mid-decision takes the pending slot with it, without this widget knowing.
 *
 * Dragging a card to the hand replaces the *first* of those two clicks, not
 * both: the confirm bar still appears, because coins must not leave on a single
 * gesture.
 */
export function Market(props: {
	match: GameModel;
	viewerId: PlayerId | null;
	canBuy: boolean;
	/** The slot waiting for a confirmation, or `null` while browsing. */
	pendingSlot?: number | null;
	onBuy: (slotIndex: number) => void;
	onConfirm?: () => void;
	onCancel?: () => void;
}) {
	const { match, viewerId, canBuy, pendingSlot = null, onBuy, onConfirm, onCancel } = props;
	const coins = viewerId ? (match.players[viewerId]?.coins ?? 0) : 0;
	const pendingCardId = pendingSlot === null ? null : (match.market[pendingSlot] ?? null);

	return (
		<div className="panel">
			<div className="row" style={{ justifyContent: 'space-between' }}>
				<h4 className="section-title">Market</h4>
				<div className="row">
					<small className="muted">Deck {match.deck.length}</small>
					<small className="muted">Discard {match.discard.length}</small>
				</div>
			</div>

			{pendingCardId ? (
				<div className="row">
					<small className="muted">
						Buy {definitionOf(match, pendingCardId).name} for{' '}
						{marketPriceOf(definitionOf(match, pendingCardId)) ?? '—'} coin(s)?
					</small>
					<button type="button" className="primary" data-testid="confirm-buy" onClick={onConfirm}>
						Buy
					</button>
					<button type="button" onClick={onCancel}>
						Cancel
					</button>
				</div>
			) : null}

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
						selected: slotIndex === pendingSlot,
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
