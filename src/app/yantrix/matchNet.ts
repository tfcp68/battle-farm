import type { GameModel } from '~/entities/game';
import type { OpenMatchChannel } from '~/entities/room/MatchChannel';
import type { MatchEventName, MatchIntentEvent } from '~/entities/room/matchProtocol';
import type { RoomService } from '~/entities/room/RoomService';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { GameDomainEvents, type GameEventMeta } from './gameDomainEvents';
import { getAppModelStore } from './gameModel';

/**
 * The match's network seam: one channel per room, and the two ways an event can
 * enter the stream.
 *
 * Everything below routes through the channel when there is one and falls back
 * to a plain local dispatch when there is not — a solo session, a test, or the
 * moments before a room exists all run the same engine against the same model,
 * just without anyone to tell about it.
 */

/** Compile-time proof that every protocol event name has an id in the dictionary. */
const EVENT_IDS: Record<MatchEventName, number> = GameDomainEvents;

let open: OpenMatchChannel | null = null;
let unsubscribeRoom: (() => void) | null = null;

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		open?.channel.close();
		open = null;
		unsubscribeRoom?.();
		unsubscribeRoom = null;
	});
}

/** Puts an accepted event on this peer's bus, where the FSMs and effects meet it. */
function applyLocally(name: MatchEventName, meta: unknown): void {
	emitDomainEvent(EVENT_IDS[name], meta);
}

function adoptModel(match: GameModel): void {
	const store = getAppModelStore();
	store.commit({ ...store.get(), match });
}

function currentMatch(): GameModel | null {
	return getAppModelStore().get().match;
}

/**
 * Opens a match channel for as long as the app is in a room.
 *
 * The channel is tied to the room rather than to the match: a guest that joins
 * mid-game asks for the stream the moment it connects, and by the time the
 * first event is emitted everyone is already listening.
 */
export function startMatchNet(deps: { rooms: RoomService }): () => void {
	unsubscribeRoom?.();

	unsubscribeRoom = deps.rooms.subscribe((state) => {
		if (state && !open) {
			open = deps.rooms.createMatchChannel({
				apply: applyLocally,
				adopt: adoptModel,
				getModel: currentMatch,
			});
			return;
		}
		if (!state && open) {
			open.channel.close();
			open = null;
		}
	});

	return () => {
		unsubscribeRoom?.();
		unsubscribeRoom = null;
		open?.channel.close();
		open = null;
	};
}

/** Whether this peer sequences the match. True with no room at all — nobody to defer to. */
export function isMatchHost(): boolean {
	return !open || open.role === 'host';
}

/**
 * Originates an engine event — the match's own lifecycle, decided by the rules
 * rather than requested by a player.
 *
 * A no-op on a guest, and deliberately so: guests learn the lifecycle from the
 * stream. That is what keeps `MatchSetupDataDestination` and the match driver
 * host-only without either of them knowing it, since both run on every peer.
 */
export function emitMatchEvent(name: MatchEventName, meta: unknown): void {
	if (!open) {
		applyLocally(name, meta);
		return;
	}
	if (open.role === 'host') open.channel.emit(name, meta);
}

/**
 * Asks for a player move. Decided here on the host, sent to the host on a guest.
 *
 * Typed per event, unlike {@link emitMatchEvent}: this is the surface the UI
 * calls, and the payload it builds is the one thing on the intent path nobody
 * else validates before the host's model checks see it.
 *
 * The `playerId` a caller puts in the meta is a courtesy for the no-room case —
 * on a real channel the host overwrites it with the id it proved the sender owns.
 */
export function submitMatchIntent<K extends MatchIntentEvent>(name: K, meta: GameEventMeta[K]): void {
	if (!open) {
		applyLocally(name, meta);
		return;
	}
	open.channel.submit(name, meta);
}
