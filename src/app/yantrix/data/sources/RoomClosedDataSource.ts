import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import type { Services } from '~/shared/services/createServices';
import { fsmLogger } from '~/shared/lib/fsm/devLogger';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

interface RoomClosedPacket {
	lobbyId: string;
}

/**
 * Publishes `lobby_closed` when the room disappears underneath the player.
 *
 * A guest learns the host is gone through `onPeerLeave`, which clears the room
 * state — but the FSM cannot see that, and without an event it sits in
 * `GAME_LOBBY` rendering an empty lobby forever.
 *
 * Only the non-null → null edge emits, so the `leave()` performed by the
 * `lobby_closed` handler itself does not loop.
 */
export class RoomClosedDataSource extends AbstractWindowDataSource<RoomClosedPacket> {
	readonly #services: Services;
	#unsubscribe: (() => void) | null = null;
	#lastCode: string | null = null;

	constructor(opts: { services: Services; id?: string }) {
		super({
			id: opts.id ?? `room_closed_${uniqId(4)}`,
			responseMapper: (data: RoomClosedPacket): FollowUp[] => [
				{ event: WindowDomainEvents.lobby_closed, meta: { lobbyId: data.lobbyId } },
			],
		});
		this.#services = opts.services;
	}

	override start(): this {
		super.start();
		this.#unsubscribe = this.#services.rooms.subscribe((state) => {
			if (state) {
				this.#lastCode = state.code;
				return;
			}
			const closedCode = this.#lastCode;
			this.#lastCode = null;
			if (!closedCode) return;

			fsmLogger()?.logSourceFire(
				'roomClosed',
				WindowDomainEvents.lobby_closed,
				{ lobbyId: closedCode },
				'room state went empty',
			);
			this.emit({ lobbyId: closedCode });
		});
		return this;
	}

	override stop(): this {
		this.#unsubscribe?.();
		this.#unsubscribe = null;
		this.#lastCode = null;
		return super.stop();
	}
}
