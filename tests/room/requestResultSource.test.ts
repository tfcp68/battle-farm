import { describe, expect, it } from '@jest/globals';
import { FakeSignalHub } from '~/shared/net/FakeRoomTransport';
import { RoomService } from '~/entities/room/RoomService';
import { HostRoom } from '~/entities/room/HostRoom';
import { RoomRequestResultDataSource } from '~/app/yantrix/data/sources/RoomRequestResultDataSource';
import { RoomClosedDataSource } from '~/app/yantrix/data/sources/RoomClosedDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { setCurrentProfile } from '~/entities/profile/currentProfile';
import type { Services } from '~/shared/services/createServices';

const CODE = 'K7QM2X';

/** Host and guest on one in-memory hub, plus the guest's request-result source. */
async function setup() {
	const hub = new FakeSignalHub();

	const hostTransport = hub.createTransport();
	await hostTransport.join(CODE);
	const host = new HostRoom({
		transport: hostTransport,
		code: CODE,
		hostPlayerId: 'host-1',
		hostNickname: 'Host',
	});

	const rooms = new RoomService({ createTransport: () => hub.createTransport() });
	const services = { rooms } as unknown as Services;

	setCurrentProfile({ playerId: 'guest-1', nickname: 'Guest' });
	const source = new RoomRequestResultDataSource({ services });
	source.start();

	return { host, rooms, source };
}

/**
 * Drains the source the way CoreLoop does on its tick. The generator is
 * unbounded — it keeps yielding while the source is active — so take a fixed
 * number of pulls rather than spreading it.
 */
function drain(source: { eventEmitter: () => Generator<unknown> }, pulls = 4) {
	const events: unknown[] = [];
	const iterator = source.eventEmitter();
	for (let i = 0; i < pulls; i += 1) {
		const next = iterator.next();
		if (next.done) break;
		const stack = next.value;
		if (Array.isArray(stack)) events.push(...stack);
		else if (stack) events.push(stack);
	}
	return events;
}

describe('RoomRequestResultDataSource', () => {
	it('publishes mode_join_accepted carrying the room code', async () => {
		const { host, rooms, source } = await setup();
		await rooms.join({ code: CODE, playerId: 'guest-1', nickname: 'Guest' });
		rooms.requestJoin();

		host.approve('guest-1');
		const events = drain(source);

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			event: WindowDomainEvents.mode_join_accepted,
			// The lobby page reads lobbyId out of the mode context; without it the
			// lobby queries stay disabled and the room renders empty.
			meta: { playerId: 'guest-1', lobbyId: CODE, gameId: CODE },
		});
	});

	it('publishes lobby_closed when the host vanishes', async () => {
		const { host, rooms } = await setup();
		const closed = new RoomClosedDataSource({ services: { rooms } as unknown as Services });
		closed.start();

		await rooms.join({ code: CODE, playerId: 'guest-1', nickname: 'Guest' });
		rooms.requestJoin();
		host.approve('guest-1');
		expect(drain(closed)).toEqual([]);

		// The host closing the room is the guest's only signal; without an event
		// the guest's FSM stays in GAME_LOBBY rendering an empty lobby.
		await host.close();
		const events = drain(closed);

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			event: WindowDomainEvents.lobby_closed,
			meta: { lobbyId: CODE },
		});
	});

	it('does not repeat lobby_closed once the room is already gone', async () => {
		const { rooms } = await setup();
		const closed = new RoomClosedDataSource({ services: { rooms } as unknown as Services });
		closed.start();

		await rooms.host({ playerId: 'guest-1', nickname: 'Guest', code: CODE });
		await rooms.leave();
		expect(drain(closed)).toHaveLength(1);

		// The lobby_closed handler leaves again; that must not re-trigger.
		await rooms.leave();

		expect(drain(closed)).toEqual([]);
	});

	it('publishes request_rejected when the host says no', async () => {
		const { host, rooms, source } = await setup();
		await rooms.join({ code: CODE, playerId: 'guest-1', nickname: 'Guest' });
		rooms.requestJoin();

		host.reject('guest-1');
		const events = drain(source);

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			event: WindowDomainEvents.request_rejected,
			meta: { lobbyId: CODE },
		});
	});
});
