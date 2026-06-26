import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { getPlayerId } from '~/shared/lib/fsm/functions';
import { parseEventMeta } from '~/app/yantrix/eventSchemas';
import { AbstractWindowDataDestination, type DomainEvent } from '../shared/AbstractWindowDataDestination';

/**
 * The remaining handlers (`lobby_created`, `re_enter_lobby`, `join_game_request`)
 * emit follow-up events and live in {@link createLobbyCommandsAdapter}, which
 * wires a paired Data Source via the IOPromiseAdapter pattern.
 */
type CommandPacket =
	| { kind: 'mode_join_accepted'; playerId: string; lobbyId: string }
	| { kind: 'lobby_closed'; lobbyId: string }
	| { kind: 'game_started'; lobbyId: string }
	| { kind: 'player_exit'; playerId: string; lobbyId: string };

export class DomainCommandsDataDestination extends AbstractWindowDataDestination<CommandPacket> {
	readonly #services: Services;
	readonly #queryClient: QueryClient;

	constructor(opts: { services: Services; queryClient: QueryClient; id?: string }) {
		super({
			id: opts.id ?? `domain_commands_${uniqId(4)}`,
			triggers: {
				[WindowDomainEvents.mode_join_accepted]: (event: DomainEvent): CommandPacket | null => {
					const meta = parseEventMeta(event.meta);
					const playerId = meta.playerId ?? getPlayerId();
					if (!meta.lobbyId || !playerId) return null;
					return { kind: 'mode_join_accepted', playerId, lobbyId: meta.lobbyId };
				},
				[WindowDomainEvents.lobby_closed]: (event: DomainEvent): CommandPacket | null => {
					const { lobbyId } = parseEventMeta(event.meta);
					if (!lobbyId) return null;
					return { kind: 'lobby_closed', lobbyId };
				},
				[WindowDomainEvents.game_started]: (event: DomainEvent): CommandPacket | null => {
					const { lobbyId } = parseEventMeta(event.meta);
					if (!lobbyId) return null;
					return { kind: 'game_started', lobbyId };
				},
				[WindowDomainEvents.player_exit]: (event: DomainEvent): CommandPacket | null => {
					const meta = parseEventMeta(event.meta);
					const playerId = meta.playerId ?? getPlayerId();
					if (!meta.lobbyId || !playerId) return null;
					return { kind: 'player_exit', playerId, lobbyId: meta.lobbyId };
				},
			},
		});
		this.#services = opts.services;
		this.#queryClient = opts.queryClient;
	}

	protected async resolve(packet: CommandPacket): Promise<null> {
		const lobbies = this.#services.controllers.lobbies;
		const qc = this.#queryClient;

		switch (packet.kind) {
			case 'mode_join_accepted': {
				const existingPlayers = await lobbies.listPlayersByLobbyId(packet.lobbyId);
				if (existingPlayers.some((p) => p.playerId === packet.playerId)) return null;
				await lobbies.addPlayerByLobbyId(packet.lobbyId, packet.playerId, false);
				await qc.invalidateQueries({
					queryKey: ['lobbies', 'players', 'byLobby', packet.lobbyId],
				});
				await qc.invalidateQueries({
					queryKey: ['lobbies', 'lobby', 'byId', packet.lobbyId],
				});
				return null;
			}
			case 'lobby_closed':
			case 'game_started': {
				await lobbies.closeByLobbyId(packet.lobbyId);
				await qc.invalidateQueries({ queryKey: ['lobbies'] });
				return null;
			}
			case 'player_exit': {
				await lobbies.removePlayerByLobbyId(packet.lobbyId, packet.playerId);
				await qc.invalidateQueries({ queryKey: ['lobbies'] });
				return null;
			}
		}
	}
}
