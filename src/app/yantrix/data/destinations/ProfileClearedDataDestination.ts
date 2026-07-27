import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { setCurrentProfile } from '~/entities/profile/currentProfile';
import { AbstractWindowDataDestination } from '../shared/AbstractWindowDataDestination';

interface ClearProfilePacket {
	kind: 'clear_profile';
}

/**
 * Drops the local identity. Leaves the room first so peers see the player go
 * rather than time out, then forgets the profile and empties the query cache.
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
		await this.#services.controllers.profile.clear();
		setCurrentProfile(null);
		this.#queryClient.clear();
		return null;
	}
}
