import { describe, expect, it } from '@jest/globals';
import { asCardInstanceId } from '~/entities/game';
import {
	DRAG_TYPES,
	type DropZone,
	dropZoneId,
	parseDragSource,
	parseDropZone,
	resolveDrop,
} from '~/features/drag-drop/dragModel';

/**
 * The drag layer's entire rulebook, tested without a DOM.
 *
 * What matters here is that a drop never invents a move: it maps onto the same
 * intents a click produces, and anything it cannot map onto is refused rather
 * than guessed at.
 */

const CARD = asCardInstanceId('card-1');

describe('drop zone ids', () => {
	it('round-trips every zone', () => {
		const zones: DropZone[] = [
			{ kind: 'bed', bedIndex: 0 },
			{ kind: 'bed', bedIndex: 3 },
			{ kind: 'discard' },
			{ kind: 'trade' },
			{ kind: 'hand' },
		];

		for (const zone of zones) {
			expect(parseDropZone(dropZoneId(zone))).toEqual(zone);
		}
	});

	it('refuses ids that are not ours', () => {
		expect(parseDropZone('bed:0')).toBeNull();
		expect(parseDropZone('zone:nowhere')).toBeNull();
		expect(parseDropZone('zone:bed:-1')).toBeNull();
		expect(parseDropZone('zone:bed:x')).toBeNull();
		expect(parseDropZone(42)).toBeNull();
		expect(parseDropZone(undefined)).toBeNull();
	});
});

describe('what a drop means', () => {
	const hand = { type: DRAG_TYPES.handCard, cardId: CARD } as const;
	const market = { type: DRAG_TYPES.marketCard, slotIndex: 2 } as const;

	it('plants a hand card dropped on a bed', () => {
		expect(resolveDrop(hand, { kind: 'bed', bedIndex: 1 })).toEqual({
			kind: 'plant',
			cardId: CARD,
			bedIndex: 1,
		});
	});

	it('plays a hand card dropped on the discard', () => {
		expect(resolveDrop(hand, { kind: 'discard' })).toEqual({ kind: 'play', cardId: CARD });
	});

	it('offers a hand card dropped on the trade panel', () => {
		expect(resolveDrop(hand, { kind: 'trade' })).toEqual({ kind: 'offer', cardId: CARD });
	});

	/**
	 * The one asymmetry worth stating out loud: dragging out of the Market picks
	 * a slot and stops. Coins leave on the confirm, because `shopping.mermaid`
	 * puts CONFIRM between BROWSING and PURCHASED on purpose.
	 */
	it('picks a market slot without buying it', () => {
		expect(resolveDrop(market, { kind: 'hand' })).toEqual({ kind: 'pickSlot', slotIndex: 2 });
	});

	it('refuses gestures that mean nothing', () => {
		expect(resolveDrop(hand, { kind: 'hand' })).toBeNull();
		expect(resolveDrop(market, { kind: 'bed', bedIndex: 0 })).toBeNull();
		expect(resolveDrop(market, { kind: 'discard' })).toBeNull();
		expect(resolveDrop(market, { kind: 'trade' })).toBeNull();
	});
});

describe('reading a draggable back', () => {
	it('accepts what the widgets attach', () => {
		expect(parseDragSource(DRAG_TYPES.handCard, { cardId: CARD })).toEqual({
			type: DRAG_TYPES.handCard,
			cardId: CARD,
		});
		expect(parseDragSource(DRAG_TYPES.marketCard, { slotIndex: 0 })).toEqual({
			type: DRAG_TYPES.marketCard,
			slotIndex: 0,
		});
	});

	it('refuses anything else, rather than dragging a half-formed move', () => {
		expect(parseDragSource(DRAG_TYPES.handCard, {})).toBeNull();
		expect(parseDragSource(DRAG_TYPES.handCard, { cardId: 7 })).toBeNull();
		expect(parseDragSource(DRAG_TYPES.marketCard, { slotIndex: -1 })).toBeNull();
		expect(parseDragSource(DRAG_TYPES.marketCard, { cardId: CARD })).toBeNull();
		expect(parseDragSource('something-else', { cardId: CARD })).toBeNull();
		expect(parseDragSource(undefined, undefined)).toBeNull();
	});
});
