import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import AutomataEventAdapter from '~/src/automata/EventAdapter';
import { TAutomataEventEmitter, TAutomataEventHandler } from '~/src/types/fsm/automata';
import { TValidator } from '~/src/types/typeGuards';
import arraySample from '~/src/utils/arraySample';
import { lengthArray } from '~/src/utils/lengthArray';
import { sampleRange } from '~/src/utils/sampleRange';
import {
	TTestAction,
	TTestContext,
	TTestEvent,
	TTestEventMeta,
	TTestPayload,
	TTestState,
} from '../../../tests/fixtures/fsm';

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

	getDefaultEventValidator() {
		return this.defaultEventValidator;
	}

	getDefaultStateValidator() {
		return this.defaultStateValidator;
	}

	getEventValidator() {
		return this.validateEvent;
	}

	getStateValidator() {
		return this.validateState;
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

	describe('setEventValidator', () => {
		const testValidator = (a: number) => a % 2 === 0;
		test('accepts a function to overwrite default Event Validator', () => {
			sampleInstance.setEventValidator(testValidator as TValidator<TTestEvent>);
			expect(sampleInstance.getEventValidator()).toBe(testValidator);
		});
		test('resets the Event Validator to default when called with null', () => {
			sampleInstance.setEventValidator(testValidator as TValidator<TTestEvent>);
			sampleInstance.setEventValidator(null);
			expect(sampleInstance.getEventValidator()).toBe(sampleInstance.getDefaultEventValidator());
		});
	});

	describe('setStateValidator', () => {
		const testValidator = (a: number) => a % 2 === 0;
		test('accepts a function to overwrite default State Validator', () => {
			sampleInstance.setStateValidator(testValidator as TValidator<TTestState>);
			expect(sampleInstance.getStateValidator()).toBe(testValidator);
		});
		test('resets the Event Validator to default when called with null', () => {
			sampleInstance.setStateValidator(testValidator as TValidator<TTestState>);
			sampleInstance.setStateValidator(null);
			expect(sampleInstance.getStateValidator()).toBe(sampleInstance.getDefaultStateValidator());
		});
	});

	describe('getObservedEvents', () => {
		const sampleEvents = arraySample(lengthArray<number>(null, 1000), sampleRange(13, 25));

		test('returns an empty array by default', () => {
			expect(sampleInstance.getObservedEvents()).toEqual([]);
		});
		test('returns observed events', () => {
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
		test('omits Events that are discarded by Event Validator', () => {
			sampleEvents.forEach((eventId) =>
				sampleInstance.addEventListener(eventId, () => ({
					action: eventId,
					payload: null,
				}))
			);

			const filteredEventsQuantity = 4;
			const filteredEvents = arraySample(sampleEvents, filteredEventsQuantity);
			const eventValidator = (event: number) => !filteredEvents.includes(event);
			sampleInstance.setEventValidator(eventValidator as TValidator<TTestEvent>);
			sampleEvents.filter(eventValidator).forEach((eventId) => {
				expect(sampleInstance.getObservedEvents()).toContainEqual(eventId);
			});
			expect(sampleInstance.getObservedEvents()).toHaveLength(sampleEvents.length - filteredEventsQuantity);
		});
	});

	describe('getObservedStates', () => {
		const sampleStates = arraySample(lengthArray<number>(null, 1000), sampleRange(13, 25));

		test('returns an empty array by default', () => {
			expect(sampleInstance.getObservedStates()).toEqual([]);
		});
		test('returns observed states', () => {
			sampleStates.forEach((eventId) =>
				sampleInstance.addEventEmitter(eventId, () => ({
					event: eventId,
					meta: null,
				}))
			);

			const observedStates = sampleInstance.getObservedStates();
			sampleStates.forEach((eventId) => {
				expect(observedStates).toContainEqual(eventId);
			});
			expect(observedStates).toHaveLength(sampleStates.length);
		});
		test('omits States that are discarded by State Validator', () => {
			sampleStates.forEach((eventId) =>
				sampleInstance.addEventEmitter(eventId, () => ({
					event: eventId,
					meta: null,
				}))
			);
			const filteredStateQuantity = 4;
			const filteredStates = arraySample(sampleStates, filteredStateQuantity);
			const stateValidator = (event: number) => !filteredStates.includes(event);
			sampleInstance.setStateValidator(stateValidator as TValidator<TTestState>);
			sampleStates.filter(stateValidator).forEach((eventId) => {
				expect(sampleInstance.getObservedStates()).toContainEqual(eventId);
			});
			expect(sampleInstance.getObservedStates()).toHaveLength(sampleStates.length - filteredStateQuantity);
		});
	});

	describe('Event Handling', () => {
		let sampleEvents: number[] = [];
		const defaultMeta = -1;

		const fakeListener =
			(
				action: TTestAction,
				payload: number
			): TAutomataEventHandler<TTestEvent, TTestAction, TTestEventMeta<TTestEvent>, TTestPayload<TTestAction>> =>
			({ event, meta }) => ({
				action,
				payload: {
					payload,
				},
			});

		describe('addEventListener', () => {
			const sampleEvent = sampleRange(0, 100);
			const sampleAction = sampleRange(0, 100);
			beforeEach(() => {
				sampleInstance.addEventListener(sampleEvent, fakeListener(sampleAction, sampleRange(0, 100)));
			});
			test('actually adds an observer', () => {
				const testEvent = sampleRange(100, 200);
				sampleInstance.addEventListener(testEvent, fakeListener(sampleAction, sampleEvent));
				expect(sampleInstance.getObservedEvents()).toEqual([sampleEvent, testEvent]);
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
				expect(sampleInstance.getObservedEvents()).toEqual([sampleEvent]);
			});
			test('returns Null when called with invalid handler', () => {
				const testEvent = sampleRange(100, 200);
				const observedEvents = sampleInstance.getObservedEvents();
				// @ts-ignore
				const result = sampleInstance.addEventListener(testEvent, null);
				expect(observedEvents).toEqual(sampleInstance.getObservedEvents());
				expect(result).toEqual(null);
			});
			test('ignores invalid Events and returns Null', () => {
				const listenedEvents = sampleInstance.getObservedEvents();
				const results = [
					sampleInstance.addEventListener(-13, fakeListener(sampleAction, sampleEvent)),
					sampleInstance.addEventListener(2.33, fakeListener(sampleAction, sampleEvent)),
					// @ts-ignore
					sampleInstance.addEventListener(null, fakeListener(sampleAction, sampleEvent)),
					// @ts-ignore
					sampleInstance.addEventListener(undefined, fakeListener(sampleAction, sampleEvent)),
				];
				expect(listenedEvents).toEqual(sampleInstance.getObservedEvents());
				expect(results).toEqual([null, null, null, null]);
			});

			test('ignores listeners for Events that are discarded by Event Validator', () => {
				const listenedEvents = sampleInstance.getObservedEvents();
				const testEvent = sampleRange(101, 200);
				const eventValidator = (t: TTestEvent) => t <= 100;
				sampleInstance.setEventValidator(eventValidator as TValidator<TTestEvent>);
				sampleInstance.addEventListener(testEvent, fakeListener(sampleAction, sampleEvent));
				expect(listenedEvents).toEqual(sampleInstance.getObservedEvents());
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
			test('ignores invalid Events', () => {
				const result = sampleInstance.handleEvent({
					event: -99,
					meta: { meta: sampleRange(100, 200).toString(16) },
				});
				const result2 = sampleInstance.handleEvent({
					event: 14.88,
					meta: { meta: sampleRange(100, 200).toString(16) },
				});
				expect(result).toEqual([]);
				expect(result2).toEqual([]);
			});
			test('ignores Events discarded by Event Validator', () => {
				const testEvent = sampleRange(1000, 2000);
				sampleInstance.addEventListener(testEvent, fakeListener(sampleAction, sampleRange(0, 1000)));
				const eventValidator = (n: number) => n !== testEvent;
				sampleInstance.setEventValidator(eventValidator as TValidator<TTestEvent>);
				const result = sampleInstance.handleEvent({
					event: testEvent,
					meta: { meta: sampleRange(100, 200).toString(16) },
				});
				expect(result).toEqual([]);
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
				sampleEvents = lengthArray<number>(null, sampleRange(10, 40));
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
				expect(sampleInstance.getObservedEvents()).toEqual([]);
			});
			test('removes typed listeners with a typed argument', () => {
				const sampleEvent = arraySample(sampleEvents)[0];
				sampleInstance.removeAllListeners(sampleEvent);
				expect(sampleInstance.getObservedEvents().sort()).toEqual(
					sampleEvents.filter((v) => v !== sampleEvent).sort()
				);
				expect(sampleInstance.getObservedEvents()).toHaveLength(sampleEvents.length - 1);
			});

			test('ignores invalid Events', () => {
				const observedEvents = sampleInstance.getObservedEvents();
				sampleInstance.removeAllListeners(-1);
				sampleInstance.removeAllListeners(13.37);
				expect(sampleInstance.getObservedEvents()).toEqual(observedEvents);
			});

			test('ignores Events discarded by Event Validator', () => {
				const observedEvents = sampleInstance.getObservedEvents();
				const sampleEvent = arraySample(observedEvents)[0];
				const eventValidator = (t: number) => t !== sampleEvent;
				sampleInstance
					.setEventValidator(eventValidator as TValidator<TTestEvent>)
					.removeAllListeners(sampleEvent)
					.setEventValidator(null);
				expect(sampleInstance.getObservedEvents()).toEqual(observedEvents);
			});
		});
	});
	describe('Event Dispatching', () => {
		let sampleStates: number[] = [];
		const defaultContext = -1 * sampleRange(100, 200);
		const fakeEmitter: TAutomataEventEmitter<
			TTestEvent,
			TTestState,
			TTestEventMeta<TTestEvent>,
			TTestContext<TTestEvent>
		> = ({ state, context }) => ({
			event: state,
			meta: {
				meta: (context?.context ?? -1).toString(16),
			},
		});

		describe('addEventEmitter', () => {
			const sampleState = sampleRange(0, 99);
			const sampleEvent = sampleRange(0, 99);
			beforeEach(() => {
				sampleInstance.addEventEmitter(sampleState, ({ state, context }) => ({
					event: sampleEvent,
					meta: {
						meta: String(context?.context),
					},
				}));
			});
			test('actually adds an emitter', () => {
				const testState = sampleRange(100, 200);
				sampleInstance.addEventEmitter(testState, fakeEmitter);
				expect(sampleInstance.getObservedStates()).toEqual([sampleState, testState]);
			});
			test('returns an unsubscribe function', () => {
				const testState = sampleRange(100, 200);
				const unsubscribe = sampleInstance.addEventEmitter(testState, fakeEmitter);
				expect(unsubscribe).toBeInstanceOf(Function);
				if (unsubscribe) unsubscribe();
				expect(sampleInstance.getObservedStates()).toEqual([sampleState]);
			});

			test('returns Null when called with invalid Emitter', () => {
				const testState = sampleRange(100, 200);
				const observedStates = sampleInstance.getObservedStates();
				// @ts-ignore
				const result = sampleInstance.addEventEmitter(testState, null);
				expect(observedStates).toEqual(sampleInstance.getObservedStates());
				expect(result).toEqual(null);
			});
			test('ignores invalid States and returns Null', () => {
				const listenedStates = sampleInstance.getObservedStates();
				const results = [
					sampleInstance.addEventEmitter(-13, fakeEmitter),
					sampleInstance.addEventEmitter(2.33, fakeEmitter),
					// @ts-ignore
					sampleInstance.addEventEmitter(null, fakeEmitter),
					// @ts-ignore
					sampleInstance.addEventEmitter(undefined, fakeEmitter),
				];
				expect(listenedStates).toEqual(sampleInstance.getObservedStates());
				expect(results).toEqual([null, null, null, null]);
			});

			test('ignores Emitters for States that are discarded by State Validator', () => {
				const listenedStates = sampleInstance.getObservedStates();
				const testState = sampleRange(101, 200);
				const eventValidator = (t: TTestEvent) => t <= 100;
				sampleInstance.setStateValidator(eventValidator as TValidator<TTestState>);
				sampleInstance.addEventEmitter(testState, fakeEmitter);
				expect(listenedStates).toEqual(sampleInstance.getObservedStates());
			});
		});

		describe('handleTransition (single emitter)', () => {
			const sampleState = sampleRange(0, 100);
			const sampleEvent = sampleRange(0, 100);
			beforeEach(() => {
				sampleInstance.addEventEmitter(sampleState, ({ state, context }) => ({
					event: sampleEvent,
					meta: { meta: (context?.context ?? defaultContext).toString(16) || '' },
				}));
			});
			test('ignores invalid States', () => {
				const result = sampleInstance.handleTransition({
					state: -12,
					context: { context: sampleRange(0, 1000) },
				});
				const result2 = sampleInstance.handleTransition({
					state: 2.71828,
					context: { context: sampleRange(0, 1000) },
				});
				expect(result).toEqual([]);
				expect(result2).toEqual([]);
			});
			test('ignores States discarded by State Validator', () => {
				const testState = sampleRange(1000, 2000);
				sampleInstance.addEventEmitter(testState, fakeEmitter);
				const stateValidator = (n: number) => n !== testState;
				sampleInstance.setStateValidator(stateValidator as TValidator<TTestState>);
				const result = sampleInstance.handleTransition({
					state: testState,
					context: { context: sampleRange(0, 1000) },
				});
				expect(result).toEqual([]);
			});
			test('correctly handles a single transition', () => {
				const samplePayload = sampleRange(1000, 10000);
				const result = sampleInstance.handleTransition({
					state: sampleState,
					context: { context: samplePayload },
				});
				expect(result).toHaveLength(1);
				expect(result).toMatchObject([
					{
						event: sampleEvent,
						meta: { meta: samplePayload.toString(16) },
					},
				] as typeof result);
			});
			test('is pure function', () => {
				const samplePayload = sampleRange(1000, 10000);
				const state = {
					state: sampleState,
					context: { context: samplePayload },
				};
				const eventCopy = JSON.parse(JSON.stringify(state));
				const transitions = sampleInstance.getObservedStates();
				const result1 = sampleInstance.handleTransition(state);
				for (let i = 0; i < 10; i++) {
					const result2 = sampleInstance.handleTransition(state);
					expect(result1).toMatchObject(result2); // idempotency
					expect(state).toMatchObject(eventCopy); // argument immutability
				}
				expect(transitions).toEqual(sampleInstance.getObservedStates());
			});
			test('is correctly applied with null state context', () => {
				const result = sampleInstance.handleTransition({
					state: sampleState,
					context: null,
				});
				expect(result).toHaveLength(1);
				expect(result).toMatchObject([
					{
						event: sampleEvent,
						meta: { meta: defaultContext.toString(16) },
					},
				] as typeof result);
			});
		});
		describe('handleTransition (multiple emitters)', () => {
			beforeEach(() => {
				sampleStates = new Array(sampleRange(12, 15)).fill(null).map((v) => sampleRange(1, 10));
				sampleStates.forEach((stateId, ix) => {
					sampleInstance.addEventEmitter(stateId, ({ state, context }) => ({
						event: ix,
						meta: {
							meta: [state, context?.context].join('|'),
						},
					}));
				});
			});
			test('returns a related stack of actions on success', () => {
				const testState = arraySample(sampleStates)[0];
				const testContext = sampleRange(1000, 10000);
				const result = sampleInstance.handleTransition({
					state: testState,
					context: { context: testContext },
				});
				expect(result).toHaveLength(sampleStates.filter((v) => v === testState).length);
			});
			test('applies multiple event handlers to each event in original order', () => {
				const testState = arraySample(sampleStates)[0];
				const testContext = sampleRange(1000, 10000);
				const result = sampleInstance.handleTransition({
					state: testState,
					context: { context: testContext },
				});
				const minIndex = -1;
				result.forEach((r) => {
					expect(sampleStates[r.event ?? -1]).toEqual(testState); // correct event handler is chosen
					expect(r.meta).toMatchObject({
						meta: [testState, testContext].join('|'),
					}); // it is actually called and the result is stored
					expect((r.event ?? -1) > minIndex).toBe(true); // the order of handlers is preserved
				});
			});
		});
		describe('removeAllEmitters', () => {
			beforeEach(() => {
				sampleStates = lengthArray<number>(null, sampleRange(20, 30));
				sampleStates.forEach((stateId, ix) => {
					sampleInstance.addEventEmitter(stateId, ({ state, context }) => ({
						event: stateId,
						meta: {
							meta: (context?.context ?? 0).toFixed(2),
						},
					}));
				});
			});
			test('removes all listeners without an argument', () => {
				sampleInstance.removeAllEmitters();
				expect(sampleInstance.getObservedStates()).toEqual([]);
			});
			test('removes emitters for a specific state when called with a typed argument', () => {
				const sampleState = arraySample(sampleStates)[0];
				sampleInstance.removeAllEmitters(sampleState);

				expect(sampleInstance.getObservedStates()).toHaveLength(sampleStates.length - 1);
				expect(sampleInstance.getObservedStates().sort()).toEqual(
					sampleStates.filter((v) => v !== sampleState).sort()
				);
			});

			test('ignores invalid States', () => {
				const observedStates = sampleInstance.getObservedStates();
				sampleInstance.removeAllEmitters(-100);
				sampleInstance.removeAllEmitters(Math.PI);
				expect(sampleInstance.getObservedStates()).toEqual(observedStates);
			});

			test('ignores States discarded by State Validator', () => {
				const observedStates = sampleInstance.getObservedStates();
				const sampleState = arraySample(observedStates)[0];
				const stateValidator = (t: number) => t !== sampleState;
				sampleInstance
					.setEventValidator(stateValidator as TValidator<TTestEvent>)
					.removeAllListeners(sampleState)
					.setEventValidator(null);
				expect(sampleInstance.getObservedStates()).toEqual(observedStates);
			});
		});
	});
});
