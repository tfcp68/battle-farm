import { z } from 'zod';

/**
 * The match layer of the room protocol.
 *
 * The design is a replicated deterministic simulation with the host as
 * sequencer: every peer dealt the same match from the same seed (phase 3), so
 * what travels is not state but the **ordered stream of accepted events**. The
 * host is the authority in the sense that all intents pass through it, it
 * validates them against its model, and its bus order — stamped with `seq` —
 * is the canonical order everyone replays.
 *
 * Message types ride the existing `RoomMessage {v:1}` envelope; both room
 * halves ignore unknown types, so the lobby layer is untouched.
 */

export const MatchMessageType = {
	/** Guest → host: "I want to do this". The host validates and orders it. */
	intent: 'match_intent',
	/** Host → everyone: one accepted event of the canonical stream. */
	event: 'match_event',
	/** Guest → host: "my stream ends at `have`, send me the state". */
	sync: 'match_sync',
	/** Host → one peer: the full model at `seq`, for late joins and gap recovery. */
	state: 'match_state',
} as const;

/**
 * Events only the host may originate — the engine's lifecycle. A guest trying
 * to send one as an intent is dropped at the boundary.
 */
export const MATCH_ENGINE_EVENTS = [
	'match_created',
	'match_started',
	'turn_started',
	'turn_ended',
	'match_ended',
] as const;

/**
 * Events a player may ask for. `turn_phase_ended` is the active player saying
 * "done with this phase" — the only lifecycle event a player controls.
 */
export const MATCH_INTENT_EVENTS = [
	'turn_phase_ended',
	'card_bought',
	'card_played',
	'fertilizer_used',
	'trade_offered',
	'trade_bid_placed',
	'trade_offer_accepted',
] as const;

export type MatchEngineEvent = (typeof MATCH_ENGINE_EVENTS)[number];
export type MatchIntentEvent = (typeof MATCH_INTENT_EVENTS)[number];
export type MatchEventName = MatchEngineEvent | MatchIntentEvent;

/**
 * Who may originate each intent, relative to whose turn it is.
 *
 * The Effect Matrix re-checks every intent against the model anyway, so this is
 * not the last line of defence — it is the cheap first one, and the only place
 * that states the asymmetry plainly: everything happens on the active player's
 * turn except bidding, which is exactly the opponents answering an offer.
 */
export const INTENT_SENDER = {
	turn_phase_ended: 'active',
	card_bought: 'active',
	card_played: 'active',
	fertilizer_used: 'active',
	trade_offered: 'active',
	trade_bid_placed: 'opponent',
	trade_offer_accepted: 'active',
} as const satisfies Record<MatchIntentEvent, 'active' | 'opponent'>;

const MatchEventNameSchema = z.enum([...MATCH_ENGINE_EVENTS, ...MATCH_INTENT_EVENTS]);

/**
 * Meta stays `unknown` past the envelope on purpose: the Effect Matrix already
 * treats every meta as untrusted and refuses what the model disallows, and that
 * validation must hold anyway for events the host itself emits.
 */
export const MatchIntentMessageSchema = z.object({
	playerId: z.string().min(1),
	name: z.enum(MATCH_INTENT_EVENTS),
	meta: z.unknown(),
});

export const MatchEventMessageSchema = z.object({
	seq: z.number().int().min(1),
	name: MatchEventNameSchema,
	meta: z.unknown(),
});

export const MatchSyncMessageSchema = z.object({
	have: z.number().int().min(0),
});

export const MatchStateMessageSchema = z.object({
	seq: z.number().int().min(0),
	/** Validated separately with `parseGameModel` — `null` while no match runs. */
	model: z.unknown(),
});

export type MatchIntentMessage = z.infer<typeof MatchIntentMessageSchema>;
export type MatchEventMessage = z.infer<typeof MatchEventMessageSchema>;
export type MatchSyncMessage = z.infer<typeof MatchSyncMessageSchema>;
export type MatchStateMessage = z.infer<typeof MatchStateMessageSchema>;

export function parseMatchIntent(value: unknown): MatchIntentMessage | null {
	const result = MatchIntentMessageSchema.safeParse(value);
	return result.success ? result.data : null;
}

export function parseMatchEvent(value: unknown): MatchEventMessage | null {
	const result = MatchEventMessageSchema.safeParse(value);
	return result.success ? result.data : null;
}

export function parseMatchSync(value: unknown): MatchSyncMessage | null {
	const result = MatchSyncMessageSchema.safeParse(value);
	return result.success ? result.data : null;
}

export function parseMatchState(value: unknown): MatchStateMessage | null {
	const result = MatchStateMessageSchema.safeParse(value);
	return result.success ? result.data : null;
}
