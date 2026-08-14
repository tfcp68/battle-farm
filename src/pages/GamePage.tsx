import { useMemo } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { type CardInstanceId, type EffectTarget, type GameModel, plantableBeds } from '~/entities/game';
import { useMatch, useViewerId } from '~/app/yantrix/useGameModel';
import { useAdvancePhase } from '~/features/advance-phase/useAdvancePhase';
import { useCardDragDrop } from '~/features/drag-drop/useCardDragDrop';
import { useBuyCard } from '~/features/buy-card/useBuyCard';
import { useCardSelection } from '~/features/play-card/useCardSelection';
import { useFertilizeCrop } from '~/features/fertilize-crop/useFertilizeCrop';
import { useTradeCards } from '~/features/trade-cards/useTradeCards';
import { DeckZone } from '~/widgets/match/DeckZone';
import { useZoneTransition } from '~/widgets/match/useZoneTransition';
import { GardenBeds } from '~/widgets/match/GardenBeds';
import { Hand } from '~/widgets/match/Hand';
import { Market } from '~/widgets/match/Market';
import { PlayersPanel } from '~/widgets/match/PlayersPanel';
import { TargetOverlay } from '~/widgets/match/TargetOverlay';
import { TradePanel } from '~/widgets/match/TradePanel';
import { TurnBar } from '~/widgets/match/TurnBar';

/**
 * The match screen.
 *
 * Nothing the table agrees on is stored here: the board comes from the model,
 * the play-phase selection comes from `PlayingCardsAutomata` and
 * `TargetModeAutomata` (through `useCardSelection`), and every move leaves
 * through an intent. That split is what lets the same page render a host and a
 * guest with no branch anywhere.
 *
 * The one piece of component state left is `offered` — the TRADE phase has no
 * machine of its own yet (`trading.mermaid` is still unwired).
 */

const HINTS: Partial<Record<GameModel['turn']['phase'], string>> = {
	HARVEST: 'Ripe crops were collected automatically.',
	SHOPPING: 'Buy up to your roll, if you can pay.',
	TRADE: 'Offer a set of cards; opponents bid for all of it.',
	PLAYING: 'Play any number of cards: crops into beds, actions for fertilizers.',
	FERTILIZE: 'Each fertilizer takes a turn off one of your crops.',
};

export default function GamePage() {
	const match = useMatch();
	const viewerId = useViewerId();

	// Cards travel between zones on the model diff, never on the click: a guest
	// sees the host's move as a snapshot commit with no local interaction.
	useZoneTransition(match?.version ?? null);

	const { endPhase } = useAdvancePhase();
	const shopping = useBuyCard();
	const fertilizing = useFertilizeCrop();
	const trade = useTradeCards();
	const selection = useCardSelection();
	// A drop is the same move as a click; this only translates the gesture.
	const { onDragEnd } = useCardDragDrop();

	const plantable = useMemo(
		() => (match && viewerId ? plantableBeds(match, viewerId) : []),
		[match, viewerId],
	);

	if (!match) {
		return (
			<div className="panel">
				<h3 className="section-title">No match running</h3>
				<small className="muted">Waiting for the host to deal.</small>
			</div>
		);
	}

	const phase = match.turn.phase;
	const allowance = match.turn.allowance ?? 0;

	function pickHandCard(cardId: CardInstanceId): void {
		if (!match || !viewerId) return;

		// Which machine hears the click is the only thing the page decides; what
		// each of them makes of it is the diagram's business.
		if (trade.sellerState === 'COLLECT') {
			trade.toggleCard(cardId);
			return;
		}
		// Whether this card is planted, targeted or played on the spot is the
		// play machine's branch (`isCropCard` / `needsTarget`).
		if (selection.step === 'choosing' || selection.step === 'planting') selection.pickCard(cardId);
	}

	function pickBed(bedIndex: number): void {
		if (!match || !viewerId) return;

		if (fertilizing.state === 'CROP_SELECTION' || fertilizing.state === 'FERTILIZED') {
			fertilizing.pickCrop(bedIndex);
			return;
		}
		if (selection.step !== 'planting') return;

		selection.pickBed(bedIndex);
	}

	function isBedSelectable(bedIndex: number): boolean {
		if (!match || !viewerId) return false;
		// FERTILIZE: the machine is only open while a fertilizer and a crop exist,
		// so the allowance is all that is left to check here.
		if ((fertilizing.state === 'CROP_SELECTION' || fertilizing.state === 'FERTILIZED') && allowance > 0) {
			return !!match.players[viewerId]?.beds[bedIndex]?.crop;
		}
		return selection.step === 'planting' && plantable.includes(bedIndex);
	}

	function isHandCardSelectable(): boolean {
		if (trade.sellerState === 'COLLECT') return true;
		return selection.step === 'choosing' || selection.step === 'planting';
	}

	/**
	 * A bed accepts a dragged card whenever the play phase is open and the bed
	 * could hold a crop — the drag carries the card, so there is nothing to pick
	 * first. Fertilizing has no drag: it spends a resource, not a card.
	 */
	function canDropOnBed(bedIndex: number): boolean {
		if (!viewerId) return false;
		const playing = selection.step === 'choosing' || selection.step === 'planting';
		return playing && plantable.includes(bedIndex);
	}

	const opponents = match.order.filter((playerId) => playerId !== viewerId);

	return (
		<DragDropProvider onDragEnd={onDragEnd}>
			<div className="grid">
				<TurnBar match={match} viewerId={viewerId} onEndPhase={endPhase} />

				<Market
					match={match}
					viewerId={viewerId}
					canBuy={(shopping.state === 'BROWSING' || shopping.state === 'PURCHASED') && allowance > 0}
					onBuy={shopping.pickSlot}
				/>

				{phase === 'TRADE' ? (
					<TradePanel
						match={match}
						viewerId={viewerId}
						selected={trade.offered}
						sellerState={trade.sellerState}
						bidderState={trade.bidderState}
						onOffer={trade.sendOffer}
						onBid={trade.placeBid}
						onAccept={trade.acceptBid}
					/>
				) : null}

				{viewerId ? (
					<>
						<GardenBeds
							match={match}
							playerId={viewerId}
							title="Your beds"
							selectable={isBedSelectable}
							onSelect={pickBed}
							canDrop={canDropOnBed}
						/>
						<Hand
							match={match}
							playerId={viewerId}
							// Whichever machine is open owns the highlight. Keyed on the
							// machine rather than on the phase: the play machine keeps its
							// last card in context long after the phase that picked it.
							selected={
								trade.sellerState === 'COLLECT'
									? trade.offered
									: selection.cardId
										? [selection.cardId]
										: []
							}
							selectable={isHandCardSelectable}
							onSelect={pickHandCard}
							hint={selection.step === 'planting' ? 'Now pick a bed.' : HINTS[phase]}
							// Dropping a Market card here picks its slot; the confirm
							// bar still has to be pressed before any coins move.
							droppable={shopping.state === 'BROWSING' || shopping.state === 'PURCHASED'}
						/>
					</>
				) : (
					<div className="panel">
						<small className="muted">No profile — this browser is only watching.</small>
					</div>
				)}

				<DeckZone match={match} droppable={selection.step === 'choosing'} />

				<PlayersPanel match={match} viewerId={viewerId} />

				{opponents.map((playerId) => (
					<GardenBeds key={playerId} match={match} playerId={playerId} />
				))}

				{selection.step === 'targeting' && selection.kind && selection.kind !== 'bed_empty' && viewerId ? (
					<TargetOverlay
						match={match}
						viewerId={viewerId}
						kind={selection.kind}
						cardName={selection.cardName ?? 'This card'}
						onPick={(target: EffectTarget) => selection.pickTarget(target)}
						onCancel={selection.cancel}
					/>
				) : null}
			</div>
		</DragDropProvider>
	);
}
