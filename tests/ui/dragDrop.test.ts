import { describe, expect, it } from '@jest/globals';
import { asCardInstanceId, asPlayerId } from '~/entities/game';
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
const ME = asPlayerId('player-me');
const THEM = asPlayerId('player-them');

describe('drop zone ids', () => {
	it('round-trips every zone', () => {
		const zones: DropZone[] = [
			{ kind: 'bed', playerId: ME, bedIndex: 0 },
			{ kind: 'bed', playerId: ME, bedIndex: 3 },
			{ kind: 'discard' },
			{ kind: 'trade' },
			{ kind: 'hand' },
		];

		for (const zone of zones) {
			expect(parseDropZone(dropZoneId(zone))).toEqual(zone);
		}
	});

	/**
	 * The bug this file exists to keep out.
	 *
	 * dnd-kit keys its droppable registry by id and the last registration for a
	 * key evicts the previous one. The match screen renders the viewer's beds and
	 * then every opponent's, so a bed id that carried only its index made the
	 * opponent's bed N — which never accepts a drop — replace the viewer's bed N.
	 * Every plant-by-drag then landed on `target === null` and did nothing.
	 */
	it('gives each player their own bed zones', () => {
		expect(dropZoneId({ kind: 'bed', playerId: ME, bedIndex: 0 })).not.toBe(
			dropZoneId({ kind: 'bed', playerId: THEM, bedIndex: 0 }),
		);
	});

	it('refuses ids that are not ours', () => {
		expect(parseDropZone('bed:0')).toBeNull();
		expect(parseDropZone('zone:nowhere')).toBeNull();
		expect(parseDropZone(`zone:bed:${ME}:-1`)).toBeNull();
		expect(parseDropZone(`zone:bed:${ME}:x`)).toBeNull();
		// An index with nobody to own it is not a bed on this board.
		expect(parseDropZone('zone:bed:0')).toBeNull();
		expect(parseDropZone(`zone:bed::0`)).toBeNull();
		expect(parseDropZone(42)).toBeNull();
		expect(parseDropZone(undefined)).toBeNull();
	});
});

describe('what a drop means', () => {
	const hand = { type: DRAG_TYPES.handCard, cardId: CARD } as const;
	const market = { type: DRAG_TYPES.marketCard, slotIndex: 2 } as const;

	it('plants a hand card dropped on a bed', () => {
		expect(resolveDrop(hand, { kind: 'bed', playerId: ME, bedIndex: 1 })).toEqual({
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
	 * Dragging out of the Market names a slot, and naming it is the purchase —
	 * `shopping.mermaid` goes `BROWSING -> PURCHASED` on `CHOOSE_SLOT`. What this
	 * layer refuses to do is price it: which slot was picked is all a gesture can
	 * say, and the model decides what it costs.
	 */
	it('names a market slot, and leaves the price to the model', () => {
		expect(resolveDrop(market, { kind: 'hand' })).toEqual({ kind: 'pickSlot', slotIndex: 2 });
	});

	it('refuses gestures that mean nothing', () => {
		expect(resolveDrop(hand, { kind: 'hand' })).toBeNull();
		expect(resolveDrop(market, { kind: 'bed', playerId: ME, bedIndex: 0 })).toBeNull();
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
