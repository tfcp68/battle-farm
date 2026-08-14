import type { ComponentProps } from 'react';
import { useDraggable } from '@dnd-kit/react';
import type { DragType } from '~/features/drag-drop/dragModel';
import { CardFace } from './CardFace';

/**
 * A card that can be picked up.
 *
 * Separate from {@link CardFace} for one concrete reason: `useDraggable` has to
 * run unconditionally, and registering every card on the board — beds,
 * opponents' hands, the trade offer — would put dozens of dead draggables in
 * the manager. A caller opts in by choosing this component.
 *
 * Drag feedback is left at the library's default. It is a manager-level plugin
 * setting (`Feedback.configure({feedback: 'clone'})`), not a per-card one, so
 * if the default ever fights `useZoneTransition` it belongs on the provider —
 * not here.
 */
export function DraggableCard(
	props: ComponentProps<typeof CardFace> & {
		dragId: string;
		dragType: DragType;
		dragData: Record<string, unknown>;
		/** A card that cannot legally move right now still renders, just inert. */
		dragDisabled?: boolean;
	},
) {
	const { dragId, dragType, dragData, dragDisabled, ...face } = props;

	const { ref, isDragging } = useDraggable({
		id: dragId,
		type: dragType,
		data: dragData,
		disabled: dragDisabled,
	});

	return <CardFace {...face} elementRef={ref} dragging={isDragging} />;
}
