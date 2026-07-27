import type { QueryClient } from '@tanstack/react-query';
import {
	createDataDestinationAdapter,
	NamedDataDestination,
	type TAutomataEventMetaType,
	uniqId,
} from '@yantrix/core';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { parseEventMeta } from '~/app/yantrix/eventSchemas';
import { lobbyKeys } from '~/entities/lobby/keys';
import { getCurrentProfile } from '~/entities/profile/currentProfile';
import { isValidRoomCode, normalizeRoomCode } from '~/shared/net/RoomTransport';
import { RoomConnectTimeoutError } from '~/entities/room/RoomService';
import type { WindowEventId, WindowEventMetaMap } from '~/app/yantrix/types';
import type { RoomCommandsOutput } from './RoomCommandsDataSource';

export type RoomCommandsInput =
	| { kind: 'create'; playerId: string; nickname: string }
	| { kind: 'join'; playerId: string; nickname: string; code: string };

type DomainEvent = TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>;

const Base = createDataDestinationAdapter<
	WindowEventId,
	WindowEventMetaMap,
	null,
	RoomCommandsInput,
	RoomCommandsOutput
>()(NamedDataDestination<RoomCommandsInput, RoomCommandsOutput>);

export interface RoomCommandsDataDestinationOpts {
	services: Services;
	queryClient: QueryClient;
	id?: string;
	onResolved: (out: RoomCommandsOutput) => void;
}

function errorMessage(err: unknown): string {
	if (err instanceof RoomConnectTimeoutError) {
		return 'No room answered that code. Check the code, or ask the host whether the room is still open.';
	}
	if (err instanceof Error && err.message) return err.message;
	return 'Could not connect. Check your network and try again.';
}

/**
 * Hosting a new room and joining one by code. Both are slow and failable, which
 * is why they go through the bus: the mode FSM sits in `CONNECTING` until a
 * follow-up lands. The resolver never rejects — failures come back as
 * `connect_failed`.
 */
export class RoomCommandsDataDestination extends Base {
	constructor(opts: RoomCommandsDataDestinationOpts) {
		const { services, queryClient, onResolved } = opts;

		super({
			id: opts.id ?? `room_commands_dst_${uniqId(4)}`,
			resolver: async (input: RoomCommandsInput): Promise<RoomCommandsOutput> => {
				const result = await RoomCommandsDataDestination.handle(services, queryClient, input);
				onResolved(result);
				return result;
			},
		});

		this.createTrigger([WindowDomainEvents.room_create_requested], (): RoomCommandsInput | null => {
			const profile = getCurrentProfile();
			if (!profile) return null;
			return { kind: 'create', playerId: profile.playerId, nickname: profile.nickname };
		});

		this.createTrigger([WindowDomainEvents.join_game_request], (event: DomainEvent) => {
			const meta = parseEventMeta(event.meta);
			const profile = getCurrentProfile();
			if (!profile || !meta.lobbyId) return null;
			return {
				kind: 'join' as const,
				playerId: profile.playerId,
				nickname: profile.nickname,
				code: meta.lobbyId,
			};
		});
	}

	private static async handle(
		services: Services,
		queryClient: QueryClient,
		input: RoomCommandsInput,
	): Promise<RoomCommandsOutput> {
		const lobbies = services.controllers.lobbies;

		try {
			if (input.kind === 'create') {
				const lobby = await lobbies.create(input.playerId, { nickname: input.nickname });
				await queryClient.invalidateQueries({ queryKey: lobbyKeys.all });
				return { kind: 'room_created', playerId: input.playerId, lobbyId: lobby.lobbyId };
			}

			const code = normalizeRoomCode(input.code);
			if (!isValidRoomCode(code)) {
				return { kind: 'connect_failed', error: 'That room code looks wrong — it is 6 characters.' };
			}

			const lobby = await lobbies.requestJoinByCode(code, input.playerId, input.nickname);
			await queryClient.invalidateQueries({ queryKey: lobbyKeys.all });
			return { kind: 'room_connected', lobbyId: lobby.lobbyId };
		} catch (err: unknown) {
			return { kind: 'connect_failed', error: errorMessage(err) };
		}
	}
}
