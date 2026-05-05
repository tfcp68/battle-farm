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
import type { WindowEventMetaMap } from '~/app/yantrix/types';

type MetaMap = WindowEventMetaMap;
type TMetaEvent = TAutomataEventMetaType<TAutomataBaseEventType, MetaMap>;

// D1: Centralised meta extraction to avoid repetitive casts across every handler.
function extractMeta(meta: unknown) {
	const m = (meta !== null && typeof meta === 'object') ? meta as Record<string, unknown> : {};
	return {
		playerId: (m['playerId'] as string | undefined) ?? null,
		lobbyId:  (m['lobbyId']  as string | undefined) ?? null,
		isHost:   (m['isHost']   as 0 | 1  | undefined) ?? 0,
	};
}

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
				// A4: Catch async errors so they are logged rather than silently swallowed.
				// The promise MUST resolve to an array (TAutomataEventStack) — Yantrix throws
				// "Invalid event received from promise" if it resolves to null.
				// An empty array signals "no follow-up events".
				const result = Promise.resolve(fn(e))
					.then(() => [] as never[])
					.catch((err: unknown) => {
						console.error('[domainCommandsDestination] handler error:', err);
						return [] as never[];
					});
					return {
						event: e.event,
						meta: e.meta ?? null,
						task_id: `dst_task_${uniqId()}`,
						result,
					};
				};
				bus.subscribe(event, h);
				unsubs.push(() => bus.unsubscribe(event, h));
			};

			// Create lobby + game, then navigate to /lobby with real lobbyId.
			// Skip if lobbyId already provided (host re-entering existing lobby).
			on(WindowDomainEvents.lobby_created, async ({ meta }) => {
				const { playerId: metaPlayerId, lobbyId: existingLobbyId } = extractMeta(meta);
				const playerId = metaPlayerId ?? getPlayerId();

				if (existingLobbyId) return; // Re-entry — no DB write needed.
				if (!playerId) return;

				const lobby = await services.controllers.lobbies.create(playerId, { maxPlayers: 7 });
				await services.controllers.games.create({ lobbyId: lobby.lobbyId });
				await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
				await queryClient.invalidateQueries({ queryKey: ['games'] });
				navigateTo('/lobby', { replace: true, state: { lobbyId: lobby.lobbyId } });
			});

			// Single source of DB write for join requests.
			on(WindowDomainEvents.join_game_request, async ({ meta }) => {
				const { playerId: metaPlayerId, lobbyId } = extractMeta(meta);
				const playerId = metaPlayerId ?? getPlayerId();
				if (!lobbyId || !playerId) return;

				await services.controllers.lobbies.requestJoinByLobbyId(lobbyId, playerId);
				await queryClient.invalidateQueries({ queryKey: ['lobbies', 'requests', 'byLobby', lobbyId] });
			});

			// Accept join request → add player to lobby_players.
			on(WindowDomainEvents.request_accepted, async ({ meta }) => {
				const { playerId: metaPlayerId, lobbyId } = extractMeta(meta);
				const playerId = metaPlayerId ?? getPlayerId();
				if (!lobbyId || !playerId) return;

				const existingPlayers = await services.controllers.lobbies.listPlayersByLobbyId(lobbyId);
				if (existingPlayers.some((p) => p.playerId === playerId)) return;

				await services.controllers.lobbies.addPlayerByLobbyId(lobbyId, playerId, false);
				await queryClient.invalidateQueries({ queryKey: ['lobbies', 'players', 'byLobby', lobbyId] });
				await queryClient.invalidateQueries({ queryKey: ['lobbies', 'lobby', 'byId', lobbyId] });
			});

			// Close lobby.
			on(WindowDomainEvents.lobby_closed, async ({ meta }) => {
				const { lobbyId } = extractMeta(meta);
				if (!lobbyId) return;

				await services.controllers.lobbies.closeByLobbyId(lobbyId);
				await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
			});

			// Player leaving lobby.
			on(WindowDomainEvents.player_exit, async ({ meta }) => {
				const { playerId: metaPlayerId, lobbyId } = extractMeta(meta);
				const playerId = metaPlayerId ?? getPlayerId();
				if (!lobbyId || !playerId) return;

				await services.controllers.lobbies.removePlayerByLobbyId(lobbyId, playerId);
				await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
			});

			return () => unsubs.forEach((u) => u());
		},
	};
}
