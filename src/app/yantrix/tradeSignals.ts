import type { AppModel, GameModel, PlayerId } from '~/entities/game';
import type { IModelStore } from '~/shared/lib/model';
import type { MatchUiEventMeta, MatchUiEventName } from './matchUiEvents';

/**
 * The two trade cues that are *not* phase boundaries.
 *
 * Five of the seven signals this file used to carry were the phase machines'
 * openings, detected by diffing the model. They are gone: `TurnLoopAutomata`
 * announces its own phases now (`emit/*_phase_opened`) and
 * `PhaseFactsDataDestination` reads the facts. What is left are the two cues
 * that no turn transition produces, because both depend on what *another*
 * player did:
 *
 *   - a bid landing, which is the seller's cue that there is something to
 *     choose between — the offer alone is not a decision;
 *   - an offer appearing, which is the one flow a player runs off turn.
 *
 * A signal is open while its `payload` returns something and shut while it
 * returns `null`, and the watcher emits only on the edges. That framing is what
 * keeps the machines still through the dozens of commits a phase takes.
 *
 * Dependencies come in as arguments to keep this module free of `import.meta`
 * and therefore testable under the CJS test build.
 */

type Payload = Record<string, unknown> | null;

interface TradeSignal<K extends MatchUiEventName = MatchUiEventName> {
	open: K;
	/**
	 * Optional on purpose. `trade_bids_gathered` has no closing event of its own:
	 * the seller leaves CHOOSING on `turn_phase_ended`, which the trading machine
	 * already subscribes to. Naming a second road to the same transition here
	 * would mean two events racing for one edge.
	 */
	close?: MatchUiEventName;
	payload: (match: GameModel, viewerId: PlayerId) => MatchUiEventMeta[K] | null;
}

/** Keeps each signal's payload checked against the event it opens with. */
const signal = <K extends MatchUiEventName>(entry: TradeSignal<K>): TradeSignal => entry as TradeSignal;

const SIGNALS: TradeSignal[] = [
	signal({
		// Opens on the first bid rather than on the offer: a seller with no bids
		// has no decision to make.
		open: 'trade_bids_gathered',
		payload: (match, viewerId) => {
			const trade = match.turn.trade;
			if (!trade || trade.sellerId !== viewerId) return null;
			const bids = Object.keys(trade.bids).length;
			return bids > 0 ? { bids: trade.bids } : null;
		},
	}),
	signal({
		open: 'trade_offer_appeared',
		close: 'trade_offer_closed',
		payload: (match, viewerId) => {
			const trade = match.turn.trade;
			if (!trade || trade.sellerId === viewerId) return null;
			return { coins: match.players[viewerId]?.coins ?? 0 };
		},
	}),
];

export interface TradeSignalsOptions {
	store: IModelStore<AppModel>;
	/** `emitDomainEvent` in production — puts the event on this peer's bus only. */
	emit: (event: MatchUiEventName, meta: Payload) => void;
	/** The local player, or `null` while this browser is only watching. */
	getViewerId: () => PlayerId | null;
}

export function startTradeSignals(opts: TradeSignalsOptions): () => void {
	const open = SIGNALS.map(() => false);

	function check(): void {
		const match = opts.store.get().match;
		const viewerId = opts.getViewerId();

		SIGNALS.forEach((entry, index) => {
			const payload = match && viewerId ? entry.payload(match, viewerId) : null;
			const isOpen = payload !== null;
			if (isOpen === open[index]) return;

			open[index] = isOpen;
			if (isOpen) opts.emit(entry.open, payload);
			else if (entry.close) opts.emit(entry.close, null);
		});
	}

	const unsubscribe = opts.store.subscribe(check);
	check();

	return unsubscribe;
}
