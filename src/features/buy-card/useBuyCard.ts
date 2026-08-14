import { useFSM } from '@yantrix/react';
import { useMachines } from '~/app/providers/MachinesContext';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import { type ShoppingStateName, shoppingStateName } from '~/shared/lib/fsm/selectors';

interface ShoppingContext {
	slotIndex?: number | null;
}

/**
 * SHOPPING: one Market slot is one purchase. The previous two-step confirm
 * (pick a slot, then re-click a confirm bar before the coins move) was removed
 * in `feat(yantrix): drop the buy/fertilize confirm layers` — `shopping.mermaid`
 * now goes `BROWSING -> PURCHASED` on `CHOOSE_SLOT`, so the page renders no
 * bar and the player has one fewer click to lose a turn on.
 *
 * The shopping allowance (the 1d4/1d6/1d20 roll) is still enforced by the
 * model, not here.
 */
export function useBuyCard(): {
	/** The machine's own state name; `null` before it has started. */
	state: ShoppingStateName | null;
	pickSlot: (slotIndex: number) => void;
} {
	const { shopping } = useMachines();
	const { state: fsmState } = useFSM<ShoppingContext>(shopping.instance);

	return {
		state: shoppingStateName(fsmState),

		pickSlot(slotIndex: number) {
			emitDomainEvent(MatchUiEvents.market_slot_picked, { slotIndex });
		},
	};
}
