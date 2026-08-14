import { useFSM } from '@yantrix/react';
import { useMachines } from '~/app/providers/MachinesContext';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import { type FertilizeStateName, fertilizeStateName } from '~/shared/lib/fsm/selectors';

interface FertilizingContext {
	bedIndex?: number | null;
}

/**
 * FERTILIZE: one crop is one fertilizer. The two-step confirm (pick a crop,
 * then re-click a confirm bar before the resource moves) is gone —
 * `fertilizing.mermaid` now goes `CROP_SELECTION -> FERTILIZED` on
 * `CHOOSE_CROP`, so a click on a growing crop immediately spends one
 * fertilizer and shaves a turn off its reap timer.
 *
 * The `canFertilize` guard in the FSM still refuses to open at all when
 * there is no fertilizer or no growing crop, so the page has no such rule of
 * its own.
 */
export function useFertilizeCrop(): {
	/** The machine's own state name; `null` before it has started. */
	state: FertilizeStateName | null;
	pickCrop: (bedIndex: number) => void;
} {
	const { fertilizing } = useMachines();
	const { state: fsmState } = useFSM<FertilizingContext>(fertilizing.instance);

	return {
		state: fertilizeStateName(fsmState),

		pickCrop(bedIndex: number) {
			emitDomainEvent(MatchUiEvents.fertilize_crop_picked, { bedIndex });
		},
	};
}
