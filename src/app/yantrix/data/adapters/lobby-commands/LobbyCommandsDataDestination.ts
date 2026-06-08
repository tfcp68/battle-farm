import type { QueryClient } from '@tanstack/react-query';
import {
	createDataDestinationAdapter,
	NamedDataDestination,
	uniqId,
	type TAutomataEventMetaType,
} from '@yantrix/core';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { getPlayerId } from '~/app/yantrix/register-functions';
import { parseEventMeta } from '~/app/yantrix/eventSchemas';
import { LobbyNotOpenError } from '~/entities/lobby/LobbyNotOpenError';
import type { WindowEventId, WindowEventMetaMap } from '~/app/yantrix/types';
import type { LobbyCommandsOutput } from './LobbyCommandsDataSource';

/** Discriminated input — one shape per inbound event. */
export type LobbyCommandsInput =
	| {
			kind: 'lobby_create_request';
			playerId: string;
	  }
	| { kind: 're_enter_lobby'; playerId: string; lobbyId: string; gameId: string | null }
	| { kind: 'join_game_request'; playerId: string; lobbyId: string };

type DomainEvent = TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>;

const Base = createDataDestinationAdapter<
	WindowEventId,
	WindowEventMetaMap,
	null,
	LobbyCommandsInput,
	LobbyCommandsOutput
>()(NamedDataDestination<LobbyCommandsInput, LobbyCommandsOutput>);

export interface LobbyCommandsDataDestinationOpts {
	services: Services;
	queryClient: QueryClient;
	id?: string;
	onResolved: (out: LobbyCommandsOutput) => void;
}

/**
 * Data Destination half of the lobby-commands promise adapter. Owns the
 * resolvers for the three follow-up-emitting commands:
 *
 *  - `lobby_created`     → DB create lobby + game → enriched `lobby_created`
 *  - `re_enter_lobby`    → fetch real `gameId`    → enriched `lobby_created`
 *  - `join_game_request` → DB write request      → maybe `request_rejected`
 *
 * The resolver NEVER rejects — it returns a discriminated {@link LobbyCommandsOutput}
 * (including `{ kind: 'noop' }` for the success-no-follow-up case) so the
 * paired source always observes a result.
 */
export class LobbyCommandsDataDestination extends Base {
	constructor(opts: LobbyCommandsDataDestinationOpts) {
		const { services, queryClient, onResolved } = opts;
		super({
			id: opts.id ?? `lobby_commands_dst_${uniqId(4)}`,
			resolver: async (input: LobbyCommandsInput): Promise<LobbyCommandsOutput> => {
				const result = await LobbyCommandsDataDestination.handle(services, queryClient, input);
				onResolved(result);
				return result;
			},
		});

		// `lobby_created` from the UI carries `lobbyId: null` — that's the create-trigger.
		// Re-entries carry a real lobbyId and must be skipped here (the UI emits a fresh
		// `lobby_created` with the real ids).
		this.createTrigger([WindowDomainEvents.lobby_created], (event: DomainEvent) => {
			const meta = parseEventMeta(event.meta);
			if (meta.lobbyId) return null; // re-entry — no DB write needed
			const playerId = meta.playerId ?? getPlayerId();
			if (!playerId) return null;
			return { kind: 'lobby_create_request', playerId };
		});

		this.createTrigger([WindowDomainEvents.re_enter_lobby], (event: DomainEvent) => {
			const meta = parseEventMeta(event.meta);
			const playerId = meta.playerId ?? getPlayerId();
			if (!meta.lobbyId || !playerId) return null;
			return {
				kind: 're_enter_lobby',
				playerId,
				lobbyId: meta.lobbyId,
				gameId: meta.gameId ?? null,
			};
		});

		this.createTrigger([WindowDomainEvents.join_game_request], (event: DomainEvent) => {
			const meta = parseEventMeta(event.meta);
			const playerId = meta.playerId ?? getPlayerId();
			if (!meta.lobbyId || !playerId) return null;
			return { kind: 'join_game_request', playerId, lobbyId: meta.lobbyId };
		});
	}

	private static async handle(
		services: Services,
		queryClient: QueryClient,
		input: LobbyCommandsInput,
	): Promise<LobbyCommandsOutput> {
		const lobbies = services.controllers.lobbies;
		const games = services.controllers.games;

		switch (input.kind) {
			case 'lobby_create_request': {
				const lobby = await lobbies.create(input.playerId, { maxPlayers: 7 });
				const game = await games.create({ lobbyId: lobby.lobbyId });
				await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
				await queryClient.invalidateQueries({ queryKey: ['games'] });
				return {
					kind: 'lobby_created_enriched',
					playerId: input.playerId,
					lobbyId: lobby.lobbyId,
					gameId: game.id,
					isHost: 1,
				};
			}
			case 're_enter_lobby': {
				let gameId = input.gameId;
				if (!gameId) {
					const game = await games.getByLobbyId(input.lobbyId);
					gameId = game?.id ?? null;
				}
				return {
					kind: 'lobby_created_enriched',
					playerId: input.playerId,
					lobbyId: input.lobbyId,
					gameId,
					isHost: 1,
				};
			}
			case 'join_game_request': {
				try {
					await lobbies.requestJoinByLobbyId(input.lobbyId, input.playerId);
					await queryClient.invalidateQueries({
						queryKey: ['lobbies', 'requests', 'byLobby', input.lobbyId],
					});
					return { kind: 'noop' };
				} catch (err: unknown) {
					if (err instanceof LobbyNotOpenError) {
						return {
							kind: 'request_rejected',
							playerId: input.playerId,
							lobbyId: input.lobbyId,
							reason: 'lobby_not_open',
						};
					}
					throw err;
				}
			}
		}
	}
}
