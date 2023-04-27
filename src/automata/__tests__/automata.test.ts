import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { GenericAutomata } from '~/src/automata/Automata';
import AutomataEventAdapter from '~/src/automata/EventAdapter';
import { TAutomataActionPayload, TAutomataEvent } from '~/src/types/fsm/automata';
import { TValidator } from '~/src/types/typeGuards';
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
}

class AutomataTest extends GenericAutomata<
	TTestState,
	TTestAction,
	TTestEvent,
	TTestContext<TTestState>,
	TTestPayload<TTestAction>,
	TTestEventMeta<TTestEvent>
> {
	constructor() {
		super(new EventAdapterTest());
	}

	getDefaultEventValidator() {
		return this.defaultEventValidator;
	}

	getDefaultActionValidator() {
		return this.defaultActionValidator;
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

	getActionValidator() {
		return this.validateAction;
	}
}

const testReducer =
	(sampleState: number) =>
	(params: TAutomataEvent<TTestState, TTestAction, TTestContext<TTestState>, TTestPayload<TTestAction>>) => ({
		context: {
			context: Object.values(params?.payload ?? {}).reduce((a, b) => a + b, 0),
		},
		state: (params?.action ?? 0) + sampleState,
	});

describe(`Automata`, () => {
	let sampleInstance: AutomataTest = new AutomataTest();
	let aQueue: ReturnType<(typeof sampleInstance)['getActionQueue']>;
	let state: ReturnType<(typeof sampleInstance)['getContext']>;
	let sampleAction: TAutomataActionPayload<TTestAction, TTestPayload<TTestAction>>;
	beforeEach(() => {
		jest.restoreAllMocks();
		jest.clearAllTimers();
		sampleInstance = new AutomataTest();
	});
	describe('constructor', () => {
		test('returns an instance of GenericAutomata', () => {
			expect(sampleInstance).toBeInstanceOf(GenericAutomata);
		});
		test('sets the EventAdapter', () => {
			expect(sampleInstance.eventAdapter).toBeInstanceOf(EventAdapterTest);
		});
	});

	describe('setEventValidator', () => {
		const testValidator = ((a: number) => a % 2 === 0) as TValidator<TTestEvent>;
		test('accepts a function to overwrite default Event Validator', () => {
			sampleInstance.setEventValidator(testValidator);
			expect(sampleInstance.getEventValidator()).toBe(testValidator);
		});
		test('resets the Event Validator to default when called with null', () => {
			sampleInstance.setEventValidator(testValidator);
			sampleInstance.setEventValidator(null);
			expect(sampleInstance.getEventValidator()).toBe(sampleInstance.getDefaultEventValidator());
		});
	});

	describe('setActionValidator', () => {
		const testValidator = ((a: number) => a % 15 === 0) as TValidator<TTestAction>;
		test('accepts a function to overwrite default Action Validator', () => {
			sampleInstance.setActionValidator(testValidator);
			expect(sampleInstance.getActionValidator()).toBe(testValidator);
		});
		test('resets the Action Validator to default when called with null', () => {
			sampleInstance.setActionValidator(testValidator);
			sampleInstance.setActionValidator(null);
			expect(sampleInstance.getActionValidator()).toBe(sampleInstance.getDefaultActionValidator());
		});
	});

	describe('setStateValidator', () => {
		const testValidator = ((a: number) => a % 15 === 0) as TValidator<TTestState>;
		test('accepts a function to overwrite default State Validator', () => {
			sampleInstance.setStateValidator(testValidator);
			expect(sampleInstance.getStateValidator()).toBe(testValidator);
		});
		test('resets the State Validator to default when called with null', () => {
			sampleInstance.setStateValidator(testValidator);
			sampleInstance.setStateValidator(null);
			expect(sampleInstance.getStateValidator()).toBe(sampleInstance.getDefaultStateValidator());
		});
	});

	describe('when not initialized properly', () => {
		test('throws an error when calling `dispatch`', () => {
			expect(() =>
				sampleInstance.dispatch({
					action: sampleRange(0, 100),
					payload: null,
				})
			).toThrowError();
		});
		test('throws an error when calling `consumeAction`', () => {
			expect(() => sampleInstance.consumeAction()).toThrowError();
			expect(() => sampleInstance.consumeAction(4)).toThrowError();
		});
		test('throws an error when calling `collapseActionQueue`', () => {
			expect(() => sampleInstance.collapseActionQueue()).toThrowError();
		});
	});

	describe('Dispatch', () => {
		const sampleState = sampleRange(0, 100);

		beforeEach(() => {
			const sampleContext = null;
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: testReducer(sampleState),
			});
			sampleInstance.enable();
			sampleInstance.resume();
			sampleInstance.dispatch({
				action: sampleRange(1, 5),
				payload: { payload: sampleRange(2, 15) },
			});

			aQueue = sampleInstance.getActionQueue();
			state = sampleInstance.getContext();
			sampleAction = {
				action: sampleRange(5, 10),
				payload: { payload: sampleRange(0, 100) },
			};
		});

		test('throws on invalid Actions', () => {
			expect(() =>
				sampleInstance.dispatch({
					action: null,
					payload: null,
				})
			).toThrowError();

			expect(() =>
				sampleInstance.dispatch({
					action: 3.14,
					payload: null,
				})
			).toThrowError();
			expect(() =>
				sampleInstance.dispatch({
					action: -2,
					payload: { payload: 5 },
				})
			).toThrowError();
		});

		describe('when Unpaused, Enabled', () => {
			beforeEach(() => {
				sampleInstance.enable();
				sampleInstance.resume();
			});
			test('instantly updates internal Context without the Action Queue and returns new Context', () => {
				const result = sampleInstance.dispatch(sampleAction);
				const reducer = sampleInstance.getReducer();
				if (!reducer) {
					throw new Error('reducer is null');
				}
				const expectedResult = reducer({ ...state, ...sampleAction });
				expect(sampleInstance.getContext()).toEqual(expectedResult);
				expect(result).toEqual(expectedResult);
				expect(sampleInstance.getActionQueue()).toEqual(aQueue);
				expect(sampleInstance.getActionQueue().length).toBe(0);
			});
			test('is pure function', () => {
				const sampleActionCopy = JSON.parse(JSON.stringify(sampleAction));
				sampleInstance.dispatch(sampleAction);
				expect(sampleActionCopy).toMatchObject(sampleActionCopy);
				expect(sampleActionCopy).not.toBe(sampleAction);
				expect(sampleInstance.getActionQueue()).not.toBe(aQueue);
				expect(sampleInstance.isEnabled()).toBe(true);
				expect(sampleInstance.isPaused()).toBe(false);
			});
		});

		describe('when Unpaused, Disabled', () => {
			beforeEach(() => {
				sampleInstance.disable();
				sampleInstance.resume();
			});
			test('returns new Context without altering Action Queue or changing internal Context', () => {
				const result = sampleInstance.dispatch(sampleAction);
				const reducer = sampleInstance.getReducer();
				if (!reducer) {
					throw new Error('reducer is null');
				}
				const expectedResult = reducer({ ...state, ...sampleAction });
				expect(sampleInstance.getContext()).toEqual(state);
				expect(result).toEqual(expectedResult);
				expect(sampleInstance.getActionQueue()).toEqual(aQueue);
				expect(sampleInstance.getActionQueue().length).toBe(0);
			});
			test('is pure function', () => {
				const sampleActionCopy = JSON.parse(JSON.stringify(sampleAction));
				sampleInstance.dispatch(sampleAction);
				expect(sampleActionCopy).toMatchObject(sampleActionCopy);
				expect(sampleActionCopy).not.toBe(sampleAction);
				expect(sampleInstance.getActionQueue()).not.toBe(aQueue);
				expect(sampleInstance.isEnabled()).toBe(false);
				expect(sampleInstance.isPaused()).toBe(false);
			});
		});
	});

	describe('Pausing/Resuming', () => {
		beforeEach(() => {
			const sampleState = sampleRange(0, 100);
			const sampleContext = null;
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: testReducer(sampleState),
			});
		});
		describe('when Paused', () => {
			beforeEach(() => {
				sampleInstance.enable();
				sampleInstance.pause();
				sampleInstance.dispatch({
					action: 1,
					payload: { payload: sampleRange(0, 100) },
				});
				expect(sampleInstance.isPaused()).toBe(true);
				expect(sampleInstance.getActionQueue()?.length).toBe(1);

				aQueue = sampleInstance.getActionQueue();
				state = sampleInstance.getContext();
				sampleAction = {
					action: sampleRange(2, 5),
					payload: { payload: sampleRange(0, 100) },
				};
			});
			test('resumes the Disabled Automata, preserving the queue', () => {
				sampleInstance.disable();
				sampleInstance.resume();
				expect(sampleInstance.isPaused()).toBe(false);
				expect(sampleInstance.isEnabled()).toBe(false);
				expect(sampleInstance.getActionQueue()?.length).toBe(1);
			});
			test('resumes the Enabled Automata, Consuming the queue', () => {
				sampleInstance.enable();
				sampleInstance.resume();
				expect(sampleInstance.isPaused()).toBe(false);
				expect(sampleInstance.isEnabled()).toBe(true);
				expect(sampleInstance.getActionQueue()?.length).toBe(0);
			});
			test('pause is idempotent', () => {
				expect(sampleInstance.isPaused()).toBe(true);
				sampleInstance.dispatch({
					action: 1,
					payload: { payload: 0 },
				});
				const aQueue = sampleInstance.getActionQueue();

				sampleInstance.pause();
				sampleInstance.pause();

				expect(sampleInstance.isPaused()).toBe(true);
				expect(sampleInstance.getActionQueue()).toEqual(aQueue);
			});
			test('does not Dispatch the Action but queues it', () => {
				sampleInstance.dispatch(sampleAction);

				expect(sampleInstance.isPaused()).toBe(true);
				expect(state).toMatchObject(sampleInstance.getContext());
				expect(sampleInstance.getActionQueue()).toEqual([...aQueue, sampleAction]);
			});

			describe('Enabling/Disabling in Paused mode', () => {
				test('Disable is invariant to Paused and Context, but not to Action Queue', () => {
					sampleInstance.disable();
					sampleInstance.dispatch(sampleAction);
					expect(sampleInstance.getActionQueue()).toEqual([...aQueue, sampleAction]);
					expect(state).toMatchObject(sampleInstance.getContext());
					expect(sampleInstance.isPaused()).toBe(true);
				});
				test('Enable is invariant to Paused, and Context, but not to Action Queue', () => {
					sampleInstance.enable();
					sampleInstance.dispatch(sampleAction);
					expect(sampleInstance.getActionQueue()).toEqual([...aQueue, sampleAction]);
					expect(state).toMatchObject(sampleInstance.getContext());
					expect(sampleInstance.isPaused()).toBe(true);
				});
				test('Disable(true) clears the Action Queue but invariant to Context and Paused', () => {
					sampleInstance.disable(true);
					sampleInstance.dispatch(sampleAction);
					expect(state).toMatchObject(sampleInstance.getContext());
					expect(sampleInstance.getActionQueue()).toEqual([sampleAction]);
					expect(sampleInstance.isPaused()).toBe(true);
				});
			});
		});
		describe('when not Paused', () => {
			beforeEach(() => {
				sampleInstance.enable();
				sampleInstance.resume();
				sampleInstance.dispatch({
					action: sampleRange(1, 5),
					payload: { x: sampleRange(2, 15) },
				});

				aQueue = sampleInstance.getActionQueue();
				state = sampleInstance.getContext();
				sampleAction = {
					action: sampleRange(2, 5),
					payload: { payload: sampleRange(0, 100) },
				};
			});
			test('pauses the enabled Automata', () => {
				expect(sampleInstance.getActionQueue()?.length).toBe(0);
				sampleInstance.enable();
				sampleInstance.pause();
				expect(sampleInstance.getActionQueue()?.length).toBe(0);
				expect(sampleInstance.isPaused()).toBe(true);
				expect(sampleInstance.isEnabled()).toBe(true);
			});
			test('pauses the disabled Automata', () => {
				expect(sampleInstance.getActionQueue()?.length).toBe(0);
				sampleInstance.disable();
				sampleInstance.pause();
				expect(sampleInstance.getActionQueue()?.length).toBe(0);
				expect(sampleInstance.isPaused()).toBe(true);
				expect(sampleInstance.isEnabled()).toBe(false);
			});
			test('resume is idempotent', () => {
				expect(sampleInstance.isPaused()).toBe(false);
				sampleInstance.dispatch({
					action: 1,
					payload: { payload: 0 },
				});
				aQueue = sampleInstance.getActionQueue();

				sampleInstance.resume();
				sampleInstance.resume();
				expect(sampleInstance.getActionQueue()).toEqual(aQueue);
			});
			describe('Enabling/Disabling not in Paused mode', () => {
				test('Disable is invariant to Action Queue, Context and Paused', () => {
					sampleInstance.disable();
					sampleInstance.dispatch(sampleAction);
					expect(sampleInstance.getActionQueue()).toEqual(aQueue);
					expect(state).toMatchObject(sampleInstance.getContext());
					expect(sampleInstance.isPaused()).toBe(false);
				});
				test("Disable with 'true' is invariant to Action Queue, Context and Paused", () => {
					sampleInstance.disable(true);
					sampleInstance.dispatch(sampleAction);
					expect(sampleInstance.getActionQueue()).toEqual(aQueue);
					expect(state).toMatchObject(sampleInstance.getContext());
					expect(sampleInstance.isPaused()).toBe(false);
				});
				test('Enable is invariant to Paused and Action Queue, but not to Context', () => {
					sampleInstance.enable();
					sampleInstance.dispatch(sampleAction);
					expect(sampleInstance.getActionQueue()).toEqual(aQueue);
					const reducer = sampleInstance.getReducer();
					if (reducer)
						expect(sampleInstance.getContext()).toMatchObject(reducer({ ...state, ...sampleAction }));
					expect(sampleInstance.isPaused()).toBe(false);
				});
			});
		});
	});
});
