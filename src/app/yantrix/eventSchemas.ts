import { z } from 'zod';

/** Schema for event metadata, which may be included with any event.
 * 	Note that all fields are optional, as the included metadata will vary widely
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
