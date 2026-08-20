import { uniqId } from '@yantrix/core';
import type { PlayerId } from '~/entities/game';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { GameDomainEvents } from '~/app/yantrix/gameDomainEvents';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { AbstractWindowDataDestination, type DomainEvent } from '../shared/AbstractWindowDataDestination';

interface OutcomePacket {
	scoreBoard: Record<PlayerId, number>;
}

/**
 * Hands the match's ending to the window flow: `match_ended` closes the game,
 * `game_end` moves the mode FSM `IN_GAME → SCORE_SCREEN` and with it the route.
 *
 * The two live in different vocabularies on purpose — the match knows about
 * scores, the window about screens — and this is the one place they meet. Every
 * peer applies `match_ended` off the stream, so every peer ends up on the score
 * screen without the host having to say so twice.
 */
export class MatchOutcomeDataDestination extends AbstractWindowDataDestination<OutcomePacket> {
	constructor(opts: { id?: string } = {}) {
		super({
			id: opts.id ?? `match_outcome_${uniqId(4)}`,
			triggers: {
				[GameDomainEvents.match_ended]: (event: DomainEvent) => ({
					scoreBoard: (event.meta as { scoreBoard?: Record<PlayerId, number> })?.scoreBoard ?? {},
				}),
			},
		});
	}

	protected resolve(packet: OutcomePacket): null {
		emitDomainEvent(WindowDomainEvents.game_end, { scoreBoard: packet.scoreBoard });
		return null;
	}
}
