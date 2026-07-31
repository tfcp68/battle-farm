import { describe, expect, it } from '@jest/globals';
import { QueryClient } from '@tanstack/react-query';
import { FakeSignalHub } from '~/shared/net/FakeRoomTransport';
import { RoomService } from '~/entities/room/RoomService';
import { connectRoomToQueryCache } from '~/entities/room/RoomQueryBridge';
import LobbiesModel from '~/entities/lobby/model';
import { lobbyKeys } from '~/entities/lobby/keys';

const CODE = 'K7QM2X';

function setup() {
	const hub = new FakeSignalHub();
	const rooms = new RoomService({ createTransport: () => hub.createTransport() });
	const queryClient = new QueryClient();
	const model = new LobbiesModel(rooms);
	return { hub, rooms, queryClient, model };
}

describe('room → query cache', () => {
	it('projects the room state into the lobby views', async () => {
		const { rooms, model } = setup();
		await rooms.host({ playerId: 'host-1', nickname: 'Host', code: CODE });

		const lobby = await model.getLobbyById(CODE);
		const players = await model.listPlayersByLobbyId(CODE);

		expect(lobby).toEqual({
			lobbyId: CODE,
			hostPlayerId: 'host-1',
			status: 'open',
			maxPlayers: 7,
		});
		expect(players).toEqual([
			{
				id: `${CODE}:host-1`,
				lobbyId: CODE,
				playerId: 'host-1',
				nickname: 'Host',
				isHost: true,
				isReady: false,
			},
		]);
	});

	it('returns nothing for a lobby id that is not the current room', async () => {
		const { rooms, model } = setup();
		await rooms.host({ playerId: 'host-1', nickname: 'Host', code: CODE });

		expect(await model.getLobbyById('OTHER1')).toBeNull();
		expect(await model.listPlayersByLobbyId('OTHER1')).toEqual([]);
	});

	it('invalidates the lobby queries when the room state changes', async () => {
		const { rooms, queryClient, model } = setup();
		await rooms.host({ playerId: 'host-1', nickname: 'Host', code: CODE });

		// Seed the cache the way the UI's useQuery would.
		await queryClient.fetchQuery({
			queryKey: lobbyKeys.playersByLobbyId(CODE),
			queryFn: () => model.listPlayersByLobbyId(CODE),
		});
		const disconnect = connectRoomToQueryCache(rooms, queryClient);

		const before = queryClient.getQueryState(lobbyKeys.playersByLobbyId(CODE));
		expect(before?.isInvalidated).toBe(false);

		rooms.setReady('host-1', true);

		expect(queryClient.getQueryState(lobbyKeys.playersByLobbyId(CODE))?.isInvalidated).toBe(true);
		disconnect();
	});

	it('stops invalidating once disconnected', async () => {
		const { rooms, queryClient, model } = setup();
		await rooms.host({ playerId: 'host-1', nickname: 'Host', code: CODE });
		const disconnect = connectRoomToQueryCache(rooms, queryClient);
		disconnect();

		await queryClient.fetchQuery({
			queryKey: lobbyKeys.playersByLobbyId(CODE),
			queryFn: () => model.listPlayersByLobbyId(CODE),
		});
		rooms.setReady('host-1', true);

		expect(queryClient.getQueryState(lobbyKeys.playersByLobbyId(CODE))?.isInvalidated).toBe(false);
	});

	it('times out when no host answers the code', async () => {
		const hub = new FakeSignalHub();
		const rooms = new RoomService({
			createTransport: () => hub.createTransport(),
			connectTimeoutMs: 20,
		});

		await expect(
			rooms.join({ code: 'NOBODY', playerId: 'guest-1', nickname: 'Guest' }),
		).rejects.toThrow('No response from room');
	});

	it('reports the timeout even when the transport never finishes closing', async () => {
		const hub = new FakeSignalHub();
		const rooms = new RoomService({
			createTransport: () => {
				const transport = hub.createTransport();
				const join = transport.join.bind(transport);
				const leave = transport.leave.bind(transport);
				let isJoined = false;
				transport.join = async (code: string) => {
					await join(code);
					isJoined = true;
				};
				// Relays that are down are exactly why the connection failed, so the
				// teardown that talks to them can hang forever. Reporting the failure
				// must not wait for it — otherwise the UI sits on "Connecting…".
				transport.leave = () => (isJoined ? new Promise<void>(() => {}) : leave());
				return transport;
			},
			connectTimeoutMs: 20,
		});

		await expect(
			rooms.join({ code: 'NOBODY', playerId: 'guest-1', nickname: 'Guest' }),
		).rejects.toThrow('No response from room');
	});
});
