import { TAutomataReducer } from '../../types';

import { IAutomata, IAutomataEventAdapter } from '../../types/interfaces';
import Utils from '../../utils';

const { isPositiveInteger } = Utils;

export type TTestEvent = number;
export type TTestAction = number;
export type TTestState = number;
export type TTestEventMeta<T extends TTestEvent> = {
	[key in T]: { meta: string };
};
export type TTestPayload<T extends TTestAction> = {
	[key in T]: Record<string, number>;
};
export type TTestContext<T extends TTestState> = {
	[key in T]: { context: number };
};
export type TTestEventAdapter = IAutomataEventAdapter<
	TTestState,
	TTestAction,
	TTestEvent,
	TTestContext<TTestState>,
	TTestPayload<TTestAction>,
	TTestEventMeta<TTestEvent>
>;

export type TTestAutomata = IAutomata<
	TTestState,
	TTestAction,
	TTestEvent,
	TTestContext<TTestState>,
	TTestPayload<TTestAction>,
	TTestEventMeta<TTestEvent>
>;

export const testStateValidator = (x: any): x is TTestState => isPositiveInteger(x);
export const testActionValidator = (x: any): x is TTestAction => isPositiveInteger(x);
export const testEventValidator = (x: any): x is TTestEvent => isPositiveInteger(x);

/**
 * Sample reducer that adds numbers
 * @param state - numeric value
 * @param context - numeric context, defaults to 0
 * @param payload - numeric payload, defaults to 0
 * @param action - numeric action
 * @returns {state,context}, where State is overwritten by Action, and Payload is added to Context
 */
export const testReducer: TAutomataReducer<
	TTestState,
	TTestAction,
	TTestContext<TTestState>,
	TTestPayload<TTestAction>
> = ({ state, context, payload, action }) => {
	if (testStateValidator(state))
		return {
			state: action,
			context: {
				context: (context?.context || 0) + (payload?.payload || 0),
			},
		};
	return { state, context };
};
