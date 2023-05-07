import { AutomataValidatorContainer } from './ValidatorContainer';
import {
	TAutomataActionPayload,
	TAutomataBaseActionType,
	TAutomataBaseEventType,
	TAutomataBaseStateType,
	TAutomataParams,
	TAutomataQueue,
	TAutomataReducer,
	TAutomataStateContext,
} from '../types';

import { IAutomata, IAutomataEventAdapter } from '../types/interfaces';
import Utils from '../utils';

const { isPositiveInteger } = Utils;

export abstract class GenericAutomata<
		StateType extends TAutomataBaseStateType,
		ActionType extends TAutomataBaseActionType,
		EventType extends TAutomataBaseEventType,
		ContextType extends {
			[K in StateType]: any;
		} = Record<StateType, any>,
		PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>,
		EventMetaType extends { [K in EventType]: any } = Record<EventType, any>
	>
	extends AutomataValidatorContainer<StateType, ActionType, EventType, ContextType, PayloadType, EventMetaType>
	implements IAutomata<StateType, ActionType, EventType, ContextType, PayloadType, EventMetaType>
{
	public eventAdapter: IAutomataEventAdapter<
		StateType,
		ActionType,
		EventType,
		ContextType,
		PayloadType,
		EventMetaType
	> | null = null;

	#state: StateType | null = null;
	#context: ContextType[StateType] | null = null;
	#actionQueue: TAutomataQueue<ActionType, PayloadType> = [];
	#enabled = true;
	#paused = false;
	private rootReducer: TAutomataReducer<StateType, ActionType, ContextType, PayloadType> | null = null;

	protected constructor(
		eventAdapter: IAutomataEventAdapter<
			StateType,
			ActionType,
			EventType,
			ContextType,
			PayloadType,
			EventMetaType
		> | null = null
	) {
		super();
		if (eventAdapter) this.eventAdapter = eventAdapter;
	}

	public get state() {
		return this.#state;
	}

	public get context() {
		return this.#context;
	}

	clearActionQueue() {
		this.#actionQueue = [];
		return this;
	}

	collapseActionQueue(): {
		actions: TAutomataQueue<ActionType, PayloadType> | null;
		newState: TAutomataStateContext<StateType, ContextType>;
	} {
		const actions = (this.#actionQueue ?? []).slice();
		const newState = this.reduceQueue();
		if (this.isEnabled()) {
			this.setContext(newState);
			this.clearActionQueue();
		}
		return {
			actions,
			newState,
		};
	}

	enable() {
		this.#enabled = true;
		return this;
	}

	disable(clearQueue = false) {
		this.#enabled = false;
		if (clearQueue) this.clearActionQueue();
		return this;
	}

	isEnabled() {
		return this.#enabled ?? true;
	}

	isPaused() {
		return this.#paused ?? false;
	}

	pause() {
		this.#paused = true;
		return this;
	}

	resume() {
		this.#paused = false;
		if (this.isEnabled()) this.collapseActionQueue();
		return this;
	}

	init(params: TAutomataParams<StateType, ActionType, EventType, ContextType, PayloadType, EventMetaType>) {
		const {
			state = null,
			context,
			paused = false,
			enabled = true,
			rootReducer = null,
			stateValidator,
			eventValidator,
			actionValidator,
		} = params;
		if (rootReducer == null) this.rootReducer = null;
		else if (rootReducer instanceof Function) this.rootReducer = rootReducer;
		else throw new Error(`Invalid Root Reducer supplied: ${rootReducer}`);
		if (!this.validateState(state)) throw new Error(`Invalid initial State: ${state}`);
		this.#actionQueue = [];
		this.#enabled = enabled;
		this.#paused = paused;
		this.setContext({ state, context });
		if (stateValidator) this.setStateValidator(stateValidator);
		if (actionValidator) this.setActionValidator(actionValidator);
		if (eventValidator) this.setEventValidator(eventValidator);
		return this;
	}

	dispatch(action: TAutomataActionPayload<ActionType, PayloadType>): TAutomataStateContext<StateType, ContextType> {
		if (!this.validateAction(action?.action)) throw new Error(`Invalid Action: ${JSON.stringify(action)}`);
		if (!this.rootReducer)
			throw new Error(
				`Root Reducer is not defined. Please init the Instance with a rootReducer. Dispatched Action: ${JSON.stringify(
					action
				)}`
			);
		const reducedValue = this.rootReducer({
			...action,
			...this.reduceQueue(),
		});
		if (!reducedValue || !this.validateState(reducedValue.state))
			throw new Error(`Invalid Reduced State: ${reducedValue}`);
		if (this.isPaused()) {
			this.#actionQueue = this.getActionQueue().concat(action);
		} else if (this.isEnabled()) {
			this.clearActionQueue();
			this.setContext(reducedValue);
		}
		return reducedValue;
	}

	getContext<K extends StateType = StateType>(): TAutomataStateContext<K, ContextType> {
		return {
			state: this.state as K,
			context: this.context,
		};
	}

	getActionQueue() {
		return (this.#actionQueue ?? []).slice(0);
	}

	getReducer() {
		return this.rootReducer;
	}

	consumeAction(count = 1) {
		if (!isPositiveInteger(count)) throw new Error(`Invalid Action Count: ${count}`);
		let currentResponse: ReturnType<
			IAutomata<StateType, ActionType, EventType, ContextType, PayloadType, EventMetaType>['consumeAction']
		> = {
			action: null,
			newState: this.getContext(),
		};
		const queue = this.getActionQueue().slice(0, count);
		while (queue.length) {
			currentResponse = this.reduceQueueItem(queue, currentResponse.newState);
		}
		if (this.isEnabled()) {
			this.setActionQueue(this.getActionQueue().slice(count)).setContext(currentResponse.newState);
		}
		return currentResponse;
	}

	protected reduceQueueItem(queue = this.getActionQueue(), newState = this.getContext()) {
		if (!this.rootReducer)
			throw new Error(`Root Reducer is not defined. Please init the Instance with a rootReducer.`);
		const currentResponse: ReturnType<
			IAutomata<StateType, ActionType, EventType, ContextType, PayloadType, EventMetaType>['consumeAction']
		> = {
			action: null,
			newState: newState || this.getContext(),
		};
		if (!queue?.length) return currentResponse;
		const currentAction = queue.shift();
		if (!currentAction) return currentResponse;
		if (!this.validateAction(currentAction?.action)) throw new Error(`Invalid Action: ${currentAction}`);
		currentResponse.newState = this.rootReducer({
			...currentResponse.newState,
			...currentAction,
		});
		currentResponse.action = currentAction;
		return currentResponse;
	}

	protected reduceQueue: () => TAutomataStateContext<StateType, ContextType> = () => {
		let reducedValue = this.getContext();
		if (!this.rootReducer)
			throw new Error(`Root Reducer is not defined. Please init the Instance with a rootReducer`);
		const queue = this.getActionQueue();
		while (queue?.length) reducedValue = this.reduceQueueItem(queue, reducedValue).newState;
		return reducedValue;
	};

	protected setContext: (context?: TAutomataStateContext<StateType, ContextType> | null) => this = (
		context = null
	) => {
		if (!context || !this.validateState(context?.state)) throw new Error(`Invalid Context: ${context}`);
		this.#state = context.state;
		this.#context = context.context ?? null;
		return this;
	};

	protected setActionQueue: (queue?: TAutomataQueue<ActionType, PayloadType> | null) => this = (queue) => {
		if (!Array.isArray(queue)) throw new Error(`Invalid Action Queue: ${queue}`);
		this.#actionQueue = queue;
		return this;
	};
}

export default GenericAutomata;
