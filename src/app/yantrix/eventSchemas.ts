import { z } from 'zod';

/**
 * Domain events carry a small `meta` payload that originates from `emitDomainEvent`
 * calls and from cache-driven sources. Rather than re-deriving fields with ad-hoc
 * `isRecord`/`getString` pokes in every destination, we validate once with this
 * schema and hand destinations a typed, narrowed object.
 *
 * Every field is optional: a single event never carries all of them, and handlers
 * stay in control of their own required-field checks (e.g. `auth_requested` still
 * emits `auth_failed` on missing credentials instead of being silently skipped).
 */
export const EventMetaSchema = z.object({
	playerId: z.string().optional(),
	lobbyId: z.string().optional(),
	gameId: z.string().nullable().optional(),
	requestId: z.string().optional(),
	isHost: z.union([z.literal(0), z.literal(1)]).optional(),
	mode: z.enum(['signIn', 'signUp']).optional(),
	nickname: z.string().optional(),
	password: z.string().optional(),
	error: z.string().optional(),
	reason: z.string().optional(),
});

export type EventMeta = z.infer<typeof EventMetaSchema>;

/** Parse event meta, falling back to an empty object on malformed input. */
export function parseEventMeta(meta: unknown): EventMeta {
	const result = EventMetaSchema.safeParse(meta ?? {});
	return result.success ? result.data : {};
}
