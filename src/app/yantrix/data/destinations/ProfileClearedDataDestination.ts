import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { AbstractWindowDataDestination } from '../shared/AbstractWindowDataDestination';

interface ClearProfilePacket {
	kind: 'clear_profile';
}

/**
 * Sends the player back to the nickname screen. Leaves the room first so peers
 * see them go rather than time out, then empties the query cache.
 *
 * The stored profile is deliberately kept: `playerId` must survive a rename, or
 * the host stops recognising a player who comes back. `createOrRename` reuses
 * the id it finds, so wiping storage here would silently issue a new identity —
 * and the nickname screen could no longer pre-fill the current name.
 */
export class ProfileClearedDataDestination extends AbstractWindowDataDestination<ClearProfilePacket> {
	readonly #services: Services;
	readonly #queryClient: QueryClient;

	constructor(opts: { services: Services; queryClient: QueryClient; id?: string }) {
		super({
			id: opts.id ?? `profile_cleared_${uniqId(4)}`,
			triggers: {
				[WindowDomainEvents.profile_cleared]: (): ClearProfilePacket => ({ kind: 'clear_profile' }),
			},
		});
		this.#services = opts.services;
		this.#queryClient = opts.queryClient;
	}

	protected async resolve(): Promise<null> {
		await this.#services.controllers.lobbies.leave();
		this.#queryClient.clear();
		return null;
	}
}
