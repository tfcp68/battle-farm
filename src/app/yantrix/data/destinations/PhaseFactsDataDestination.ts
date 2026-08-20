import { uniqId } from '@yantrix/core';
import type { PlayerId, TurnPhase } from '~/entities/game';
import type { AppModel } from '~/entities/game';
import type { IModelStore } from '~/shared/lib/model';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import { AbstractWindowDataDestination, type DomainEvent } from '../shared/AbstractWindowDataDestination';
import { buildPhaseFacts, type PhaseFactsPacket } from './phaseFacts';

/**
 * Turns the turn machine's "I am in SHOPPING now" into the phase machine's
 * "here is what you may buy".
 *
 * The two halves exist because they answer different questions. *When* a phase
 * begins is a transition, and `TurnLoopAutomata` owns it. *What* the phase
 * machine's opening guard needs — coins, ripe crops, the hand — is a read of
 * the model, which no diagram can do. This destination is the seam, and it is
 * the whole replacement for the boolean-per-signal edge detector that used to
 * diff the model on every commit.
 *
 * Reading the model here rather than in the emit meta is deliberate: by the
 * time this resolves, the Effect Layer has already committed `advancePhase` for
 * the same `turn_phase_ended`. That ordering is guaranteed, not lucky — every
 * synchronous bus subscriber runs before `Promise.all(promiseStack)` puts an
 * emitted event back on the stack (`EventBus._processEvents`).
 */

const PHASE_BY_EVENT: Record<number, TurnPhase> = {
	[MatchUiEvents.harvest_phase_opened]: 'HARVEST',
	[MatchUiEvents.shopping_phase_opened]: 'SHOPPING',
	[MatchUiEvents.trade_phase_opened]: 'TRADE',
	[MatchUiEvents.play_phase_opened]: 'PLAYING',
	[MatchUiEvents.fertilize_phase_opened]: 'FERTILIZE',
};

export class PhaseFactsDataDestination extends AbstractWindowDataDestination<PhaseFactsPacket> {
	/**
	 * The last window announced. Trap 7: the emitter re-fires on every accepted
	 * dispatch while the turn machine rests in a phase state, and re-announcing
	 * an open phase would reset a selection the player is halfway through.
	 */
	#lastWindow: string | null = null;

	constructor(opts: { store: IModelStore<AppModel>; getViewerId: () => PlayerId | null; id?: string }) {
		const select = (event: DomainEvent): PhaseFactsPacket | null => {
			const phase = event.event === null ? undefined : PHASE_BY_EVENT[event.event];
			if (!phase) return null;
			return buildPhaseFacts(phase, opts.store.get().match, opts.getViewerId());
		};

		super({
			id: opts.id ?? `phase_facts_${uniqId(4)}`,
			triggers: {
				[MatchUiEvents.harvest_phase_opened]: select,
				[MatchUiEvents.shopping_phase_opened]: select,
				[MatchUiEvents.trade_phase_opened]: select,
				[MatchUiEvents.play_phase_opened]: select,
				[MatchUiEvents.fertilize_phase_opened]: select,
			},
		});
	}

	protected resolve(packet: PhaseFactsPacket): null {
		if (packet.window === this.#lastWindow) return null;
		this.#lastWindow = packet.window;

		emitDomainEvent(MatchUiEvents[packet.open], packet.meta);
		return null;
	}
}
