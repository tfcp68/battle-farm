import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { GenericAutomata } from '../lib/Automata';
import AutomataEventAdapter from '../lib/EventAdapter';
import { TAutomataActionPayload, TAutomataEvent, TValidator } from '../types';
import { TTestAction, TTestContext, TTestEvent, TTestEventMeta, TTestPayload, TTestState } from './fixtures';
import Utils from '../utils';

const { sampleRange } = Utils;

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

	describe('/setEventValidator', () => {
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
		test('returns self', () => {
			expect(sampleInstance.setEventValidator(testValidator)).toBe(sampleInstance);
		});
	});

	describe('/setActionValidator', () => {
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
		test('returns self', () => {
			expect(sampleInstance.setActionValidator(testValidator)).toBe(sampleInstance);
		});
	});

	describe('/setStateValidator', () => {
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
		test('returns self', () => {
			expect(sampleInstance.setStateValidator(testValidator)).toBe(sampleInstance);
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

	describe('/init', () => {
		test('resets root reducer when called with null as reducer', () => {
			const sampleState = sampleRange(0, 100);
			const sampleContext = null;
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: testReducer(sampleState),
			});
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: null,
			});
			expect(sampleInstance.getReducer()).toBe(null);
		});
		test('throws when called with non-function reducer', () => {
			expect(() => {
				sampleInstance.init({
					state: sampleRange(0, 100),
					context: null,
					rootReducer: new Date() as any,
				});
			}).toThrowError();
			expect(() => {
				sampleInstance.init({
					state: sampleRange(0, 100),
					context: null,
					rootReducer: 'new Date()' as any,
				});
			}).toThrowError();
		});
		test('assigns a reducer when passed', () => {
			const sampleState = sampleRange(0, 100);
			const sampleReducer = testReducer(sampleState);
			const sampleContext = null;
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: sampleReducer,
			});
			expect(sampleInstance.getReducer()).toBe(sampleReducer);
		});
		test('initializes with provided Context, empty Queue, and is Enabled and Resumed by default', () => {
			const sampleState = sampleRange(0, 100);
			const sampleContext = null;
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: testReducer(sampleState),
			});
			expect(sampleInstance.getActionQueue()).toEqual([]);
			expect(sampleInstance.isEnabled()).toBe(true);
			expect(sampleInstance.isPaused()).toBe(false);
			expect(sampleInstance.getContext()).toEqual({
				context: sampleContext,
				state: sampleState,
			});
		});
		test('resets the Queue and Internal State, while copying Disabled and Paused, when invoked upon stateful Automata', () => {
			const sampleState = sampleRange(0, 100);
			const sampleContext = { context: sampleRange(1, 100) };
			sampleAction = {
				action: sampleRange(5, 10),
				payload: { payload: sampleRange(0, 100) },
			};
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: testReducer(sampleState),
			});
			sampleInstance.pause();
			sampleInstance.dispatch(sampleAction);
			sampleInstance.disable();
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: testReducer(sampleState),
				enabled: false,
				paused: true,
			});
			expect(sampleInstance.getContext()).toEqual({
				context: sampleContext,
				state: sampleState,
			});
			expect(sampleInstance.getActionQueue()).toEqual([]);
			expect(sampleInstance.isEnabled()).toBe(false);
			expect(sampleInstance.isPaused()).toBe(true);
		});
		test('throws when called with invalid state', () => {
			expect(() => {
				sampleInstance.init({
					state: null,
					context: null,
					rootReducer: testReducer(sampleRange(0, 100)),
				});
			}).toThrowError();
			expect(() => {
				sampleInstance.init({
					state: -3.14,
					context: null,
					rootReducer: testReducer(sampleRange(0, 100)),
				});
			}).toThrowError();
			expect(() => {
				sampleInstance.init({
					state: -25,
					context: null,
					rootReducer: testReducer(sampleRange(0, 100)),
				});
			}).toThrowError();
		});
		test('returns self', () => {
			const sampleState = sampleRange(0, 100);
			const sampleContext = null;
			const result = sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: testReducer(sampleState),
			});
			expect(result).toBe(sampleInstance);
		});
	});

	describe('/consumeAction', () => {
		beforeEach(() => {
			const sampleState = sampleRange(0, 100);
			const sampleContext = null;
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: testReducer(sampleState),
			});
			sampleInstance.enable();
			sampleInstance.pause();
			sampleAction = {
				action: sampleRange(5, 10),
				payload: { payload: sampleRange(0, 100) },
			};
			sampleInstance.dispatch(sampleAction);
			aQueue = sampleInstance.getActionQueue();
			state = sampleInstance.getContext();
		});
		test('with empty Action Queue returns the current Context ', () => {
			sampleInstance.clearActionQueue();
			const reducer = sampleInstance.getReducer();
			const result = sampleInstance.consumeAction();
			if (!reducer) throw new Error('No Reducer');
			expect(result).toEqual({
				action: null,
				newState: state,
			});
			expect(sampleInstance.isPaused()).toBe(true);
			expect(sampleInstance.isEnabled()).toBe(true);
			expect(sampleInstance.getActionQueue()).toEqual([]);
		});
		test('with empty Action Queue returns the current Context when called with parameter ', () => {
			sampleInstance.clearActionQueue();
			const reducer = sampleInstance.getReducer();
			if (!reducer) throw new Error('No Reducer');
			const sampleValues = new Array(sampleRange(5, 10)).fill(null).map(() => sampleRange(0, 100));
			for (const count of sampleValues) {
				const result = sampleInstance.consumeAction(count);
				expect(result).toEqual({
					action: null,
					newState: state,
				});
				expect(sampleInstance.isPaused()).toBe(true);
				expect(sampleInstance.isEnabled()).toBe(true);
				expect(sampleInstance.getActionQueue()).toEqual([]);
			}
		});
		test("when Disabled, doesn't alter the Action Queue but returns computed Context", () => {
			sampleInstance.disable();
			const reducer = sampleInstance.getReducer();
			const result = sampleInstance.consumeAction();
			if (!reducer) throw new Error('No Reducer');
			expect(result).toEqual({
				action: sampleAction,
				newState: reducer({ ...state, ...sampleAction }),
			});
			expect(sampleInstance.getContext()).toEqual(state);
			expect(sampleInstance.getActionQueue()).toEqual(aQueue);
			expect(sampleInstance.isPaused()).toBe(true);
			expect(sampleInstance.isEnabled()).toBe(false);
		});
		test('when Enabled, pops the Action Queue and returns computed Context', () => {
			const newAction = {
				action: sampleRange(1, 100),
				payload: { payload: sampleRange(1, 100) },
			};
			sampleInstance.dispatch(newAction);
			const reducer = sampleInstance.getReducer();
			const result = sampleInstance.consumeAction();
			if (!reducer) throw new Error('No Reducer');
			const newState = reducer({ ...state, ...sampleAction });
			expect(result).toEqual({
				action: sampleAction,
				newState,
			});
			expect(sampleInstance.getContext()).toEqual(newState);
			expect(sampleInstance.getActionQueue()).toEqual([newAction]);
			expect(sampleInstance.isPaused()).toBe(true);
			expect(sampleInstance.isEnabled()).toBe(true);
		});
		describe('with argument', () => {
			let testActions: Array<{
				action: number;
				payload: { payload: number };
			}> = [];
			beforeEach(() => {
				sampleInstance.clearActionQueue();
				testActions = new Array(sampleRange(7, 10)).fill(null).map(() => ({
					action: sampleRange(1, 100),
					payload: { payload: sampleRange(1, 100) },
				}));
			});
			test('pops all Actions from Action Queue and returns computed Context, when called with number greater than queue length', () => {
				const reducer = sampleInstance.getReducer();
				if (!reducer) throw new Error('No Reducer');
				const newAction = testActions.shift();
				if (!newAction) throw new Error('No Action');
				sampleInstance.dispatch(newAction);
				const result = sampleInstance.consumeAction(100);
				const newState = reducer({ ...reducer({ ...state, ...sampleAction }), ...newAction });
				expect(result).toEqual({
					action: newAction,
					newState,
				});
				expect(sampleInstance.getContext()).toEqual(newState);
				expect(sampleInstance.getActionQueue()).toEqual([]);
				expect(sampleInstance.isPaused()).toBe(true);
				expect(sampleInstance.isEnabled()).toBe(true);
			});
			test('when Disabled, computes the specified quantity of Actions from the Queue without changing the internal state', () => {
				sampleInstance.disable(true);
				const reducer = sampleInstance.getReducer();
				if (!reducer) throw new Error('No Reducer');

				// setup
				for (const action of testActions) {
					sampleInstance.dispatch(action);
				}
				aQueue = sampleInstance.getActionQueue();
				let newState = state;
				let action = sampleAction;
				const count = sampleRange(2, 5);
				for (let i = 0; i < count; i++) {
					action = testActions[i];
					newState = reducer({ ...newState, ...action });
				}

				// verify
				const result = sampleInstance.consumeAction(count);
				expect(result).toEqual({ action, newState });
				// has not changed
				expect(sampleInstance.getContext()).toEqual(state);
				// has not changed
				expect(sampleInstance.getActionQueue()).toEqual(aQueue);
				expect(sampleInstance.isPaused()).toBe(true);
				expect(sampleInstance.isEnabled()).toBe(false);
			});
			test('when Enabled, consumes of Actions from the Queue and changes the state', () => {
				sampleInstance.enable();
				sampleInstance.clearActionQueue();
				const reducer = sampleInstance.getReducer();
				if (!reducer) throw new Error('No Reducer');
				// setup
				for (const action of testActions) {
					sampleInstance.dispatch(action);
				}
				aQueue = sampleInstance.getActionQueue();
				let newState = state;
				let action = sampleAction;
				const count = sampleRange(2, 5);
				for (let i = 0; i < count; i++) {
					action = testActions[i];
					newState = reducer({ ...newState, ...action });
				}

				// verify
				const result = sampleInstance.consumeAction(count);
				expect(result).toEqual({ action, newState });
				// has changed
				expect(sampleInstance.getContext()).toEqual(newState);
				// has changed
				expect(sampleInstance.getActionQueue()).toEqual(aQueue.slice(count));
				expect(sampleInstance.isPaused()).toBe(true);
				expect(sampleInstance.isEnabled()).toBe(true);
			});
		});
	});

	describe('/dispatch', () => {
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

		test('is pure function', () => {
			const sampleActionCopy = JSON.parse(JSON.stringify(sampleAction));
			sampleInstance.dispatch(sampleAction);
			expect(sampleActionCopy).toMatchObject(sampleActionCopy);
			expect(sampleActionCopy).not.toBe(sampleAction);
			expect(sampleInstance.getActionQueue()).not.toBe(aQueue);
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
			test("doesn't Disable or Pause", () => {
				sampleInstance.dispatch(sampleAction);
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
			test("doesn't Enable or Pause", () => {
				sampleInstance.dispatch(sampleAction);
				expect(sampleInstance.isEnabled()).toBe(false);
				expect(sampleInstance.isPaused()).toBe(false);
			});
		});

		describe('when Paused, Enabled', () => {
			beforeEach(() => {
				sampleInstance.enable();
				sampleInstance.pause();
			});
			test('returns new Context, adding Action to Action Queue and not changing internal Context', () => {
				const result = sampleInstance.dispatch(sampleAction);
				const reducer = sampleInstance.getReducer();
				if (!reducer) {
					throw new Error('reducer is null');
				}
				const expectedResult = reducer({ ...state, ...sampleAction });
				expect(sampleInstance.getContext()).toEqual(state);
				expect(result).toEqual(expectedResult);
				expect(sampleInstance.getActionQueue()).toEqual([...aQueue, sampleAction]);
				expect(sampleInstance.getActionQueue().length).toBe(1);
			});
			test("Doesn't Disable or Resume", () => {
				sampleInstance.dispatch(sampleAction);
				expect(sampleInstance.isEnabled()).toBe(true);
				expect(sampleInstance.isPaused()).toBe(true);
			});
		});

		describe('when Paused, Disabled', () => {
			beforeEach(() => {
				sampleInstance.disable();
				sampleInstance.pause();
			});
			test('returns new Context, adding Action to Action Queue and not changing internal Context', () => {
				const result = sampleInstance.dispatch(sampleAction);
				const reducer = sampleInstance.getReducer();
				if (!reducer) {
					throw new Error('reducer is null');
				}
				const expectedResult = reducer({ ...state, ...sampleAction });
				expect(sampleInstance.getContext()).toEqual(state);
				expect(result).toEqual(expectedResult);
				expect(sampleInstance.getActionQueue()).toEqual([...aQueue, sampleAction]);
				expect(sampleInstance.getActionQueue().length).toBe(1);
			});
			test("Doesn't Enable or Resume", () => {
				sampleInstance.dispatch(sampleAction);
				expect(sampleInstance.isEnabled()).toBe(false);
				expect(sampleInstance.isPaused()).toBe(true);
			});
		});
	});

	describe('/pause, /resume, /disable, /enable', () => {
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

	describe('/getActionQueue', () => {
		beforeEach(() => {
			const sampleState = {
				state: sampleRange(100, 1000),
				context: { context: sampleRange(100, 1000) },
			};
			sampleInstance.init({
				rootReducer: testReducer(sampleState.state),
				...sampleState,
			});
			sampleInstance.pause();
		});
		test('returns the Action Queue when Paused', () => {
			const action = {
				action: sampleRange(1, 5),
				payload: { value: sampleRange(100, 1000) },
			};
			sampleInstance.dispatch(action);
			expect(sampleInstance.getActionQueue()).toEqual([action]);
		});
		test('is always empty when Resumed and Enabled', () => {
			sampleInstance.resume();
			sampleInstance.enable();
			expect(sampleInstance.getActionQueue()).toEqual([]);
			const action = {
				action: sampleRange(1, 5),
				payload: { value: sampleRange(100, 1000) },
			};
			sampleInstance.dispatch(action);
			expect(sampleInstance.getActionQueue()).toEqual([]);
		});
		test('every call returns a new object', () => {
			const action = {
				action: sampleRange(1, 5),
				payload: { value: sampleRange(100, 1000) },
			};
			sampleInstance.dispatch(action);
			aQueue = sampleInstance.getActionQueue();
			expect(sampleInstance.getActionQueue()).not.toBe(aQueue);
			expect(sampleInstance.getActionQueue()).toEqual(aQueue);
			sampleInstance.resume();
			aQueue = sampleInstance.getActionQueue();
			aQueue.unshift();
			aQueue.push(action);
			expect(sampleInstance.getActionQueue()).not.toEqual(aQueue);
			expect(sampleInstance.getActionQueue()).not.toBe(aQueue);
		});
	});

	describe('/getContext', () => {
		const sampleState = {
			state: sampleRange(100, 1000),
			context: { context: sampleRange(100, 1000) },
		};
		beforeEach(() => {
			sampleInstance.init({
				rootReducer: null,
				...sampleState,
			});
		});
		test('returns the Context passed at initialization', () => {
			expect(sampleInstance.getContext()).toEqual(sampleState);
		});
		test('every call returns a new object', () => {
			const testContext = sampleInstance.getContext();
			expect(sampleInstance.getContext()).not.toBe(testContext);
			testContext.state = sampleRange(25, 50);
			expect(sampleInstance.getContext()).not.toEqual(testContext);
			expect(sampleInstance.getContext()).not.toBe(sampleInstance.getContext());
		});
	});

	describe('/getReducer', () => {
		const sampleState = {
			state: sampleRange(100, 1000),
			context: { context: sampleRange(100, 1000) },
		};
		test('returns the RootReducer passed at initialization', () => {
			const reducer = testReducer(sampleState.state);
			sampleInstance.init({
				rootReducer: reducer,
				...sampleState,
			});
			expect(sampleInstance.getReducer()).toBe(reducer);
		});
		test('returns Null when RootReducer is reset', () => {
			sampleInstance.init({
				rootReducer: null,
				...sampleState,
			});
			expect(sampleInstance.getReducer()).toBeNull();
		});
	});

	describe('/clearActionQueue', () => {
		const sampleState = {
			state: sampleRange(100, 1000),
			context: { context: sampleRange(100, 1000) },
		};
		const sampleAction = {
			action: sampleRange(1, 5),
			payload: { value: sampleRange(100, 1000) },
		};
		beforeEach(() => {
			sampleInstance.init({
				rootReducer: testReducer(sampleState.state),
				...sampleState,
			});
		});
		test('clears the Action Queue when Paused, Enabled', () => {
			sampleInstance.pause();
			sampleInstance.enable();
			sampleInstance.dispatch(sampleAction);
			expect(sampleInstance.getActionQueue()).toEqual([sampleAction]);
			sampleInstance.clearActionQueue();
			expect(sampleInstance.getActionQueue()).toEqual([]);
			expect(sampleInstance.isEnabled()).toEqual(true);
			expect(sampleInstance.isPaused()).toEqual(true);
		});
		test('clears the Action Queue when Paused, Disabled', () => {
			sampleInstance.pause();
			sampleInstance.disable();
			sampleInstance.dispatch(sampleAction);
			expect(sampleInstance.getActionQueue()).toEqual([sampleAction]);
			sampleInstance.clearActionQueue();
			expect(sampleInstance.getActionQueue()).toEqual([]);
			expect(sampleInstance.isEnabled()).toEqual(false);
			expect(sampleInstance.isPaused()).toEqual(true);
		});
		test("isn't needed when Resumed, Enabled", () => {
			sampleInstance.resume();
			sampleInstance.enable();
			sampleInstance.dispatch(sampleAction);
			expect(sampleInstance.getActionQueue()).toEqual([]);
			sampleInstance.clearActionQueue();
			expect(sampleInstance.getActionQueue()).toEqual([]);
			expect(sampleInstance.isEnabled()).toEqual(true);
			expect(sampleInstance.isPaused()).toEqual(false);
		});
		test("isn't needed when Resumed, Disabled", () => {
			sampleInstance.resume();
			sampleInstance.disable();
			sampleInstance.dispatch(sampleAction);
			expect(sampleInstance.getActionQueue()).toEqual([]);
			sampleInstance.clearActionQueue();
			expect(sampleInstance.getActionQueue()).toEqual([]);
			expect(sampleInstance.isEnabled()).toEqual(false);
			expect(sampleInstance.isPaused()).toEqual(false);
		});
		test('returns self', () => {
			expect(sampleInstance.clearActionQueue()).toBe(sampleInstance);
		});
	});

	describe('/collapseActionQueue', () => {
		const sampleState = {
			state: sampleRange(100, 1000),
			context: { context: sampleRange(100, 1000) },
		};
		const sampleAction = {
			action: sampleRange(1, 5),
			payload: { value: sampleRange(100, 1000) },
		};
		beforeEach(() => {
			sampleInstance.init({
				rootReducer: testReducer(sampleState.state),
				...sampleState,
			});
		});
		describe('when Paused', () => {
			beforeEach(() => {
				sampleInstance.pause();
			});
			test('when Enabled, clears the Action Queue and returns it along with new Context', () => {
				const reducer = sampleInstance.getReducer();
				if (!reducer) {
					throw new Error('No Reducer');
				}
				const testContext = sampleInstance.getContext();
				const extraAction = {
					action: sampleRange(100, 200),
					payload: { value: sampleRange(100, 200) },
				};
				sampleInstance.dispatch(sampleAction);
				sampleInstance.dispatch(extraAction);
				const { newState, actions } = sampleInstance.collapseActionQueue();
				expect(newState).toEqual(reducer({ ...reducer({ ...testContext, ...sampleAction }), ...extraAction }));
				expect(actions).toEqual([sampleAction, extraAction]);
				expect(sampleInstance.getActionQueue()).toEqual([]);
				expect(sampleInstance.getContext()).toEqual(newState);
				expect(sampleInstance.isPaused()).toEqual(true);
				expect(sampleInstance.isEnabled()).toEqual(true);
			});
			test("when Disabled, returns the Action Queue and Context, but doesn't change them", () => {
				sampleInstance.disable(true);
				const reducer = sampleInstance.getReducer();
				if (!reducer) {
					throw new Error('No Reducer');
				}
				const extraAction = {
					action: sampleRange(100, 200),
					payload: { value: sampleRange(100, 200) },
				};
				const testContext = sampleInstance.getContext();
				sampleInstance.dispatch(sampleAction);
				sampleInstance.dispatch(extraAction);
				const { newState, actions } = sampleInstance.collapseActionQueue();
				expect(newState).toEqual(reducer({ ...reducer({ ...testContext, ...sampleAction }), ...extraAction }));
				expect(actions).toEqual([sampleAction, extraAction]);
				expect(sampleInstance.getActionQueue()).toEqual(actions);
				expect(sampleInstance.getContext()).toEqual(testContext);
				expect(sampleInstance.isPaused()).toEqual(true);
				expect(sampleInstance.isEnabled()).toEqual(false);
			});
		});
		describe('when Resumed', () => {
			beforeEach(() => {
				sampleInstance.resume();
			});
			test('when Enabled, does not change anything, returns the current Context and empty Actions', () => {
				sampleInstance.enable();
				const reducer = sampleInstance.getReducer();
				if (!reducer) {
					throw new Error('No Reducer');
				}
				const testContext = sampleInstance.getContext();
				const extraAction = {
					action: sampleRange(100, 200),
					payload: { value: sampleRange(100, 200) },
				};
				sampleInstance.dispatch(sampleAction);
				sampleInstance.dispatch(extraAction);
				expect(sampleInstance.getActionQueue()).toEqual([]);
				const { newState, actions } = sampleInstance.collapseActionQueue();
				expect(newState).toEqual(reducer({ ...reducer({ ...testContext, ...sampleAction }), ...extraAction }));
				expect(actions).toEqual([]);
				expect(sampleInstance.getActionQueue()).toEqual([]);
				expect(sampleInstance.getContext()).toEqual(newState);
				expect(sampleInstance.isPaused()).toEqual(false);
				expect(sampleInstance.isEnabled()).toEqual(true);
			});
			test("when Disabled, returns the Action Queue and Context, but doesn't change them", () => {
				sampleInstance.disable(true);
				const reducer = sampleInstance.getReducer();
				if (!reducer) {
					throw new Error('No Reducer');
				}
				const extraAction = {
					action: sampleRange(100, 200),
					payload: { value: sampleRange(100, 200) },
				};
				const testContext = sampleInstance.getContext();
				sampleInstance.dispatch(sampleAction);
				sampleInstance.dispatch(extraAction);
				const { newState, actions } = sampleInstance.collapseActionQueue();
				expect(newState).toEqual(testContext);
				expect(actions).toEqual([]);
				expect(sampleInstance.getActionQueue()).toEqual([]);
				expect(sampleInstance.getContext()).toEqual(testContext);
				expect(sampleInstance.isPaused()).toEqual(false);
				expect(sampleInstance.isEnabled()).toEqual(false);
			});
		});
	});
});
