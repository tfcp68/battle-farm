import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { AbstractWindowDataSource, type FollowUp } from '../../shared/AbstractWindowDataSource';

export type AuthOutput = { ok: true; playerId: string } | { ok: false; error: string };

/**
 * Data Source half of the auth request/response promise adapter.
 *
 * Mirrors the role of the (private) DataSource constructed inside
 * `IOPromiseAdapter.createPromiseDataAdapter`. Inherits the common boilerplate
 * — setter capture, responseMapper registration — from {@link AbstractWindowDataSource}.
 */
export class AuthDataSource extends AbstractWindowDataSource<AuthOutput> {
	constructor(opts: { id?: string } = {}) {
		super({
			id: opts.id ?? `auth_data_source_${uniqId(4)}`,
			responseMapper: (data: AuthOutput): FollowUp[] => {
				if (data.ok) {
					return [{ event: WindowDomainEvents.auth_succeeded, meta: { playerId: data.playerId } }];
				}
				return [{ event: WindowDomainEvents.auth_failed, meta: { error: data.error } }];
			},
		});
	}

	/** Called by the paired {@link AuthDataDestination} after its resolver completes. */
	push(data: AuthOutput): void {
		this.emit(data);
	}
}
