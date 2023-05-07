import { TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { TTurnPhase, TTurnSubAction, TTurnSubPhase, TTurnSubphaseAction, TTurnSubphaseContext } from '~/src/types/fsm';
import {
	isFertilizeAction,
	isFertilizeContext,
	isFertilizePayload,
	isFertilizeSubphase,
} from '~/src/types/guards/turnPhases';
import { TReducerTestCase } from '../../types';

import { sampleRange } from '~/src/automata/utils/fixtures';

function defaultContextBySubPhase(subPhase: TFertilizePhase) {
	switch (subPhase) {
		case TFertilizePhase.CROP_CONFIRM:
		case TFertilizePhase.IDLE:
			return Object.assign(
				{},
				{
					context: {
						index: sampleRange(0, 100),
					},
					subPhase,
				}
			);
		case TFertilizePhase.FINISHED:
			return Object.assign(
				{},
				{
					context: null,
					subPhase,
				}
			);
		default:
			return {
				subPhase: -1,
			};
	}
}

function defaultPayloadByAction(action: TFertilizeAction) {
	switch (action) {
		case TFertilizeAction.FERTILIZE:
		case TFertilizeAction.SELECT_CROP:
		case TFertilizeAction.HOVER:
			return Object.assign(
				{},
				{
					action,
					payload: {
						index: sampleRange(100),
					},
				}
			);
		case TFertilizeAction.RESET:
		case TFertilizeAction.CANCEL_SELECTION:
		case TFertilizeAction.SKIP:
			return Object.assign(
				{},
				{
					action,
					payload: null,
				}
			);
		default:
			return {
				action: -1,
			};
	}
}

export function defaultContextFixture<T extends TTurnPhase, S extends TTurnSubPhase<T>>(
	props: Partial<TTurnSubphaseContext<T, S>> = {}
): TTurnSubphaseContext<T, S> {
	for (const subPhase of Object.values(TFertilizePhase)) {
		if (isFertilizeSubphase(null)(subPhase) && isFertilizeContext(subPhase)(props)) {
			return Object.assign(defaultContextBySubPhase(subPhase), props ?? {});
		}
	}
	return Object.assign(props ?? {}, { subPhase: 0, context: null });
}

export function defaultPayloadFixture<T extends TTurnPhase, A extends TTurnSubAction<T>>(
	props: Partial<TTurnSubphaseAction<T, A>> = {}
): TTurnSubphaseAction<T, A> {
	for (const action of Object.values(TFertilizeAction)) {
		if (isFertilizeAction(null)(action) && isFertilizePayload(action)(props)) {
			return Object.assign(props ?? {}, defaultPayloadByAction(action));
		}
	}

	return Object.assign(props ?? {}, { action: 0, payload: null });
}

function defaultTestInput<
	T extends TTurnPhase,
	S extends TTurnSubPhase<T> = TTurnSubPhase<T>,
	A extends TTurnSubAction<T> = TTurnSubAction<T>
>(phase: T, action: A, subPhase: S): TReducerTestCase<T, S, A>['input'] {
	const payload = defaultPayloadFixture<T, A>({ action });
	const context = defaultContextFixture<T, S>({ subPhase });
	const fixture = {
		...payload,
		...context,
	};
	return [fixture];
}

export function setupFixtures<
	T extends TTurnPhase,
	S extends TTurnSubPhase<T> = TTurnSubPhase<T>,
	A extends TTurnSubAction<T> = TTurnSubAction<T>
>(phase: T, action: A, subPhase: S) {
	const defaultInput = defaultTestInput(phase, action, subPhase);
	const originalContext: TReducerTestCase<T, S, A>['output'] = {
		context: defaultInput[0]?.context,
		subPhase: defaultInput[0]?.subPhase,
	};
	return {
		defaultInput,
		originalContext,
	};
}
