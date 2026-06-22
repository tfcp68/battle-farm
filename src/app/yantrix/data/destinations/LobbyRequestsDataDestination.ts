import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { parseEventMeta } from '~/app/yantrix/eventSchemas';
import {
	AbstractWindowDataDestination,
	type DomainEvent,
} from '../shared/AbstractWindowDataDestination';

type LobbyRequestPacket =
	| { kind: 'approve'; requestId: string; lobbyId: string }
	| { kind: 'reject'; requestId: string; lobbyId: string };

/**
 * Approves or rejects a lobby join request — fire-and-forget. Replaces
 * `defineDestination`-style `createLobbyRequestsDestination`.
 *
 * On approval, performs a **capacity guard**: if the lobby is already full,
 * auto-rejects instead. The original handler did this inline; here it's
 * encapsulated in the `approve` branch of `resolve`.
 */
export class LobbyRequestsDataDestination extends AbstractWindowDataDestination<LobbyRequestPacket> {
	readonly #services: Services;
	readonly #queryClient: QueryClient;

	constructor(opts: { services: Services; queryClient: QueryClient; id?: string }) {
		super({
			id: opts.id ?? `lobby_requests_${uniqId(4)}`,
			triggers: {
				[WindowDomainEvents.lobby_request_approved]: (event: DomainEvent): LobbyRequestPacket | null => {
					const { requestId, lobbyId } = parseEventMeta(event.meta);
					if (!requestId || !lobbyId) return null;
					return { kind: 'approve', requestId, lobbyId };
				},
				[WindowDomainEvents.lobby_request_rejected]: (event: DomainEvent): LobbyRequestPacket | null => {
					const { requestId, lobbyId } = parseEventMeta(event.meta);
					if (!requestId || !lobbyId) return null;
					return { kind: 'reject', requestId, lobbyId };
				},
			},
		});
		this.#services = opts.services;
		this.#queryClient = opts.queryClient;
	}

	protected async resolve(packet: LobbyRequestPacket): Promise<null> {
		const lobbies = this.#services.controllers.lobbies;
		const qc = this.#queryClient;

		if (packet.kind === 'reject') {
			await lobbies.rejectRequest(packet.requestId);
			await qc.invalidateQueries({
				queryKey: ['lobbies', 'requests', 'byLobby', packet.lobbyId],
			});
			return null;
		}

		// Capacity guard — auto-reject if the lobby is already full.
		const [lobby, currentPlayers] = await Promise.all([
			lobbies.getByLobbyId(packet.lobbyId),
			lobbies.listPlayersByLobbyId(packet.lobbyId),
		]);
		if (lobby && currentPlayers.length >= lobby.maxPlayers) {
			await lobbies.rejectRequest(packet.requestId);
			await qc.invalidateQueries({
				queryKey: ['lobbies', 'requests', 'byLobby', packet.lobbyId],
			});
			return null;
		}

		await lobbies.approveRequest(packet.requestId);
		await qc.invalidateQueries({ queryKey: ['lobbies', 'players', 'byLobby', packet.lobbyId] });
		await qc.invalidateQueries({ queryKey: ['lobbies', 'requests', 'byLobby', packet.lobbyId] });
		await qc.invalidateQueries({ queryKey: ['lobbies', 'lobby', 'byId', packet.lobbyId] });
		return null;
	}
}
