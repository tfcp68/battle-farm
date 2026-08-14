import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import { lobbyKeys } from '~/entities/lobby/keys';
import type { RoomPlayer } from '~/entities/room/types';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { emitMatchEvent } from '~/app/yantrix/matchNet';
import { AbstractWindowDataDestination } from '../shared/AbstractWindowDataDestination';
import { buildMatchSetup } from './matchSetup';

interface MatchSetupPacket {
	gameId: string;
	playerIds: string[];
	lobbyId: string;
}

/**
 * The seam between the window flow and the match engine: when the mode FSM
 * announces the start, this destination assembles the seats and emits
 * `match_created` — which the Effect Matrix answers by dealing the match
 * (`createMatch`) — followed by `match_started`.
 *
 * The event carries `(seed, seats)` rather than a dealt model: `createMatch` is
 * pure, so every peer that sees the same event builds a byte-identical opening
 * position and the setup never travels over the wire.
 *
 * The seed is a hash of the room code (`seedFromRoomCode`) — deterministic
 * across peers with no extra coordination, and the reason a guest that misses
 * this event entirely still ends up with the same deal once the stream replays.
 *
 * Runs on every peer but only speaks on the host: `match_created` and
 * `match_started` are engine events, and `emitMatchEvent` drops those on a
 * guest. A guest gets both back through the channel instead, with the host's
 * roster rather than its own — which is exactly the point, since a guest may
 * not have the full lobby cached yet.
 *
 * Triggered by `game_start` (what the Start button emits) rather than the mode
 * FSM's `game_started`. `game_started` is declared on GAME_STARTING, which is a
 * `+ByPass` state: the machine passes straight through it to IN_GAME inside one
 * dispatch, so the emitter registered for that state is never consulted and the
 * event never reaches the bus. Both carry the same `{gameId, playerIds,
 * lobbyId}`, so nothing is lost — and subscribing to both would deal twice.
 */
export class MatchSetupDataDestination extends AbstractWindowDataDestination<MatchSetupPacket> {
	readonly #queryClient: QueryClient;

	constructor(opts: { queryClient: QueryClient; id?: string }) {
		super({
			id: opts.id ?? `match_setup_${uniqId(4)}`,
			triggers: {
				[WindowDomainEvents.game_start]: (event): MatchSetupPacket | null => {
					const meta = (event.meta ?? {}) as Partial<{ gameId: string; playerIds: string[]; lobbyId: string }>;
					if (!meta.gameId || !Array.isArray(meta.playerIds) || meta.playerIds.length === 0) return null;
					return { gameId: meta.gameId, playerIds: meta.playerIds, lobbyId: meta.lobbyId ?? meta.gameId };
				},
			},
		});
		this.#queryClient = opts.queryClient;
	}

	protected resolve(packet: MatchSetupPacket): null {
		const roster =
			this.#queryClient.getQueryData<RoomPlayer[]>(lobbyKeys.playersByLobbyId(packet.lobbyId)) ?? [];

		emitMatchEvent('match_created', buildMatchSetup(packet, roster));
		emitMatchEvent('match_started', null);
		return null;
	}
}
