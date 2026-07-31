import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { getPlayerId } from '~/shared/lib/fsm/functions';
import { fsmLogger } from '~/shared/lib/fsm/devLogger';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

interface ProfileStatusPacket {
	playerId: string;
}

/**
 * Boot-time profile check: a player who already named themselves skips to the
 * menu, everyone else stays on the nickname screen.
 */
export class ProfileStatusDataSource extends AbstractWindowDataSource<ProfileStatusPacket> {
	#started = false;

	constructor(opts: { id?: string } = {}) {
		super({
			id: opts.id ?? `profile_status_${uniqId(4)}`,
			responseMapper: (data: ProfileStatusPacket): FollowUp[] => [
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
			'profileStatus',
			WindowDomainEvents.session_restored,
			{ storedPlayerId },
			storedPlayerId ? 'profile present' : 'no profile yet',
		);
		if (!storedPlayerId) return this;

		// Defer one microtask so the boot event is enqueued after startYantrixCore
		// finishes wiring all sources and destinations (so Navigation is registered).
		queueMicrotask(() => {
			if (!this.isActive()) return;
			this.emit({ playerId: storedPlayerId });
			fsmLogger()?.scheduleSnapshot('after session_restored emit');
		});

		return this;
	}

	override stop(): this {
		this.#started = false;
		return super.stop();
	}
}
