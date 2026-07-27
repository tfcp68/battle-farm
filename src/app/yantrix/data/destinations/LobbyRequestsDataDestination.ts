import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { parseEventMeta } from '~/app/yantrix/eventSchemas';
import { lobbyKeys } from '~/entities/lobby/keys';
import {
	AbstractWindowDataDestination,
	type DomainEvent,
} from '../shared/AbstractWindowDataDestination';

type LobbyRequestPacket =
	| { kind: 'approve'; requestId: string; lobbyId: string }
	| { kind: 'reject'; requestId: string; lobbyId: string };

/**
 * Host-side verdict on a join request. The capacity check lives in
 * `HostRoom.approve` instead: it holds the authoritative roster, so it is the
 * only place that can decide without racing another approval.
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

		if (packet.kind === 'approve') await lobbies.approveRequest(packet.requestId);
		else await lobbies.rejectRequest(packet.requestId);

		await this.#queryClient.invalidateQueries({
			queryKey: lobbyKeys.requestsByLobbyId(packet.lobbyId),
		});
		await this.#queryClient.invalidateQueries({
			queryKey: lobbyKeys.playersByLobbyId(packet.lobbyId),
		});
		return null;
	}
}
