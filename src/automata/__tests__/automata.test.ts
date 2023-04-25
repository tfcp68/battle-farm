import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { GenericAutomata } from '~/src/automata/Automata';
import AutomataEventAdapter from '~/src/automata/EventAdapter';
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

describe(`Automata`, () => {
	let sampleInstance: AutomataTest = new AutomataTest();
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
		});
		test('throws an error when calling `collapseActionQueue`', () => {
			expect(() => sampleInstance.collapseActionQueue()).toThrowError();
		});
	});

	describe('Pausing/Resuming', () => {
		beforeEach(() => {
			const sampleState = sampleRange(0, 100);
			const sampleContext = null;
			sampleInstance.init({
				state: sampleState,
				context: sampleContext,
				rootReducer: (params) => ({
					context: params?.context ?? sampleContext,
					state: params?.state ?? sampleState,
				}),
			});
		});
		describe('when Paused', () => {
			beforeEach(() => {
				sampleInstance.pause();
				sampleInstance.dispatch({
					action: 0,
					payload: null,
				});
				expect(sampleInstance.getActionQueue()?.length).toBe(1);
			});
			test('resumes the Disabled Automata without flushing the queue', () => {
				sampleInstance.disable();
				sampleInstance.resume();
				expect(sampleInstance.isPaused()).toBe(false);
				expect(sampleInstance.getActionQueue()?.length).toBe(1);
			});
			test('resumes the Enabled Automata, Consuming the queue', () => {
				sampleInstance.enable();
				sampleInstance.resume();
				expect(sampleInstance.isPaused()).toBe(false);
				expect(sampleInstance.getActionQueue()?.length).toBe(0);
			});
		});
		describe('when Resumed', () => {
			beforeEach(() => {
				sampleInstance.resume();
			});
			test('pauses the Automata', () => {
				sampleInstance.pause();
				expect(sampleInstance.isPaused()).toBe(true);
			});
		});
	});
});
