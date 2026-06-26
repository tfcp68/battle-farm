import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { getPlayerId } from '~/shared/lib/fsm/functions';
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
 * that enqueues a single `AuthStatusPacket`; CoreLoop drains it on its tick and
 * publishes `session_restored` to the bus.
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

		// Defer one microtask so the boot event is enqueued after startYantrixCore
		// finishes wiring all sources and destinations (so Navigation is registered).
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
