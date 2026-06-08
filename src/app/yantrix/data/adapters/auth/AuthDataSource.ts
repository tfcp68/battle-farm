import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { AbstractWindowDataSource, type FollowUp } from '../../shared/AbstractWindowDataSource';

/**
 * Discriminated result the auth resolver pushes into this source.
 *
 * `ok: true` carries the freshly authenticated playerId; `ok: false` carries
 * a human-readable error string. The resolver NEVER rejects — it always
 * resolves to one of these two shapes so a response event is always emitted.
 */
export type AuthOutput =
	| { ok: true; playerId: string }
	| { ok: false; error: string };

/**
 * Data Source half of the auth request/response promise adapter.
 *
 * Mirrors the role of the (private) DataSource constructed inside
 * `IOPromiseAdapter.createPromiseDataAdapter`. Inherits the common boilerplate
 * — setter capture, responseMapper registration — from {@link AbstractWindowDataSource}.
 * The CoreLoop-facing event flow is:
 *
 *   AuthDataDestination.resolver returns AuthOutput
 *     │
 *     ▼ onResolved
 *   AuthDataSource.push(output)               (calls protected `emit` → `_addDataPacket`)
 *     │                                       │
 *     │                                       ▼ setNotifier (installed by CoreLoop)
 *     │                                   CoreLoop schedules a microtask drain
 *     ▼                                       │
 *   responseMapper(output)                    ▼ (microtask drain)
 *     │                                   eventEmitter.next()
 *     ▼                                       │
 *   auth_succeeded / auth_failed              ▼
 *                                         bus.dispatch
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
