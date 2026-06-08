import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { AbstractWindowDataSource, type FollowUp } from '../../shared/AbstractWindowDataSource';

/**
 * Discriminated result the lobby-commands resolver pushes into this source.
 *
 *  - `lobby_created_enriched` — follow-up emit of `lobby_created` with the real
 *    `lobbyId`/`gameId`. Used by both initial creation and `re_enter_lobby`.
 *  - `request_rejected` — emitted when `join_game_request` hits a
 *    `LobbyNotOpenError`.
 *  - `noop` — the command resolved with no follow-up event (most paths).
 */
export type LobbyCommandsOutput =
	| {
			kind: 'lobby_created_enriched';
			playerId: string;
			lobbyId: string;
			gameId: string | null;
			isHost: 0 | 1;
	  }
	| { kind: 'request_rejected'; playerId: string; lobbyId: string; reason: string }
	| { kind: 'noop' };

/**
 * Data Source half of the lobby-commands promise adapter. Mirrors
 * {@link AuthDataSource} — captures the `afterInit` setter via the shared
 * base, registers a `responseMapper` that fans the discriminated result out
 * to the matching follow-up event (or no event for `noop`).
 */
export class LobbyCommandsDataSource extends AbstractWindowDataSource<LobbyCommandsOutput> {
	constructor(opts: { id?: string } = {}) {
		super({
			id: opts.id ?? `lobby_commands_${uniqId(4)}`,
			responseMapper: (data: LobbyCommandsOutput): FollowUp[] => {
				switch (data.kind) {
					case 'lobby_created_enriched':
						return [
							{
								event: WindowDomainEvents.lobby_created,
								meta: {
									playerId: data.playerId,
									lobbyId: data.lobbyId,
									gameId: data.gameId,
									isHost: data.isHost,
								},
							},
						];
					case 'request_rejected':
						return [
							{
								event: WindowDomainEvents.request_rejected,
								meta: {
									playerId: data.playerId,
									lobbyId: data.lobbyId,
									reason: data.reason,
								},
							},
						];
					case 'noop':
						return [];
				}
			},
		});
	}

	/** Called by the paired Destination after its resolver completes. */
	push(data: LobbyCommandsOutput): void {
		this.emit(data);
	}
}
