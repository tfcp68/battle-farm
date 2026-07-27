import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import type { Services } from '~/shared/services/createServices';
import { getCurrentPlayerId } from '~/entities/profile/currentProfile';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

type StatusPacket =
	| { kind: 'approved'; playerId: string; lobbyId: string }
	| { kind: 'rejected'; playerId: string; lobbyId: string };

/**
 * Guest-side answer to a join request. The host replies over the data channel,
 * so there is nothing to poll or diff — the verdict arrives and becomes an event.
 */
export class RoomRequestResultDataSource extends AbstractWindowDataSource<StatusPacket> {
	readonly #services: Services;
	#unsubscribe: (() => void) | null = null;

	constructor(opts: { services: Services; id?: string }) {
		super({
			id: opts.id ?? `room_request_result_${uniqId(4)}`,
			responseMapper: (data: StatusPacket): FollowUp[] => [
				{
					event:
						data.kind === 'approved'
							? WindowDomainEvents.mode_join_accepted
							: WindowDomainEvents.request_rejected,
					meta: { playerId: data.playerId, lobbyId: data.lobbyId, gameId: data.lobbyId },
				},
			],
		});
		this.#services = opts.services;
	}

	override start(): this {
		super.start();
		this.#unsubscribe = this.#services.rooms.onRequestResult((approved) => {
			const playerId = getCurrentPlayerId();
			const lobbyId = this.#services.rooms.code;
			if (!playerId || !lobbyId) return;
			this.emit({ kind: approved ? 'approved' : 'rejected', playerId, lobbyId });
		});
		return this;
	}

	override stop(): this {
		this.#unsubscribe?.();
		this.#unsubscribe = null;
		return super.stop();
	}
}
