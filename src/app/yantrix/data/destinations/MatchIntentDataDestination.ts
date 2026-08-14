import { uniqId } from '@yantrix/core';
import { eventDictionary as fertilizingEvents } from '~/shared/lib/fsm/game/FertilizingAutomata';
import { eventDictionary as playEvents } from '~/shared/lib/fsm/game/PlayingCardsAutomata';
import { eventDictionary as shoppingEvents } from '~/shared/lib/fsm/game/ShoppingAutomata';
import { eventDictionary as tradingEvents } from '~/shared/lib/fsm/game/TradingAutomata';
import { eventDictionary as waitingEvents } from '~/shared/lib/fsm/game/WaitingAutomata';
import { eventDictionary as turnLoopEvents } from '~/shared/lib/fsm/game/TurnLoopAutomata';
import { submitMatchIntent } from '~/app/yantrix/matchNet';
import { AbstractWindowDataDestination, type DomainEvent } from '../shared/AbstractWindowDataDestination';
import { buildMatchIntent, type CommitKind, type CommitLog, type MatchIntentPacket } from './matchIntent';

/**
 * Where a finished selection leaves this peer and becomes a move.
 *
 * One destination for all six commits, where there used to be two classes and
 * two pure halves — because the question they were built around is gone. They
 * each asked "did the machine take this click?" by comparing its state against
 * a dictionary, which restated the diagram in TypeScript and got it wrong twice
 * (a second bid slipped through, and so did a buy with nothing picked). Now the
 * machine enters a state that *is* the commit and emits from it, so this class
 * has no idea what a state is.
 */

const KIND_BY_EVENT: Record<number, CommitKind> = {
	[shoppingEvents.shopping_committed]: 'shopping',
	[fertilizingEvents.fertilize_committed]: 'fertilizing',
	[tradingEvents.trade_offer_committed]: 'trade_offer',
	[tradingEvents.trade_accept_committed]: 'trade_accept',
	[waitingEvents.waiting_bid_committed]: 'waiting_bid',
	[playEvents.play_committed]: 'play',
};

export class MatchIntentDataDestination extends AbstractWindowDataDestination<MatchIntentPacket> {
	constructor(opts?: { id?: string }) {
		/**
		 * One journal for the whole destination. A phase ending resets every
		 * machine to IDLE and its `seq` to 0, so the journal is cleared with it —
		 * otherwise the next phase's first commit would look like a re-issue.
		 */
		const log: CommitLog = new Map();

		const select = (event: DomainEvent): MatchIntentPacket | null => {
			if (event.event === null) return null;
			const kind = KIND_BY_EVENT[event.event];
			if (!kind) return null;
			return buildMatchIntent(kind, event.meta, log);
		};

		const forget = (): null => {
			log.clear();
			return null;
		};

		super({
			id: opts?.id ?? `match_intent_${uniqId(4)}`,
			triggers: {
				[shoppingEvents.shopping_committed]: select,
				[fertilizingEvents.fertilize_committed]: select,
				[tradingEvents.trade_offer_committed]: select,
				[tradingEvents.trade_accept_committed]: select,
				[waitingEvents.waiting_bid_committed]: select,
				[playEvents.play_committed]: select,
				[turnLoopEvents.turn_phase_ended]: forget,
				[turnLoopEvents.turn_ended]: forget,
			},
		});
	}

	protected resolve(packet: MatchIntentPacket): null {
		switch (packet.kind) {
			case 'card_bought':
				submitMatchIntent('card_bought', { playerId: packet.playerId, slotIndex: packet.slotIndex });
				return null;
			case 'fertilizer_used':
				submitMatchIntent('fertilizer_used', { playerId: packet.playerId, bedIndex: packet.bedIndex });
				return null;
			case 'trade_offered':
				submitMatchIntent('trade_offered', { playerId: packet.playerId, cardIds: packet.cardIds });
				return null;
			case 'trade_offer_accepted':
				submitMatchIntent('trade_offer_accepted', {
					playerId: packet.playerId,
					bidderId: packet.bidderId,
				});
				return null;
			case 'trade_bid_placed':
				submitMatchIntent('trade_bid_placed', { playerId: packet.playerId, coins: packet.coins });
				return null;
			case 'card_played':
				submitMatchIntent('card_played', {
					playerId: packet.playerId,
					cardId: packet.cardId,
					...(packet.bedIndex === undefined ? {} : { bedIndex: packet.bedIndex }),
					...(packet.target === undefined ? {} : { target: packet.target }),
				});
				return null;
		}
	}
}
