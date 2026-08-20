import { useState } from 'react';
import {
	type CardInstanceId,
	definitionOf,
	type GameModel,
	type PlayerId,
	valueOf,
} from '~/entities/game';
import type { TradingStateName, WaitingStateName } from '~/shared/lib/fsm/selectors';
import { DRAG_TYPES } from '~/features/drag-drop/dragModel';
import { CardFace } from './CardFace';
import { DropTarget } from './DropTarget';

/**
 * TRADE — the one phase where a player who is not on turn acts.
 *
 * The seller offers an indivisible set, everyone else bids coins for the whole
 * of it, and the seller may take one bid. Which half of the panel a peer sees
 * follows from the model, never from a local flag: the seller is whoever the
 * open offer says it is.
 *
 * The two steps come from two machines — `TradingAutomata` for the seller,
 * `WaitingAutomata` for everyone else — so "may I still bid?" is answered by a
 * state instead of by re-deriving the rules here. The typed bid stays local: it
 * is not a decision until Bid is pressed.
 *
 * **The seller's half has no button.** Dropping a card here offers it, and
 * dropping another offers both — `trading.mermaid` runs `CARD_ADDED` straight
 * into `OFFERED`, so what is on the table is always what has been dropped. That
 * is why the drop zone stays mounted once an offer exists: it is not a
 * "compose" step that closes, it is the offer itself, still open to change
 * until somebody bids.
 */
export function TradePanel(props: {
	match: GameModel;
	viewerId: PlayerId | null;
	/** Hand cards ticked so far, held by the seller machine. */
	selected: readonly CardInstanceId[];
	sellerState: TradingStateName | null;
	bidderState: WaitingStateName | null;
	/** Take a card back off the table. */
	onTakeBack: (cardId: CardInstanceId) => void;
	onBid: (coins: number) => void;
	onAccept: (bidderId: PlayerId) => void;
}) {
	const { match, viewerId, selected, sellerState, bidderState, onTakeBack, onBid, onAccept } = props;
	const [bid, setBid] = useState('0');

	const trade = match.turn.trade;
	const isSeller = !!viewerId && match.turn.activePlayerId === viewerId;
	const coins = viewerId ? (match.players[viewerId]?.coins ?? 0) : 0;
	// The cards to show: the model's offer once it exists, and the seller's own
	// picks in the moment before the commit has come back round the loop.
	const onTable = trade?.cardIds ?? (isSeller ? selected : []);
	// Sealed the moment a bid lands — that is `CHOOSING`, not `OFFERED`.
	const canStillChange = sellerState === 'COLLECT' || sellerState === 'OFFERED';

	return (
		<div className="panel">
			<h4 className="section-title">Trade</h4>

			{!trade && !isSeller ? (
				<small className="muted">Waiting for an offer.</small>
			) : (
				<>
					{isSeller ? (
						<DropTarget
							zone={{ kind: 'trade' }}
							accept={DRAG_TYPES.handCard}
							disabled={!canStillChange}
							className="hand trade-drop">
							{onTable.map((cardId) => (
								<CardFace
									key={cardId}
									cardId={cardId}
									definition={definitionOf(match, cardId)}
									value={valueOf(match, cardId)}
									// Clicking a card on the table takes it back — the only way
									// out, since it is no longer drawn in the hand.
									onClick={canStillChange ? () => onTakeBack(cardId) : undefined}
									footer={canStillChange ? 'Click to take back' : undefined}
								/>
							))}
							{onTable.length === 0 ? (
								<small className="muted">
									Drag cards here — or pick them in your hand. Whatever lands here is on
									offer; no partial deals.
								</small>
							) : null}
						</DropTarget>
					) : (
						<div className="hand">
							{onTable.map((cardId) => (
								<CardFace
									key={cardId}
									cardId={cardId}
									definition={definitionOf(match, cardId)}
									value={valueOf(match, cardId)}
								/>
							))}
						</div>
					)}

					{isSeller ? (
						<table className="table">
							<thead>
								<tr>
									<th>Bidder</th>
									<th>Coins</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{Object.entries(trade?.bids ?? {}).map(([bidderId, offered]) => (
									<tr key={bidderId}>
										<td>{match.players[bidderId as PlayerId]?.nickname ?? bidderId}</td>
										<td>{offered}</td>
										<td>
											<button
												type="button"
												className="ok"
												onClick={() => onAccept(bidderId as PlayerId)}>
												Accept
											</button>
										</td>
									</tr>
								))}
								{Object.keys(trade?.bids ?? {}).length === 0 ? (
									<tr>
										<td colSpan={3}>
											<small className="muted">
												{onTable.length === 0 ? 'Nothing on offer yet.' : 'No bids yet.'}
											</small>
										</td>
									</tr>
								) : null}
							</tbody>
						</table>
					) : (
						<div className="row">
							<label className="field">
								<span className="field-label">Your bid (you hold {coins})</span>
								<input
									className="field-input"
									type="number"
									min={0}
									max={coins}
									value={bid}
									onChange={(event) => setBid(event.target.value)}
								/>
							</label>
							<button
								type="button"
								className="primary"
								data-testid="place-bid"
								onClick={() => onBid(Number(bid))}
								disabled={bidderState !== 'HAS_TRADE' || Number(bid) < 0 || Number(bid) > coins}>
								{bidderState === 'BID_SENT' ? 'Bid placed' : 'Bid'}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
