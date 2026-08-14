import type { TEffectMatrix, TModelEffect } from '~/shared/lib/model';
import { asCardInstanceId, asMatchId, asPlayerId, createMatch, type GameModel, type MatchSeat } from '../model';
import { useFertilizer } from './fertilizing';
import { playCard, type PlayCardIntent } from './playing';
import { buyCard } from './shopping';
import { acceptBid, offerTrade, placeBid } from './trading';
import { advancePhase, endMatch, endTurn, startMatch, startTurn } from './turn';

/**
 * The Effect Matrix of a match: which events move the model, and how.
 *
 * The model is the *only* thing these write, and they write it purely — every
 * entry is `(event, model) => model`. Guards live inside the phase effects and
 * check against the model rather than trusting the event, because on the host
 * these same intents arrive from the network, where nothing guarantees the
 * sender's local machine agreed the move was legal.
 */

/**
 * The application's Data Model. A match is one slice of it, absent until a game
 * starts — `yantrix/docs/concepts/100_architecture.md` composes the model from
 * slices exactly this way.
 */
export interface AppModel {
	match: GameModel | null;
}

export const emptyAppModel = (): AppModel => ({ match: null });

/** Event ids the matrix binds to. Supplied by the app layer, which owns the dictionary. */
export interface MatchEventIds {
	match_created: number;
	match_started: number;
	turn_started: number;
	turn_phase_ended: number;
	turn_ended: number;
	match_ended: number;
	card_bought: number;
	card_played: number;
	fertilizer_used: number;
	trade_offered: number;
	trade_bid_placed: number;
	trade_offer_accepted: number;
}

/**
 * Reads an event's meta as the shape the effect expects.
 *
 * The bus is an internal channel — anything arriving from a peer is validated at
 * the transport boundary (phase 4) before it is ever dispatched. Past that, an
 * effect's own model checks are what stop a malformed intent from doing damage.
 */
const meta = <T>(event: { meta: unknown }): Partial<T> => (event.meta ?? {}) as Partial<T>;

/**
 * Lifts a match effect into the app model: skips when no match is running, and
 * bumps `version` whenever the match actually changed — one place, so a new
 * effect cannot forget to and leave guests holding a snapshot they think is
 * current.
 */
function onMatch(fn: (match: GameModel, event: { meta: unknown }) => GameModel): TModelEffect<AppModel> {
	return (event, model) => {
		if (!model.match) return model;
		const next = fn(model.match, event);
		if (next === model.match) return model;
		return { ...model, match: { ...next, version: next.version + 1 } };
	};
}

/**
 * Deals the match from the event itself, rather than receiving a ready model.
 *
 * Since `createMatch` is a pure function of `(seed, seats)`, every peer that
 * sees this event can build a byte-identical opening position — the setup never
 * has to travel over the wire.
 */
const createMatchEffect: TModelEffect<AppModel> = (event, model) => {
	const { matchId, seed, seats } = meta<{ matchId: string; seed: number; seats: MatchSeat[] }>(event);
	if (!matchId || typeof seed !== 'number' || !Array.isArray(seats)) return model;

	return { ...model, match: createMatch({ matchId: asMatchId(matchId), seed, seats }) };
};

export function createGameEffectMatrix(events: MatchEventIds): TEffectMatrix<AppModel> {
	return {
		[events.match_created]: [createMatchEffect],
		[events.match_started]: [onMatch((match) => startMatch(match))],
		[events.turn_started]: [
			onMatch((match, event) => {
				const { activePlayerId, turnNumber } = meta<{ activePlayerId: string; turnNumber: number }>(event);
				if (!activePlayerId || typeof turnNumber !== 'number') return match;
				return startTurn(match, { activePlayerId: asPlayerId(activePlayerId), turnNumber });
			}),
		],
		[events.turn_phase_ended]: [onMatch((match) => advancePhase(match))],
		[events.turn_ended]: [onMatch((match) => endTurn(match))],
		[events.match_ended]: [onMatch((match) => endMatch(match))],

		[events.card_bought]: [
			onMatch((match, event) => {
				const { playerId, slotIndex } = meta<{ playerId: string; slotIndex: number }>(event);
				if (!playerId || typeof slotIndex !== 'number') return match;
				return buyCard(match, { playerId: asPlayerId(playerId), slotIndex });
			}),
		],
		[events.card_played]: [
			onMatch((match, event) => {
				const intent = meta<PlayCardIntent>(event);
				if (!intent.playerId || !intent.cardId) return match;
				return playCard(match, intent as PlayCardIntent);
			}),
		],
		[events.fertilizer_used]: [
			onMatch((match, event) => {
				const { playerId, bedIndex } = meta<{ playerId: string; bedIndex: number }>(event);
				if (!playerId || typeof bedIndex !== 'number') return match;
				return useFertilizer(match, { playerId: asPlayerId(playerId), bedIndex });
			}),
		],
		[events.trade_offered]: [
			onMatch((match, event) => {
				const { playerId, cardIds } = meta<{ playerId: string; cardIds: string[] }>(event);
				if (!playerId || !Array.isArray(cardIds)) return match;
				return offerTrade(match, { playerId: asPlayerId(playerId), cardIds: cardIds.map(asCardInstanceId) });
			}),
		],
		[events.trade_bid_placed]: [
			onMatch((match, event) => {
				const { playerId, coins } = meta<{ playerId: string; coins: number }>(event);
				if (!playerId || typeof coins !== 'number') return match;
				return placeBid(match, { playerId: asPlayerId(playerId), coins });
			}),
		],
		[events.trade_offer_accepted]: [
			onMatch((match, event) => {
				const { playerId, bidderId } = meta<{ playerId: string; bidderId: string }>(event);
				if (!playerId || !bidderId) return match;
				return acceptBid(match, { playerId: asPlayerId(playerId), bidderId: asPlayerId(bidderId) });
			}),
		],
	};
}
