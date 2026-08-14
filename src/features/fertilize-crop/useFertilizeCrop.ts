import { useFSM } from '@yantrix/react';
import { useMachines } from '~/app/providers/MachinesContext';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import { type FertilizeStateName, fertilizeStateName } from '~/shared/lib/fsm/selectors';

interface FertilizingContext {
	bedIndex?: number | null;
}

/**
 * FERTILIZE: one fertilizer takes one turn off one of your crops' Reap Timers.
 *
 * Two steps, like shopping: a fertilizer spent on the wrong bed cannot be taken
 * back, and `fertilizing.mermaid` draws the confirm as CROP_CONFIRM. The machine
 * refuses to open at all when there is no fertilizer or no crop (`canFertilize`),
 * so the page has no such rule of its own.
 */
export function useFertilizeCrop(): {
	/** The machine's own state name; `null` before it has started. */
	state: FertilizeStateName | null;
	/** The bed awaiting confirmation, or `null` while choosing. */
	pendingBed: number | null;
	pickCrop: (bedIndex: number) => void;
	confirmFertilize: () => void;
	cancel: () => void;
} {
	const { fertilizing } = useMachines();
	const { state: fsmState, getContext } = useFSM<FertilizingContext>(fertilizing.instance);

	const raw = getContext()?.context?.bedIndex;
	const pendingBed = typeof raw === 'number' && raw >= 0 ? raw : null;

	return {
		state: fertilizeStateName(fsmState),
		pendingBed,

		pickCrop(bedIndex: number) {
			emitDomainEvent(MatchUiEvents.fertilize_crop_picked, { bedIndex });
		},

		confirmFertilize() {
			if (pendingBed === null) return;
			emitDomainEvent(MatchUiEvents.fertilize_confirmed, { bedIndex: pendingBed });
		},

		cancel() {
			emitDomainEvent(MatchUiEvents.selection_cancelled, null);
		},
	};
}
