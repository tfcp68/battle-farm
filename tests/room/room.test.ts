import { beforeEach, describe, expect, it } from '@jest/globals';
import { FakeSignalHub, type FakeRoomTransport } from '~/shared/net/FakeRoomTransport';
import { HostRoom } from '~/entities/room/HostRoom';
import { GuestRoom } from '~/entities/room/GuestRoom';
import type { RoomState } from '~/entities/room/types';

const CODE = 'K7QM2X';

/**
 * Sets up a host and any number of guests over the in-memory hub. No WebRTC and
 * no timers, so message ordering is deterministic.
 */
async function makeRoom(opts: { maxPlayers?: number } = {}) {
	const hub = new FakeSignalHub();

	const hostTransport = hub.createTransport();
	await hostTransport.join(CODE);
	const host = new HostRoom({
		transport: hostTransport,
		code: CODE,
		hostPlayerId: 'host-1',
		hostNickname: 'Host',
		maxPlayers: opts.maxPlayers,
	});

	const addGuest = async (playerId: string, nickname: string) => {
		const transport = hub.createTransport();
		await transport.join(CODE);
		const guest = new GuestRoom({ transport, code: CODE, playerId, nickname });
		guest.start();
		return { guest, transport };
	};

	return { hub, host, hostTransport, addGuest };
}

describe('HostRoom / GuestRoom', () => {
	let room: Awaited<ReturnType<typeof makeRoom>>;

	beforeEach(async () => {
		room = await makeRoom();
	});

	it('starts with only the host in the roster', () => {
		const state = room.host.getState();

		expect(state.players).toEqual([
			{ playerId: 'host-1', nickname: 'Host', isHost: true, isReady: false },
		]);
		expect(state.requests).toEqual([]);
	});

	it('sends the current snapshot to a guest that says hello', async () => {
		const { guest } = await room.addGuest('guest-1', 'Guest');

		expect(guest.getState()?.code).toBe(CODE);
		expect(guest.getState()?.players).toHaveLength(1);
	});

	it('records a join request and admits the guest on approval', async () => {
		const { guest } = await room.addGuest('guest-1', 'Guest');

		guest.requestJoin();
		expect(room.host.getState().requests).toEqual([{ playerId: 'guest-1', nickname: 'Guest' }]);

		room.host.approve('guest-1');

		expect(room.host.getState().requests).toEqual([]);
		expect(room.host.getState().players.map((p) => p.playerId)).toEqual(['host-1', 'guest-1']);
		expect(guest.getState()?.players.map((p) => p.playerId)).toEqual(['host-1', 'guest-1']);
	});

	it('tells the guest whether it was approved', async () => {
		const { guest } = await room.addGuest('guest-1', 'Guest');
		const results: boolean[] = [];
		guest.onRequestResult((approved) => results.push(approved));

		guest.requestJoin();
		room.host.reject('guest-1');

		expect(results).toEqual([false]);
		expect(room.host.getState().players).toHaveLength(1);
	});

	it('bumps the version on every mutation so stale snapshots can be dropped', async () => {
		const { guest } = await room.addGuest('guest-1', 'Guest');
		const before = room.host.getState().version;

		guest.requestJoin();
		room.host.approve('guest-1');

		expect(room.host.getState().version).toBeGreaterThan(before);
		expect(guest.getState()?.version).toBe(room.host.getState().version);
	});

	it('ignores a snapshot older than the one already held', async () => {
		const { guest, transport } = await room.addGuest('guest-1', 'Guest');
		guest.requestJoin();
		room.host.approve('guest-1');
		const current = guest.getState() as RoomState;

		// Replay an older snapshot the way a slow relay would.
		const stale: RoomState = { ...current, version: current.version - 1, players: [] };
		(transport as FakeRoomTransport).receiveMessage(
			{ v: 1, type: 'snapshot', payload: { state: stale } },
			'host-peer',
		);

		expect(guest.getState()?.players).toHaveLength(2);
	});

	it('applies a ready flag from the guest', async () => {
		const { guest } = await room.addGuest('guest-1', 'Guest');
		guest.requestJoin();
		room.host.approve('guest-1');

		guest.setReady(true);

		const guestRow = room.host.getState().players.find((p) => p.playerId === 'guest-1');
		expect(guestRow?.isReady).toBe(true);
	});

	it('ignores a ready flag for a player the peer does not own', async () => {
		const { guest } = await room.addGuest('guest-1', 'Guest');
		guest.requestJoin();
		room.host.approve('guest-1');

		// Impersonation attempt: guest-1's peer claiming to be the host.
		room.hostTransport.receiveMessage(
			{ v: 1, type: 'set_ready', payload: { playerId: 'host-1', isReady: true } },
			'peer-2',
		);

		expect(room.host.getState().players.find((p) => p.playerId === 'host-1')?.isReady).toBe(false);
	});

	it('disambiguates duplicate nicknames', async () => {
		const { guest } = await room.addGuest('guest-1', 'Host');
		guest.requestJoin();
		room.host.approve('guest-1');

		expect(room.host.getState().players.map((p) => p.nickname)).toEqual(['Host', 'Host (2)']);
	});

	it('rejects a request once the room is full', async () => {
		const small = await makeRoom({ maxPlayers: 2 });
		const first = await small.addGuest('guest-1', 'One');
		const second = await small.addGuest('guest-2', 'Two');
		const secondResults: boolean[] = [];
		second.guest.onRequestResult((approved) => secondResults.push(approved));

		first.guest.requestJoin();
		small.host.approve('guest-1');
		second.guest.requestJoin();
		small.host.approve('guest-2');

		expect(small.host.getState().players).toHaveLength(2);
		expect(secondResults).toEqual([false]);
	});

	it('drops a player whose peer disconnects', async () => {
		const { guest, transport } = await room.addGuest('guest-1', 'Guest');
		guest.requestJoin();
		room.host.approve('guest-1');

		await transport.leave();

		expect(room.host.getState().players.map((p) => p.playerId)).toEqual(['host-1']);
	});

	it('clears the guest state when the host disappears', async () => {
		const { guest } = await room.addGuest('guest-1', 'Guest');
		guest.requestJoin();
		room.host.approve('guest-1');
		expect(guest.getState()).not.toBeNull();

		await room.hostTransport.leave();

		expect(guest.getState()).toBeNull();
	});

	it('withdraws a pending request when the guest disconnects', async () => {
		const { guest } = await room.addGuest('guest-1', 'Guest');
		guest.requestJoin();
		expect(room.host.getState().requests).toHaveLength(1);

		// What cancelling a join request does: leave the room without being admitted.
		await guest.close();

		expect(room.host.getState().requests).toEqual([]);
	});

	it('lets a guest re-request after cancelling', async () => {
		const first = await room.addGuest('guest-1', 'Guest');
		first.guest.requestJoin();
		await first.guest.close();

		const second = await room.addGuest('guest-1', 'Guest');
		second.guest.requestJoin();

		expect(room.host.getState().requests).toEqual([{ playerId: 'guest-1', nickname: 'Guest' }]);
	});

	it('does not admit anyone while the room is locked', async () => {
		const { guest } = await room.addGuest('guest-1', 'Guest');
		guest.requestJoin();
		room.host.setLocked(true);
		room.host.approve('guest-1');

		expect(room.host.getState().players).toHaveLength(1);
	});
});
