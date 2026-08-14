import { useFSM } from '@yantrix/react';
import { useMachines } from '~/app/providers/MachinesContext';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import { type ShoppingStateName, shoppingStateName } from '~/shared/lib/fsm/selectors';

interface ShoppingContext {
	slotIndex?: number | null;
}

/**
 * SHOPPING: take a Market slot, in two steps.
 *
 * The confirm is the diagram's, not an invention: `shopping.mermaid` has always
 * had CONFIRM_TRADE between browsing and buying, and a phase that spends coins
 * on a single click is one misclick away from a lost turn. The roll still caps
 * how many times the second step may land — that check is the model's.
 */
export function useBuyCard(): {
	/** The machine's own state name; `null` before it has started. */
	state: ShoppingStateName | null;
	/** The slot awaiting confirmation, or `null` while browsing. */
	pendingSlot: number | null;
	pickSlot: (slotIndex: number) => void;
	confirmBuy: () => void;
	cancel: () => void;
} {
	const { shopping } = useMachines();
	const { state: fsmState, getContext } = useFSM<ShoppingContext>(shopping.instance);

	const raw = getContext()?.context?.slotIndex;
	const pendingSlot = typeof raw === 'number' && raw >= 0 ? raw : null;

	return {
		state: shoppingStateName(fsmState),
		pendingSlot,

		pickSlot(slotIndex: number) {
			emitDomainEvent(MatchUiEvents.market_slot_picked, { slotIndex });
		},

		confirmBuy() {
			if (pendingSlot === null) return;
			emitDomainEvent(MatchUiEvents.market_purchase_confirmed, { slotIndex: pendingSlot });
		},

		cancel() {
			emitDomainEvent(MatchUiEvents.selection_cancelled, null);
		},
	};
}
