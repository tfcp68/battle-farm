import { uniqId } from '@yantrix/core';
import WindowModeAutomata from '~/shared/lib/fsm/window/WindowModeAutomata';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { getCurrentPlayerId } from '~/entities/profile/currentProfile';
import { clearRoomCodeFromUrl, readRoomCodeFromUrl } from '~/shared/net/roomLink';
import { fsmLogger } from '~/shared/lib/fsm/devLogger';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

interface InvitePacket {
	code: string;
	playerId: string;
}

/**
 * Turns an invite link into a join request.
 *
 * The code is read at boot but held until the player can act on it: they need a
 * profile, and the mode FSM only accepts a join from `MAIN_MENU`. Someone
 * opening an invite without a nickname names themselves first and lands in the
 * room straight after.
 *
 * The URL is cleaned as it fires, so leaving the lobby doesn't bounce the player
 * back in.
 */
export class InviteLinkDataSource extends AbstractWindowDataSource<InvitePacket> {
	readonly #modeFSM: InstanceType<typeof WindowModeAutomata>;
	readonly #mainMenuState: number | null;
	#pendingCode: string | null = null;

	constructor(opts: { modeFSM: InstanceType<typeof WindowModeAutomata>; id?: string }) {
		super({
			id: opts.id ?? `invite_link_${uniqId(4)}`,
			responseMapper: (data: InvitePacket): FollowUp[] => [
				{
					event: WindowDomainEvents.join_game_request,
					meta: { lobbyId: data.code, playerId: data.playerId },
				},
			],
		});
		this.#modeFSM = opts.modeFSM;
		this.#mainMenuState = WindowModeAutomata.getState('MAIN_MENU');
	}

	override start(): this {
		super.start();
		this.#pendingCode = readRoomCodeFromUrl();
		if (this.#pendingCode) {
			fsmLogger()?.logSourceFire(
				'inviteLink',
				WindowDomainEvents.join_game_request,
				{ code: this.#pendingCode },
				'invite found in URL — waiting for a profile and the main menu',
			);
		}
		return this;
	}

	override stop(): this {
		this.#pendingCode = null;
		return super.stop();
	}

	/** Per-tick: fire as soon as the player has a profile and is back at the menu. */
	protected override pollTick(): void {
		const code = this.#pendingCode;
		if (!code) return;
		if (this.#modeFSM.state !== this.#mainMenuState) return;

		const playerId = getCurrentPlayerId();
		if (!playerId) return;

		this.#pendingCode = null;
		clearRoomCodeFromUrl();
		this.emit({ code, playerId });
	}
}
