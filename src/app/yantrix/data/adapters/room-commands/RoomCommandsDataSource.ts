import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { AbstractWindowDataSource, type FollowUp } from '../../shared/AbstractWindowDataSource';

/** Every branch is a value, never a rejection, so there is always something to publish. */
export type RoomCommandsOutput =
	| { kind: 'room_created'; playerId: string; lobbyId: string }
	| { kind: 'room_connected'; lobbyId: string }
	| { kind: 'connect_failed'; error: string };

/**
 * One follow-up per outcome, keyed by kind. Typed against the union so a new
 * outcome cannot be added without giving it an event.
 */
const FOLLOW_UP_BY_KIND: {
	[K in RoomCommandsOutput['kind']]: (data: Extract<RoomCommandsOutput, { kind: K }>) => FollowUp;
} = {
	room_created: (data) => ({
		event: WindowDomainEvents.lobby_created,
		meta: { playerId: data.playerId, lobbyId: data.lobbyId, gameId: data.lobbyId, isHost: 1 },
	}),
	room_connected: (data) => ({
		event: WindowDomainEvents.room_connected,
		meta: { lobbyId: data.lobbyId, gameId: data.lobbyId },
	}),
	connect_failed: (data) => ({
		event: WindowDomainEvents.room_connect_failed,
		meta: { error: data.error },
	}),
};

/**
 * Indexing the map with a union widens each handler's parameter to the
 * intersection of all variants, which TypeScript reduces to `never`. The lookup
 * is correct by construction — the key comes from the value being passed — so
 * the narrowing happens here, once.
 */
function toFollowUp(data: RoomCommandsOutput): FollowUp {
	const handler = FOLLOW_UP_BY_KIND[data.kind] as (value: RoomCommandsOutput) => FollowUp;
	return handler(data);
}

/**
 * Turns the outcome of hosting or joining into the event that moves the mode FSM
 * out of `CONNECTING`. A room's code is its lobby id and its game id — with one
 * room per session there is nothing else to identify.
 */
export class RoomCommandsDataSource extends AbstractWindowDataSource<RoomCommandsOutput> {
	constructor(opts: { id?: string } = {}) {
		super({
			id: opts.id ?? `room_commands_src_${uniqId(4)}`,
			responseMapper: (data: RoomCommandsOutput): FollowUp[] => [toFollowUp(data)],
		});
	}

	push(data: RoomCommandsOutput): void {
		this.emit(data);
	}
}
