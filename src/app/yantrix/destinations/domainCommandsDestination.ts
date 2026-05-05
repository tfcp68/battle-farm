import {
	IAutomataEventBus,
	IEventDestination,
	TAutomataBaseEventType,
	TAutomataEventMetaType,
	TEventBusTask,
	uniqId,
} from '@yantrix/core';
import type { QueryClient } from '@tanstack/react-query';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { getPlayerId } from '~/app/yantrix/register-functions';
import { navigateTo } from '~/app/yantrix/navigationRef';

type MetaMap = Record<TAutomataBaseEventType, unknown>;
type TMetaEvent = TAutomataEventMetaType<TAutomataBaseEventType, MetaMap>;

export function createDomainCommandsDestination(opts: {
	services: Services;
	queryClient: QueryClient;
}): IEventDestination<TAutomataBaseEventType, MetaMap> {
	const { services, queryClient } = opts;

	return {
		id: `domainCommandsDestination_${uniqId()}`,
		bind(bus: IAutomataEventBus<TAutomataBaseEventType, MetaMap>) {
			const unsubs: Array<() => void> = [];

			const on = (event: TAutomataBaseEventType, fn: (e: TMetaEvent) => Promise<void> | void) => {
				const h = (e: TMetaEvent): TEventBusTask<TAutomataBaseEventType, MetaMap> => {
					const p = Promise.resolve(fn(e));
					return {
						event: e.event,
						meta: e.meta ?? null,
						task_id: `dst_task_${uniqId()}`,
						result: p.then(() => []),
					};
				};
				bus.subscribe(event, h);
				unsubs.push(() => bus.unsubscribe(event, h));
			};

			// Create lobby + game, then navigate to /lobby with real lobbyId.
			// Skip if lobbyId already provided (host re-entering existing lobby).
			on(WindowDomainEvents.lobby_created, async ({ meta }) => {
				const m = meta as Record<string, unknown> | null;
				const playerId = (m?.playerId as string | null) ?? getPlayerId();
				const existingLobbyId = (m?.lobbyId as string | null) ?? null;

				if (existingLobbyId) return; // Re-entry — no DB write needed.
				if (!playerId) return;

				try {
					const lobby = await services.controllers.lobbies.create(playerId, { maxPlayers: 7 });
					await services.controllers.games.create({ lobbyId: lobby.lobbyId });
					await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
					await queryClient.invalidateQueries({ queryKey: ['games'] });
					navigateTo('/lobby', { replace: true, state: { lobbyId: lobby.lobbyId } });
				} catch (err) {
					throw new Error('Failed to create lobby: ' + String(err));
				}
			});

			// Single source of DB write for join requests
			on(WindowDomainEvents.join_game_request, async ({ meta }) => {
				const m = meta as Record<string, unknown> | null;
				const lobbyId = (m?.lobbyId as string) ?? null;
				const playerId = (m?.playerId as string) ?? getPlayerId();
				if (!lobbyId || !playerId) return;

				try {
					await services.controllers.lobbies.requestJoinByLobbyId(lobbyId, playerId);
					await queryClient.invalidateQueries({ queryKey: ['lobbies', 'requests', 'byLobby', lobbyId] });
				} catch (err) {
					throw new Error('Failed to request join lobby: ' + String(err));
				}
			});

			// Accept join request → add player to lobby_players
			on(WindowDomainEvents.request_accepted, async ({ meta }) => {
				const m = meta as Record<string, unknown> | null;
				const lobbyId = (m?.lobbyId as string) ?? null;
				const playerId = (m?.playerId as string) ?? getPlayerId();
				if (!lobbyId || !playerId) return;

				try {
					const existingPlayers = await services.controllers.lobbies.listPlayersByLobbyId(lobbyId);
					if (existingPlayers.some((p) => p.playerId === playerId)) return;

					await services.controllers.lobbies.addPlayerByLobbyId(lobbyId, playerId, false);
					await queryClient.invalidateQueries({ queryKey: ['lobbies', 'players', 'byLobby', lobbyId] });
					await queryClient.invalidateQueries({ queryKey: ['lobbies', 'lobby', 'byId', lobbyId] });
				} catch (err) {
					throw new Error('Failed to accept join request: ' + String(err));
				}
			});

			// Close lobby
			on(WindowDomainEvents.lobby_closed, async ({ meta }) => {
				const m = meta as Record<string, unknown> | null;
				const lobbyId = (m?.lobbyId as string) ?? null;
				if (!lobbyId) return;

				try {
					await services.controllers.lobbies.closeByLobbyId(lobbyId);
					await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
				} catch (err) {
					throw new Error('Failed to close lobby: ' + String(err));
				}
			});

			// Player leaving lobby
			on(WindowDomainEvents.player_exit, async ({ meta }) => {
				const m = meta as Record<string, unknown> | null;
				const lobbyId = (m?.lobbyId as string) ?? null;
				const playerId = (m?.playerId as string) ?? getPlayerId();
				if (!lobbyId || !playerId) return;

				try {
					await services.controllers.lobbies.removePlayerByLobbyId(lobbyId, playerId);
					await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
				} catch (err) {
					throw new Error('Failed to leave lobby: ' + String(err));
				}
			});

			return () => unsubs.forEach((u) => u());
		},
	};
}

