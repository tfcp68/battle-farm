import { uniqId } from '@yantrix/core';
import { type DriverEventName, driveMatch } from '~/entities/game';
import { GameDomainEvents } from '~/app/yantrix/gameDomainEvents';
import { getAppModelStore } from '~/app/yantrix/gameModel';
import { emitMatchEvent } from '~/app/yantrix/matchNet';
import { AbstractWindowDataDestination } from '../shared/AbstractWindowDataDestination';

interface DriverPacket {
	name: DriverEventName;
}

/**
 * Runs the match's clock: after an event has moved the model, asks
 * {@link driveMatch} what the rules say happens next and puts that on the wire.
 *
 * It sees the model *after* the Effect Layer because the layer subscribes to the
 * bus first (`attachGameEffects` runs before any `registerDestination`), which is
 * the whole reason the driver can be a pure read.
 *
 * Registered on every peer, effective only on the host: `emitMatchEvent` drops
 * engine events on a guest, so a guest's copy of this destination computes the
 * same answer and throws it away. That is cheaper than a host check and keeps
 * the two peers running identical code — a guest promoted to host later would
 * simply start being heard.
 */
export class MatchDriverDataDestination extends AbstractWindowDataDestination<DriverPacket> {
	constructor(opts: { id?: string } = {}) {
		super({
			id: opts.id ?? `match_driver_${uniqId(4)}`,
			triggers: {
				[GameDomainEvents.match_started]: () => ({ name: 'match_started' }),
				[GameDomainEvents.turn_phase_ended]: () => ({ name: 'turn_phase_ended' }),
				[GameDomainEvents.turn_ended]: () => ({ name: 'turn_ended' }),
			},
		});
	}

	protected resolve(packet: DriverPacket): null {
		for (const emission of driveMatch(packet.name, getAppModelStore().get().match)) {
			emitMatchEvent(emission.name, emission.meta);
		}
		return null;
	}
}
