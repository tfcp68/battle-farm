import { eventDictionary as harvestEvents } from '~/shared/lib/fsm/game/HarvestAutomata';
import { eventDictionary as shoppingEvents } from '~/shared/lib/fsm/game/ShoppingAutomata';
import { eventDictionary as tradingEvents } from '~/shared/lib/fsm/game/TradingAutomata';
import { eventDictionary as playEvents } from '~/shared/lib/fsm/game/PlayingCardsAutomata';
import { eventDictionary as fertilizingEvents } from '~/shared/lib/fsm/game/FertilizingAutomata';
import { eventDictionary as waitingEvents } from '~/shared/lib/fsm/game/WaitingAutomata';
import { eventDictionary as turnLoopEvents } from '~/shared/lib/fsm/game/TurnLoopAutomata';
import type {
	CardDefinition,
	CardInstanceId,
	EffectTarget,
	PlayerId,
	SelectionKind,
	TargetKind,
} from '~/entities/game';

/**
 * The match's *local* vocabulary — one player making up their mind.
 *
 * Unlike `gameDomainEvents.ts`, none of these cross the wire: a half-picked
 * card, a bed being weighed up, a bid being typed are nobody else's business,
 * and the table only ever learns the outcome (`card_bought`, `card_played`,
 * `trade_offered`, …), submitted by a destination once the phase machine agrees
 * the choice is complete.
 *
 * Six automata read these — one per turn phase, plus `TargetModeAutomata`. They
 * never talk to each other: several subscribe to the same event with different
 * actions, which is what spares the set a cross-machine `emit/` (the bypass loop
 * would swallow it anyway). `selection_cancelled` is deliberately shared — only
 * one phase machine is ever open, and the rest have no CANCEL edge to take.
 *
 * Ids are minted by whichever diagram declares the name first and resolve to the
 * same number everywhere, because Yantrix keys its event dictionary by name.
 */
export const MatchUiEvents = {
	// Phase boundaries. The openings are emitted by `TurnLoopAutomata` as it walks
	// the turn; `PhaseFactsDataDestination` turns each into the matching
	// `*_phase_started` with the facts read off the model. There is no
	// `*_phase_ended` per phase any more — one phase ending *is* the next one
	// starting, so every machine closes on `turn_phase_ended`.
	harvest_phase_opened: turnLoopEvents.harvest_phase_opened,
	shopping_phase_opened: turnLoopEvents.shopping_phase_opened,
	trade_phase_opened: turnLoopEvents.trade_phase_opened,
	play_phase_opened: turnLoopEvents.play_phase_opened,
	fertilize_phase_opened: turnLoopEvents.fertilize_phase_opened,

	// HARVEST — nothing to click; the machine only says whether anything ripened.
	harvest_phase_started: harvestEvents.harvest_phase_started,

	// SHOPPING — one step: picking a slot spends the coins.
	shopping_phase_started: shoppingEvents.shopping_phase_started,
	market_slot_picked: shoppingEvents.market_slot_picked,

	// TRADE, seller's half — every card added *is* the offer, then take a bid.
	trade_phase_started: tradingEvents.trade_phase_started,
	trade_card_added: tradingEvents.trade_card_added,
	trade_card_removed: tradingEvents.trade_card_removed,
	trade_bids_gathered: tradingEvents.trade_bids_gathered,
	trade_bid_accepted: tradingEvents.trade_bid_accepted,

	// TRADE, everyone else's half — the one flow a player runs off turn.
	trade_offer_appeared: waitingEvents.trade_offer_appeared,
	waiting_bid_placed: waitingEvents.waiting_bid_placed,
	trade_offer_closed: waitingEvents.trade_offer_closed,

	// PLAYING — card, then bed and/or target, in as many steps as the card takes.
	play_phase_started: playEvents.play_phase_started,
	play_card_picked: playEvents.play_card_picked,
	play_bed_picked: playEvents.play_bed_picked,
	play_target_picked: playEvents.play_target_picked,

	// FERTILIZE — one step: picking a crop spends the fertilizer.
	fertilize_phase_started: fertilizingEvents.fertilize_phase_started,
	fertilize_crop_picked: fertilizingEvents.fertilize_crop_picked,

	/** Shared: back out of whatever is half-picked, in whichever phase is open. */
	selection_cancelled: playEvents.selection_cancelled,
} as const;

export type MatchUiEventName = keyof typeof MatchUiEvents;

/** A crop as the harvest guard reads it — `hasRipeCrops` only looks at the timer. */
export interface RipeCropFact {
	bedIndex: number;
	reapTimer: number;
}

/**
 * Payload contracts.
 *
 * The picking events carry the whole fact the intent will need, even where the
 * machine also holds it: a destination composes from the meta alone, so a
 * context that a later transition has already moved on from can never end up in
 * a move.
 */
export interface MatchUiEventMeta {
	/** Phase boundaries, straight off the turn machine's context. */
	harvest_phase_opened: { activePlayerId: PlayerId; turnNumber: number };
	shopping_phase_opened: { activePlayerId: PlayerId; turnNumber: number };
	trade_phase_opened: { activePlayerId: PlayerId; turnNumber: number };
	play_phase_opened: { activePlayerId: PlayerId; turnNumber: number };
	fertilize_phase_opened: { activePlayerId: PlayerId; turnNumber: number };

	/**
	 * `viewerId` rides along on every phase opening so the machine can keep it in
	 * context: a commit emitted later has to name the player it belongs to, and
	 * by then the destination has no safe way to ask.
	 */
	harvest_phase_started: { viewerId: PlayerId; crops: RipeCropFact[] };

	/** `marketPrices` is what `hasCoinsForTrade` weighs the purse against. */
	shopping_phase_started: { viewerId: PlayerId; coins: number; marketPrices: number[] };
	market_slot_picked: { slotIndex: number };

	trade_phase_started: { viewerId: PlayerId; hand: CardInstanceId[] };
	trade_card_added: { cardId: CardInstanceId };
	trade_card_removed: { cardId: CardInstanceId };
	/** The first bid landed — the seller has something to choose between. */
	trade_bids_gathered: { bids: Record<PlayerId, number> };
	trade_bid_accepted: { bidderId: PlayerId };

	trade_offer_appeared: { coins: number };
	waiting_bid_placed: { coins: number };
	trade_offer_closed: null;

	play_phase_started: { viewerId: PlayerId; hand: CardInstanceId[] };
	/** `cardKind` is the discriminant the machine branches on; the rest of the card is in the model. */
	play_card_picked: { cardId: CardInstanceId; cardKind: CardDefinition['kind']; targetKind: SelectionKind };
	play_bed_picked: { cardId: CardInstanceId; bedIndex: number; targetKind: TargetKind };
	play_target_picked: { cardId: CardInstanceId; bedIndex?: number; target: EffectTarget };

	fertilize_phase_started: { viewerId: PlayerId; fertilizers: number; crops: RipeCropFact[] };
	fertilize_crop_picked: { bedIndex: number };

	selection_cancelled: null;
}
