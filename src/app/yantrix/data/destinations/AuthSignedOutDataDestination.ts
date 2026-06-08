import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import type { Services } from '~/shared/services/createServices';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { setCurrentPlayerId } from '~/entities/auth/queries';
import { AbstractWindowDataDestination } from '../shared/AbstractWindowDataDestination';

interface SignOutPacket {
	kind: 'sign_out';
}

/**
 * Fire-and-forget sign-out destination: signs the user out of Supabase, clears
 * the local player id, and resets the query cache. Emits no follow-up event,
 * so no paired Data Source is needed.
 *
 * Class-based replacement for the `b.on(auth_signed_out, …)` handler that
 * previously lived in `authCommandsDestination` via `defineDestination`.
 */
export class AuthSignedOutDataDestination extends AbstractWindowDataDestination<SignOutPacket> {
	readonly #services: Services;
	readonly #queryClient: QueryClient;

	constructor(opts: { services: Services; queryClient: QueryClient; id?: string }) {
		super({
			id: opts.id ?? `auth_signed_out_${uniqId(4)}`,
			triggers: {
				[WindowDomainEvents.auth_signed_out]: (): SignOutPacket | null => ({
					kind: 'sign_out',
				}),
			},
		});
		this.#services = opts.services;
		this.#queryClient = opts.queryClient;
	}

	protected async resolve(): Promise<null> {
		await this.#services.controllers.auth.signOut();
		setCurrentPlayerId(null);
		this.#queryClient.clear();
		return null;
	}
}
