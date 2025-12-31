import {
	IAutomataEventBus,
	IEventDestination,
	TAutomataBaseEventType,
	TAutomataEventMetaType,
	TEventBusTask,
	uniqId,
} from '@yantrix/core';
import type { QueryClient } from '@tanstack/react-query';
import type { Services } from '~/services/createServices';
import { WindowDomainEvents } from '~/yantrix/windowDomainEvents';
import { getPlayerId } from '~/yantrix/register-functions';

type MetaMap = Record<TAutomataBaseEventType, any>;

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

			// UI: Create lobby flow
			on(WindowDomainEvents.lobby_created, async ({ meta }) => {

				const playerId = meta.playerId ?? getPlayerId();
				if (!playerId) return;

				const lobby = await services.controllers.lobbies.create(playerId, { maxPlayers: 7 });
				await services.controllers.games.create({ lobbyId: lobby.lobbyId });

				await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
				await queryClient.invalidateQueries({ queryKey: ['games'] });
			});

			// UI: Request join lobby (creates lobby_request row in DB)
			on(WindowDomainEvents.join_game_request, async ({ meta }) => {
				// Mode FSM emits join_game_request automatically on JOIN_REQUEST state entry.
				// That event is useful for "intent" semantics in the FSM, but must NOT trigger DB writes,
				// otherwise we can create event storms (FSM -> destination -> invalidation -> state churn -> FSM ...).

				const lobbyId = meta.lobbyId ?? null;
				const playerId = meta.playerId ?? getPlayerId();
				if (!lobbyId || !playerId) return;

				try {
					await services.controllers.lobbies.requestJoinByLobbyId(lobbyId, playerId);
					await queryClient.invalidateQueries({ queryKey: ['lobbies', 'requests', 'byLobby', lobbyId] });
				} catch (err) {
					throw new Error("Failed to request join lobby: " + String(err));
				}
			});

			// UI: Accept join => add player to lobby_players
			on(WindowDomainEvents.request_accepted, async ({ meta }) => {

				const lobbyId = meta.lobbyId ?? null;
				const playerId = meta.playerId ?? getPlayerId();
				if (!lobbyId || !playerId) return;

				try {
					const existingPlayers = await services.controllers.lobbies.listPlayersByLobbyId(lobbyId);
					if (existingPlayers.some((p) => p.playerId === playerId)) return;

					await services.controllers.lobbies.addPlayerByLobbyId(lobbyId, playerId, false);

					await queryClient.invalidateQueries({ queryKey: ['lobbies', 'players', 'byLobby', lobbyId] });
					await queryClient.invalidateQueries({ queryKey: ['lobbies', 'lobby', 'byId', lobbyId] });
				} catch (err) {
					throw new Error("Failed to accept join request: " + String(err));
				}
			});


			return () => unsubs.forEach((u) => u());
		},
	};
}