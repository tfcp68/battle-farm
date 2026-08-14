import { definitionOf, type GameModel, marketPriceOf, type PlayerId, type TurnPhase } from '~/entities/game';
import type { MatchUiEventName, RipeCropFact } from '~/app/yantrix/matchUiEvents';

/**
 * The pure half of `PhaseFactsDataDestination`, split off so it can be tested:
 * the destination class pulls in the UI bridge, whose HMR guard
 * (`import.meta`) the CJS test build refuses to compile.
 *
 * A phase machine cannot decide when its phase begins — but `TurnLoopAutomata`
 * already walks HARVEST → SHOPPING → TRADE → PLAYING → FERTILIZE and only opens
 * them when the turn is this peer's. So the boundary is a transition, announced
 * by the diagram, and all that is left here is *reading the facts its guard
 * needs off the model*: how many coins, which crops are ripe, what is in hand.
 *
 * This replaces `phaseSelection.ts`'s edge detector — an array of booleans
 * diffed on every model commit — with a lookup.
 */

export interface PhaseFactsPacket {
	/** The `*_phase_started` event the phase machine subscribes to. */
	open: MatchUiEventName;
	meta: Record<string, unknown>;
	/**
	 * `${turnNumber}:${phase}` — one phase of one turn opens once. Trap 7: the
	 * emitter re-fires on every accepted dispatch while the turn machine rests
	 * in that state, and re-announcing an open phase would reset a selection the
	 * player is halfway through.
	 */
	window: string;
}

/** Crops the viewer has growing, as the harvest and fertilize guards read them. */
function cropsOfViewer(match: GameModel, viewerId: PlayerId): RipeCropFact[] {
	const beds = match.players[viewerId]?.beds ?? [];
	return beds.flatMap((bed, bedIndex) => (bed.crop ? [{ bedIndex, reapTimer: bed.crop.reapTimer }] : []));
}

/**
 * Prices the purse is actually weighed against: empty slots and Class Cards
 * have none, and `hasCoinsForTrade` refuses to open the phase on an empty list.
 */
function marketPricesOf(match: GameModel): number[] {
	return match.market.flatMap((cardId) => {
		if (!cardId) return [];
		const price = marketPriceOf(definitionOf(match, cardId));
		return price === null ? [] : [price];
	});
}

export function buildPhaseFacts(
	phase: TurnPhase,
	match: GameModel | null,
	viewerId: PlayerId | null,
): PhaseFactsPacket | null {
	if (!match || !viewerId) return null;

	const window = `${match.turn.number}:${phase}`;
	const player = match.players[viewerId];

	switch (phase) {
		case 'HARVEST':
			return {
				open: 'harvest_phase_started',
				meta: { viewerId, crops: cropsOfViewer(match, viewerId) },
				window,
			};
		case 'SHOPPING':
			return {
				open: 'shopping_phase_started',
				meta: { viewerId, coins: player?.coins ?? 0, marketPrices: marketPricesOf(match) },
				window,
			};
		case 'TRADE':
			return {
				open: 'trade_phase_started',
				meta: { viewerId, hand: [...(player?.hand ?? [])] },
				window,
			};
		case 'PLAYING':
			return {
				open: 'play_phase_started',
				meta: { viewerId, hand: [...(player?.hand ?? [])] },
				window,
			};
		case 'FERTILIZE':
			return {
				open: 'fertilize_phase_started',
				meta: { viewerId, fertilizers: player?.fertilizers ?? 0, crops: cropsOfViewer(match, viewerId) },
				window,
			};
		// WAITING and CALCULATION have no machine of their own: nothing is picked
		// before the turn opens or while the host tallies it.
		case 'WAITING':
		case 'CALCULATION':
			return null;
	}
}
