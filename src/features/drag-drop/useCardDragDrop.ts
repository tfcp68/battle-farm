import { useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/react';
import { useBuyCard } from '~/features/buy-card/useBuyCard';
import { useCardSelection } from '~/features/play-card/useCardSelection';
import { useTradeCards } from '~/features/trade-cards/useTradeCards';
import { parseDragSource, parseDropZone, resolveDrop } from './dragModel';

/**
 * Turns a finished drag into the same events a click would have produced.
 *
 * There is no drag-specific path into the game. Every branch below calls a
 * feature hook the click handlers already call, so a dropped card meets the
 * same machine, the same guard and the same commit state — and a drop onto a
 * bed the rules forbid is refused by `PlayingCardsAutomata`, not by a check
 * written a second time here.
 *
 * What the drag layer *does* decide is whether the gesture is legible at all:
 * a Market card dropped on a bed means nothing and never reaches the bus.
 */
export function useCardDragDrop(): { onDragEnd: (event: DragEndEvent) => void } {
	const selection = useCardSelection();
	const trade = useTradeCards();
	const shopping = useBuyCard();

	const { offered } = trade;

	const onDragEnd = useCallback(
		(event: DragEndEvent) => {
			if (event.canceled) return;

			const { source, target } = event.operation;
			if (!source || !target) return;

			const from = parseDragSource(source.type, source.data);
			const to = parseDropZone(target.id);
			if (!from || !to) return;

			const intent = resolveDrop(from, to);
			if (!intent) return;

			switch (intent.kind) {
				case 'plant':
					selection.plantCard(intent.cardId, intent.bedIndex);
					return;
				case 'play':
					// One event: an Action Card with no target resolves on the spot,
					// and one that needs a target opens the overlay, exactly as a
					// click on it would.
					selection.pickCard(intent.cardId);
					return;
				case 'offer':
					// Dropping means *add*. The toggle belongs to the click, where
					// hitting the same card twice is how a player changes their mind.
					if (!offered.includes(intent.cardId)) trade.toggleCard(intent.cardId);
					return;
				case 'pickSlot':
					shopping.pickSlot(intent.slotIndex);
					return;
			}
		},
		[selection, trade, shopping, offered],
	);

	return { onDragEnd };
}
