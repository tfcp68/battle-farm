import type { CardInstanceId, EffectTarget, PlayerId } from '~/entities/game';

/**
 * The pure half of `MatchIntentDataDestination`, split off so it can be tested:
 * the destination class pulls in the match transport, whose HMR guard
 * (`import.meta`) the CJS test build refuses to compile.
 *
 * Nothing here asks "did the machine take this?" any more. The machine says so
 * itself, by entering a state that means *committed* and emitting from it —
 * which is why this file imports no `statesDictionary` at all. What is left is
 * two jobs the diagram cannot do: turning a context shape into the wire shape
 * (the offered set is a map in the machine and an array on the wire), and
 * throwing away re-issues.
 *
 * The re-issues are not a wart, they are trap 7: an emitter fires on every
 * accepted dispatch while its state rests, including actions with no edge out.
 * `seq` separates them exactly, because a state's reducer does not run on a
 * dead dispatch — so a repeated emission carries a `seq` already seen.
 */

export type CommitKind = 'shopping' | 'fertilizing' | 'trade_offer' | 'trade_accept' | 'waiting_bid' | 'play';

export type MatchIntentPacket =
	| { kind: 'card_bought'; playerId: PlayerId; slotIndex: number }
	| { kind: 'fertilizer_used'; playerId: PlayerId; bedIndex: number }
	| { kind: 'trade_offered'; playerId: PlayerId; cardIds: CardInstanceId[] }
	| { kind: 'trade_offer_accepted'; playerId: PlayerId; bidderId: PlayerId }
	| { kind: 'trade_bid_placed'; playerId: PlayerId; coins: number }
	| {
			kind: 'card_played';
			playerId: PlayerId;
			cardId: CardInstanceId;
			bedIndex?: number;
			target?: EffectTarget;
	  };

/**
 * Last `seq` shipped per commit kind. Passed in rather than kept in the module
 * so a test can start from a clean journal.
 */
export type CommitLog = Map<CommitKind, number>;

interface CommitMeta {
	viewerId?: PlayerId;
	seq?: number;
	slotIndex?: number;
	bedIndex?: number;
	offered?: Record<string, unknown>;
	bidderId?: PlayerId;
	bid?: number;
	cardId?: CardInstanceId;
	target?: EffectTarget;
}

/** `-1` is every machine's "nothing picked"; it must never reach the table. */
const realIndex = (value: unknown): number | null =>
	typeof value === 'number' && value >= 0 ? value : null;

export function buildMatchIntent(kind: CommitKind, meta: unknown, log: CommitLog): MatchIntentPacket | null {
	const { viewerId, seq, ...fields } = (meta ?? {}) as CommitMeta;
	if (!viewerId || typeof seq !== 'number') return null;

	// Trap 7. `<=` rather than `!==`: a machine reset by a new phase starts its
	// seq over, and the phase change is what clears the journal.
	if (seq <= (log.get(kind) ?? 0)) return null;

	const packet = compose(kind, viewerId, fields);
	if (packet) log.set(kind, seq);
	return packet;
}

/** A fresh journal per turn phase — every machine's `seq` restarts with it. */
export function forgetCommits(log: CommitLog): void {
	log.clear();
}

function compose(kind: CommitKind, playerId: PlayerId, fields: Omit<CommitMeta, 'viewerId' | 'seq'>) {
	switch (kind) {
		case 'shopping': {
			const slotIndex = realIndex(fields.slotIndex);
			return slotIndex === null ? null : ({ kind: 'card_bought', playerId, slotIndex } as const);
		}
		case 'fertilizing': {
			const bedIndex = realIndex(fields.bedIndex);
			return bedIndex === null ? null : ({ kind: 'fertilizer_used', playerId, bedIndex } as const);
		}
		case 'trade_offer': {
			// The set travels as the map the machine keeps: `keys(#offered)` in the
			// emit meta throws (trap 6), so the conversion happens here.
			//
			// An empty set is a real move, not a missing one — it is how a seller
			// takes the last card back off the table, and `offerTrade` reads it as
			// a retraction. `OFFERED` is reachable only through `CARD_ADDED` /
			// `CARD_REMOVED`, so nothing else can produce one.
			const cardIds = Object.keys(fields.offered ?? {}) as CardInstanceId[];
			return { kind: 'trade_offered', playerId, cardIds } as const;
		}
		case 'trade_accept':
			return fields.bidderId
				? ({ kind: 'trade_offer_accepted', playerId, bidderId: fields.bidderId } as const)
				: null;
		case 'waiting_bid':
			return typeof fields.bid === 'number' && fields.bid >= 0
				? ({ kind: 'trade_bid_placed', playerId, coins: fields.bid } as const)
				: null;
		case 'play': {
			if (!fields.cardId) return null;
			const bedIndex = realIndex(fields.bedIndex);
			// `target` defaults to `0` in the machine's context, which is the
			// diagram's way of spelling "absent" — it is not an EffectTarget.
			const target = fields.target && typeof fields.target === 'object' ? fields.target : null;
			return {
				kind: 'card_played',
				playerId,
				cardId: fields.cardId,
				...(bedIndex === null ? {} : { bedIndex }),
				...(target === null ? {} : { target }),
			} as const;
		}
	}
}
