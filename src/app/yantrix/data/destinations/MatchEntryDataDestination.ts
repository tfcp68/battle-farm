import { uniqId } from '@yantrix/core';
import type WindowModeAutomata from '~/shared/lib/fsm/window/WindowModeAutomata';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { GameDomainEvents } from '~/app/yantrix/gameDomainEvents';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { AbstractWindowDataDestination, type DomainEvent } from '../shared/AbstractWindowDataDestination';
import { buildMatchEntry, type MatchEntryPacket } from './matchEntry';

/**
 * The way into a match, mirroring {@link MatchOutcomeDataDestination}'s way out:
 * `match_created` opens the game, `game_start` moves the mode FSM `GAME_LOBBY →
 * GAME_STARTING → IN_GAME` and with it the route.
 *
 * The host reaches IN_GAME by pressing Start; this is how everyone else does.
 * A guest only ever learns the match's lifecycle from the stream, so without
 * this its window flow would stay in the lobby for the whole game — the model
 * dealt, the machines following along, and nothing on screen but the roster.
 *
 * The guard is {@link buildMatchEntry}'s, and it is a state check rather than a
 * role check: see there for why that keeps the host from dealing twice.
 */
export class MatchEntryDataDestination extends AbstractWindowDataDestination<MatchEntryPacket> {
	constructor(opts: { modeFSM: InstanceType<typeof WindowModeAutomata>; id?: string }) {
		super({
			id: opts.id ?? `match_entry_${uniqId(4)}`,
			triggers: {
				[GameDomainEvents.match_created]: (event: DomainEvent): MatchEntryPacket | null =>
					buildMatchEntry(opts.modeFSM.state, event.meta),
			},
		});
	}

	protected resolve(packet: MatchEntryPacket): null {
		emitDomainEvent(WindowDomainEvents.game_start, packet);
		return null;
	}
}
