import { asPlayerId, type CardInstanceId, type PlayerId } from '~/entities/game';

/**
 * What a drag means, decided without React or the DOM.
 *
 * A drop is not a new kind of move. Dragging a crop onto a bed is the same two
 * decisions as clicking it and then clicking the bed, and it goes out as the
 * same two events — the machines stay the only place that knows whether a pick
 * is legal or what it completes. This module is just the translation from
 * "which element landed on which" into that vocabulary, which is why it is pure
 * and testable: the gesture is the only thing that changed.
 */

export const DRAG_TYPES = {
	/** A card in the viewer's own hand. */
	handCard: 'hand-card',
	/** A card sitting in a Market slot. */
	marketCard: 'market-card',
} as const;

export type DragType = (typeof DRAG_TYPES)[keyof typeof DRAG_TYPES];

/**
 * Where a card may be dropped.
 *
 * A bed is the only zone that exists more than once on the board, so it is the
 * only one that needs coordinates — and it needs *both* of them. `bedIndex`
 * alone names a bed on somebody's farm, not a bed on the table: every player has
 * a bed 0. See {@link dropZoneId} for what that costs when it is left out.
 *
 * Whether a given bed accepts the drop is still the page's call (`canDrop` in
 * `GamePage`), which is what keeps an opponent's bed shut; `playerId` here is
 * about identity, not permission.
 */
export type DropZone =
	| { kind: 'bed'; playerId: PlayerId; bedIndex: number }
	| { kind: 'discard' }
	| { kind: 'trade' }
	| { kind: 'hand' };

export type DragSource =
	| { type: typeof DRAG_TYPES.handCard; cardId: CardInstanceId }
	| { type: typeof DRAG_TYPES.marketCard; slotIndex: number };

/**
 * What the drop asks the game to do. Deliberately named after the player's
 * intent rather than the event: one intent can be several events, and
 * `pickSlot` is explicitly *not* a purchase.
 */
export type DragIntent =
	| { kind: 'plant'; cardId: CardInstanceId; bedIndex: number }
	| { kind: 'play'; cardId: CardInstanceId }
	| { kind: 'offer'; cardId: CardInstanceId }
	| { kind: 'pickSlot'; slotIndex: number };

const ZONE_PREFIX = 'zone';

/**
 * Droppable ids are strings because a bed carries its coordinates in the id.
 *
 * **The id has to be unique across the whole board.** dnd-kit keys its droppable
 * registry by id and the last registration for a key evicts the one before it —
 * so while a bed was named by its index alone, the opponents' `<GardenBeds>`
 * (rendered after the viewer's, and never given a `canDrop`) replaced the
 * viewer's bed of the same index with a disabled one. Every plant-by-drag then
 * ended on `target === null` and silently did nothing, leaving click-then-click
 * as the only way to plant.
 */
export function dropZoneId(zone: DropZone): string {
	return zone.kind === 'bed'
		? `${ZONE_PREFIX}:bed:${zone.playerId}:${zone.bedIndex}`
		: `${ZONE_PREFIX}:${zone.kind}`;
}

export function parseDropZone(id: unknown): DropZone | null {
	if (typeof id !== 'string') return null;
	const parts = id.split(':');
	if (parts[0] !== ZONE_PREFIX) return null;

	switch (parts[1]) {
		case 'bed': {
			// `owner:index` exactly — a bed with no owner is not a place on this board.
			if (parts.length !== 4) return null;
			const owner = parts[2];
			const bedIndex = Number(parts[3]);
			if (!owner) return null;
			return Number.isInteger(bedIndex) && bedIndex >= 0
				? { kind: 'bed', playerId: asPlayerId(owner), bedIndex }
				: null;
		}
		case 'discard':
			return { kind: 'discard' };
		case 'trade':
			return { kind: 'trade' };
		case 'hand':
			return { kind: 'hand' };
		default:
			return null;
	}
}

function assertNever(value: never): never {
	throw new Error(`Unhandled drag case: ${JSON.stringify(value)}`);
}

/**
 * The whole rulebook of this layer.
 *
 * Anything not listed is `null`, and `null` means the card springs back — the
 * gesture was legible but meaningless (a crop dropped on the discard, a Market
 * card dropped on a bed). Whether the *move* is legal is not decided here: the
 * phase machine refuses it a moment later, exactly as it refuses a bad click.
 */
export function resolveDrop(source: DragSource, target: DropZone): DragIntent | null {
	switch (source.type) {
		case DRAG_TYPES.handCard:
			switch (target.kind) {
				case 'bed':
					return { kind: 'plant', cardId: source.cardId, bedIndex: target.bedIndex };
				case 'discard':
					return { kind: 'play', cardId: source.cardId };
				case 'trade':
					return { kind: 'offer', cardId: source.cardId };
				case 'hand':
					// Back where it came from.
					return null;
				default:
					return assertNever(target);
			}
		case DRAG_TYPES.marketCard:
			// Naming the slot *is* the purchase: `shopping.mermaid` goes
			// `BROWSING -> PURCHASED` on `CHOOSE_SLOT`, so the coins leave on this
			// one gesture. The intent keeps the older name because it is still the
			// slot the drop names, not the card — the model prices it.
			return target.kind === 'hand' ? { kind: 'pickSlot', slotIndex: source.slotIndex } : null;
		default:
			return assertNever(source);
	}
}

/** Reads a draggable's `data` back into a source, or `null` if it is not ours. */
export function parseDragSource(type: unknown, data: unknown): DragSource | null {
	const fields = (data ?? {}) as { cardId?: unknown; slotIndex?: unknown };

	if (type === DRAG_TYPES.handCard) {
		return typeof fields.cardId === 'string'
			? { type: DRAG_TYPES.handCard, cardId: fields.cardId as CardInstanceId }
			: null;
	}
	if (type === DRAG_TYPES.marketCard) {
		return typeof fields.slotIndex === 'number' && fields.slotIndex >= 0
			? { type: DRAG_TYPES.marketCard, slotIndex: fields.slotIndex }
			: null;
	}
	return null;
}
