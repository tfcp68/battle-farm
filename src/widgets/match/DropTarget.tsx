import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/react';
import { type DragType, type DropZone, dropZoneId } from '~/features/drag-drop/dragModel';

/**
 * A place a card may be dropped.
 *
 * `accept` is checked against the draggable's `type`, so a Market card never
 * lights up a bed and the player is told what is possible before they let go —
 * which is the whole reason to prefer dragging over two clicks here.
 *
 * `disabled` is for zones that exist but are shut right now: a bed that is
 * spent, a trade panel outside the TRADE phase. A disabled zone is not a drop
 * target at all, so nothing highlights and nothing is emitted — the machine
 * would have refused it anyway, this just says so a gesture earlier.
 */
export function DropTarget(props: {
	zone: DropZone;
	accept: DragType | DragType[];
	disabled?: boolean;
	className?: string;
	/** Added while a compatible card is hovering. */
	activeClassName?: string;
	children: ReactNode;
	onClick?: () => void;
	title?: string;
}) {
	const { zone, accept, disabled, className = '', activeClassName = 'drop-active', children, onClick, title } = props;

	const { ref, isDropTarget } = useDroppable({
		id: dropZoneId(zone),
		accept,
		disabled,
	});

	return (
		<div
			ref={ref}
			className={`${className}${isDropTarget ? ` ${activeClassName}` : ''}`}
			onClick={onClick}
			title={title}>
			{children}
		</div>
	);
}
