import { AutomataValidatorContainer } from '~/src/automata/ValidatorContainer';
import {
	IAutomata,
	IAutomataEventAdapter,
	TAutomataActionPayload,
	TAutomataBaseActionType,
	TAutomataBaseEventType,
	TAutomataBaseStateType,
	TAutomataParams,
	TAutomataQueue,
	TAutomataReducer,
	TAutomataStateContext,
} from '~/src/types/fsm/automata';

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
			enabled = false,
			rootReducer = null,
			stateValidator,
			eventValidator,
			actionValidator,
		} = params;
		if (rootReducer instanceof Function) this.rootReducer = rootReducer;
		else if (rootReducer) throw new Error(`Invalid Root Reducer supplied: ${rootReducer}`);
		else this.rootReducer = null;
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
		if (!this.validateAction(action?.action)) throw new Error(`Invalid Action: ${action}`);
		if (!this.rootReducer)
			throw new Error(
				`Root Reducer is not defined. Please init the Instance with a rootReducer. Dispatched Action: ${action}`
			);
		const reducedValue = this.rootReducer({
			...action,
			...this.reduceQueue(),
		});
		if (!reducedValue || !this.validateState(reducedValue.state))
			throw new Error(`Invalid Reduced State: ${reducedValue}`);
		if (this.isPaused()) this.#actionQueue = [...(this.#actionQueue ?? []).concat(action)];
		if (this.isEnabled()) {
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
		return this.#actionQueue ?? [];
	}

	getReducer() {
		return this.rootReducer;
	}

	consumeAction() {
		const currentResponse = {
			action: null,
			newState: this.getContext(),
		};
		if (!this.getActionQueue()?.length) return currentResponse;
		const action = this.getActionQueue().shift() || null;
		if (null == action) return currentResponse;
		if (!this.rootReducer)
			throw new Error(
				`Root Reducer is not defined. Please init the Instance with a rootReducer. Dispatched Action: ${action}`
			);
		const newState = this.rootReducer({
			...this.getContext(),
			...action,
		});
		if (this.isEnabled()) this.setContext(newState);
		return { action, newState };
	}

	protected reduceQueue: () => TAutomataStateContext<StateType, ContextType> = () => {
		let reducedValue = this.getContext();
		if (!this.rootReducer)
			throw new Error(`Root Reducer is not defined. Please init the Instance with a rootReducer`);
		while (this.getActionQueue().length) {
			const action = this.getActionQueue().shift();
			if (action == null) return reducedValue;
			if (!this.validateAction(action?.action)) throw new Error(`Invalid Action: ${action}`);
			reducedValue = this.rootReducer({
				...action,
				...reducedValue,
			});
		}
		return reducedValue;
	};

	protected setContext: (context?: TAutomataStateContext<StateType, ContextType> | null) => this = (
		context = null
	) => {
		if (!context || !this.validateState(context?.state)) throw new Error(`Invalid Context: ${context}`);
		this.#state = context.state;
		this.#context = context.context ?? null;
		this.clearActionQueue();
		return this;
	};
}

export default GenericAutomata;
