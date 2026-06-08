import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { getPlayerId } from '~/app/yantrix/register-functions';
import { fsmLogger } from '~/shared/lib/fsm/devLogger';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

/** One-shot packet emitted on boot if a player id is present in localStorage. */
interface AuthStatusPacket {
	playerId: string;
}

/**
 * Boot-time auth status source.
 *
 * On `start()`, checks `localStorage[playerId]`. If present, queues a microtask
 * that emits a single `AuthStatusPacket` — the inherited notifier fires the
 * bridge's `scheduleDrain`, which publishes `session_restored` to the bus.
 *
 * Class-based replacement for the function-style `createAuthStatusSource`
 * factory that used to return an object literal implementing `IEventSource`.
 */
export class AuthStatusDataSource extends AbstractWindowDataSource<AuthStatusPacket> {
	#started = false;

	constructor(opts: { id?: string } = {}) {
		super({
			id: opts.id ?? `auth_status_${uniqId(4)}`,
			responseMapper: (data: AuthStatusPacket): FollowUp[] => [
				{ event: WindowDomainEvents.session_restored, meta: { playerId: data.playerId } },
			],
		});
	}

	override start(): this {
		super.start();
		if (this.#started) return this;
		this.#started = true;

		const storedPlayerId = getPlayerId();
		fsmLogger()?.logSourceFire(
			'authStatus',
			WindowDomainEvents.session_restored,
			{ storedPlayerId },
			storedPlayerId ? 'localStorage has playerId' : 'no playerId in localStorage',
		);
		if (!storedPlayerId) return this;

		// Defer one microtask so the bus bridge has finished binding its
		// `setNotifier` before we emit — otherwise the inherited emit would
		// push into the queue with no notifier yet attached.
		queueMicrotask(() => {
			if (!this.isActive()) return;
			fsmLogger()?.logSourceFire(
				'authStatus',
				WindowDomainEvents.session_restored,
				{ playerId: storedPlayerId },
				'emitting session_restored (microtask)',
			);
			this.pushSessionRestored(storedPlayerId);
			fsmLogger()?.scheduleSnapshot('after session_restored emit');
		});

		return this;
	}

	override stop(): this {
		this.#started = false;
		return super.stop();
	}

	/** Exposed for tests / future re-emission paths. */
	pushSessionRestored(playerId: string): void {
		this.emit({ playerId });
	}
}
