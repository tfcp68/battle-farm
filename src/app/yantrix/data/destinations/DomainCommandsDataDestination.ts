import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { parseEventMeta } from '~/app/yantrix/eventSchemas';
import { lobbyKeys } from '~/entities/lobby/keys';
import { AbstractWindowDataDestination, type DomainEvent } from '../shared/AbstractWindowDataDestination';

/**
 * Commands that end a player's presence in a room. Membership itself is not
 * written here — the host owns the roster and admits players on approval — so
 * what remains is leaving, plus refreshing the cache the UI reads.
 */
type CommandPacket = { kind: 'leave_room' } | { kind: 'refresh'; lobbyId: string };

export class DomainCommandsDataDestination extends AbstractWindowDataDestination<CommandPacket> {
	readonly #services: Services;
	readonly #queryClient: QueryClient;

	constructor(opts: { services: Services; queryClient: QueryClient; id?: string }) {
		super({
			id: opts.id ?? `domain_commands_${uniqId(4)}`,
			triggers: {
				// Admission already happened on the host; just re-read the roster.
				[WindowDomainEvents.mode_join_accepted]: (event: DomainEvent): CommandPacket | null => {
					const { lobbyId } = parseEventMeta(event.meta);
					if (!lobbyId) return null;
					return { kind: 'refresh', lobbyId };
				},
				// Leaving needs no lobby id: there is only ever one room per session,
				// and `cancel_game_request` carries no meta at all.
				[WindowDomainEvents.lobby_closed]: (): CommandPacket => ({ kind: 'leave_room' }),
				[WindowDomainEvents.player_exit]: (): CommandPacket => ({ kind: 'leave_room' }),
				// Without this the guest stays connected after backing out of a join
				// request, and its pending request keeps sitting in the host's list.
				[WindowDomainEvents.cancel_game_request]: (): CommandPacket => ({ kind: 'leave_room' }),
				[WindowDomainEvents.request_rejected]: (): CommandPacket => ({ kind: 'leave_room' }),
				[WindowDomainEvents.request_timeout]: (): CommandPacket => ({ kind: 'leave_room' }),
			},
		});
		this.#services = opts.services;
		this.#queryClient = opts.queryClient;
	}

	protected async resolve(packet: CommandPacket): Promise<null> {
		const qc = this.#queryClient;

		if (packet.kind === 'leave_room') {
			await this.#services.controllers.lobbies.leave();
			await qc.invalidateQueries({ queryKey: lobbyKeys.all });
			return null;
		}

		await qc.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(packet.lobbyId) });
		await qc.invalidateQueries({ queryKey: lobbyKeys.byLobbyId(packet.lobbyId) });
		return null;
	}
}
