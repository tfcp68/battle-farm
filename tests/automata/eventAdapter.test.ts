import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import AutomataEventAdapter from '~/src/automata/EventAdapter';
import arraySample from '~/src/utils/arraySample';
import { lengthArray } from '~/src/utils/lengthArray';
import { sampleRange } from '~/src/utils/sampleRange';
import { TTestAction, TTestContext, TTestEvent, TTestEventMeta, TTestPayload, TTestState } from '../fixtures/fsm';

class EventAdapterTest extends AutomataEventAdapter<
	TTestState,
	TTestAction,
	TTestEvent,
	TTestContext<TTestState>,
	TTestPayload<TTestAction>,
	TTestEventMeta<TTestEvent>
> {
	constructor() {
		super();
	}
}

describe(`EventAdapter`, () => {
	let sampleInstance: EventAdapterTest = new EventAdapterTest();
	beforeEach(() => {
		jest.restoreAllMocks();
		jest.clearAllTimers();
		sampleInstance = new EventAdapterTest();
	});
	describe('constructor', () => {
		test('returns an instance of AutomataEventAdapter', () => {
			expect(sampleInstance).toBeInstanceOf(AutomataEventAdapter);
		});
	});

	describe('getObservedEvents', () => {
		test('returns an empty array by default', () => {
			expect(sampleInstance.getObservedEvents()).toMatchObject([]);
		});
		test('returns observed events', () => {
			const sampleEvents = arraySample(
				new Array(1000).fill(null).map((v, ix) => ix),
				sampleRange(3, 5)
			);
			sampleEvents.forEach((eventId) =>
				sampleInstance.addEventListener(eventId, () => ({
					action: eventId,
					payload: null,
				}))
			);

			const observedEvents = sampleInstance.getObservedEvents();
			sampleEvents.forEach((eventId) => {
				expect(observedEvents).toContainEqual(eventId);
			});
			expect(observedEvents).toHaveLength(sampleEvents.length);
		});
	});

	describe('getObservedStates', () => {
		test('returns an empty array by default', () => {
			expect(sampleInstance.getObservedStates()).toMatchObject([]);
		});
		test('returns observed states', () => {
			const sampleStates = arraySample(
				new Array(1000).fill(null).map((v, ix) => ix),
				sampleRange(3, 5)
			);
			sampleStates.forEach((stateId) =>
				sampleInstance.addEventEmitter(stateId, () => ({
					event: stateId,
					meta: null,
				}))
			);

			const observedStates = sampleInstance.getObservedStates();
			sampleStates.forEach((stateId) => {
				expect(observedStates).toContainEqual(stateId);
			});
			expect(observedStates).toHaveLength(sampleStates.length);
		});
	});

	describe('Event Handling', () => {
		let sampleEvents: number[] = [];
		const defaultMeta = -1;

		describe('addEventListener', () => {
			const sampleEvent = sampleRange(0, 100);
			const sampleAction = sampleRange(0, 100);
			beforeEach(() => {
				sampleInstance.addEventListener(sampleEvent, ({ event, meta }) => ({
					action: sampleAction,
					payload: {
						payload: sampleRange(0, 100),
					},
				}));
			});
			test('actually adds an observer', () => {
				const testEvent = sampleRange(100, 200);
				sampleInstance.addEventListener(testEvent, ({ event, meta }) => ({
					action: sampleAction,
					payload: {
						payload: sampleEvent,
					},
				}));
				expect(sampleInstance.getObservedEvents()).toMatchObject([sampleEvent, testEvent] as Record<
					number,
					number
				>);
			});

			test('returns an unsubscribe function', () => {
				const testEvent = sampleRange(100, 200);
				const unsubscribe = sampleInstance.addEventListener(testEvent, ({ event, meta }) => ({
					action: sampleAction,
					payload: {
						payload: sampleRange(0, 100),
					},
				}));
				expect(unsubscribe).toBeInstanceOf(Function);
				if (unsubscribe) unsubscribe();
				expect(sampleInstance.getObservedEvents()).toMatchObject([sampleEvent] as Record<number, number>);
			});
		});

		describe('handleEvent (single listener)', () => {
			const sampleEvent = sampleRange(0, 100);
			const sampleAction = sampleRange(0, 100);
			beforeEach(() => {
				sampleInstance.addEventListener(sampleEvent, ({ event, meta }) => ({
					action: sampleAction,
					payload: {
						payload: parseInt(meta?.meta ?? defaultMeta.toString(16), 16),
					},
				}));
			});
			test('correctly handles single event', () => {
				const sampleMeta = sampleRange(1000, 10000);
				const result = sampleInstance.handleEvent({
					event: sampleEvent,
					meta: { meta: sampleMeta.toString(16) },
				});
				expect(result).toHaveLength(1);
				expect(result).toMatchObject([
					{ action: sampleAction, payload: { payload: sampleMeta } },
				] as typeof result);
			});
			test('is pure function', () => {
				const sampleMeta = sampleRange(1000, 10000);
				const event = {
					event: sampleEvent,
					meta: { meta: sampleMeta.toString(16) },
				};
				const eventCopy = JSON.parse(JSON.stringify(event));
				const eventHandlers = sampleInstance.getObservedEvents();
				const result1 = sampleInstance.handleEvent(event);
				for (let i = 0; i < 10; i++) {
					const result2 = sampleInstance.handleEvent(event);
					expect(result1).toMatchObject(result2); // idempotency
					expect(event).toMatchObject(eventCopy); // argument immutability
				}
				expect(eventHandlers).toEqual(sampleInstance.getObservedEvents());
			});
			test('is correctly applied with null EventMeta', () => {
				const result = sampleInstance.handleEvent({
					event: sampleEvent,
					meta: null,
				});
				expect(result).toHaveLength(1);
				expect(result).toMatchObject([
					{ action: sampleAction, payload: { payload: defaultMeta } },
				] as typeof result);
			});
		});
		describe('handleEvent (multiple listeners)', () => {
			beforeEach(() => {
				sampleEvents = new Array(sampleRange(12, 15)).fill(null).map((v) => sampleRange(1, 10));
				sampleEvents.forEach((eventId, ix) => {
					sampleInstance.addEventListener(eventId, ({ event, meta }) => ({
						action: ix,
						payload: {
							payload: parseInt(meta?.meta ?? defaultMeta.toString(12), 12),
						},
					}));
				});
			});
			test('returns a related stack of actions on success', () => {
				const testEvent = arraySample(sampleEvents)[0];
				const testMeta = (sampleRange(1000, 10000) / 100).toFixed(2);
				const result = sampleInstance.handleEvent({
					event: testEvent,
					meta: { meta: testMeta },
				});
				expect(result).toHaveLength(sampleEvents.filter((v) => v === testEvent).length);
			});
			test('applies multiple event handlers to each event in original order', () => {
				const testEvent = arraySample(sampleEvents)[0];
				const testMeta = (sampleRange(1000, 10000) / 100).toFixed(2);
				const result = sampleInstance.handleEvent({
					event: testEvent,
					meta: { meta: testMeta },
				});
				const minIndex = -1;
				result.forEach((r) => {
					expect(sampleEvents[r.action ?? -1]).toEqual(testEvent); // correct event handler is chosen
					expect(r.payload).toMatchObject({
						payload: parseInt(testMeta, 12),
					}); // it is actually called and the result is stored
					expect((r.action ?? -1) > minIndex).toBe(true); // the order of handlers is preserved
				});
			});
		});
		describe('removeAllListeners', () => {
			beforeEach(() => {
				sampleEvents = lengthArray((ix) => ix ?? -1, sampleRange(4, 7));
				sampleEvents.forEach((eventId, ix) => {
					sampleInstance.addEventListener(eventId, ({ event, meta }) => ({
						action: 0,
						payload: {
							payload: ix,
						},
					}));
				});
			});
			test('removes all listeners without an argument', () => {
				sampleInstance.removeAllListeners();
				expect(sampleInstance.getObservedEvents()).toMatchObject([]);
			});
			test('removes typed listeners with a typed argument', () => {
				const sampleEvent = arraySample(sampleEvents)[0];
				sampleInstance.removeAllListeners(sampleEvent);
				expect(sampleInstance.getObservedEvents()).toMatchObject(
					sampleEvents.filter((v) => v !== sampleEvent) as Record<number, number>
				);
				expect(sampleInstance.getObservedEvents()).toHaveLength(sampleEvents.length - 1);
			});
		});
	});
});
