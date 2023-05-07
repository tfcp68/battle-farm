import {
	TAutomataActionPayload,
	TAutomataBaseActionType,
	TAutomataBaseEventType,
	TAutomataBaseStateType,
	TAutomataDispatch,
	TAutomataEffect,
	TAutomataEventEmitter,
	TAutomataEventHandler,
	TAutomataEventMetaType,
	TAutomataEventStack,
	TAutomataParams,
	TAutomataQueue,
	TAutomataReducer,
	TAutomataStateContext,
	TSubscriptionCancelFunction,
	TValidator,
} from './index';

export interface TAutomataEventContainer<EventType extends TAutomataBaseEventType> {
	validateEvent?: TValidator<EventType>;

	setEventValidator(eventValidator?: TValidator<EventType>): this;
}

export interface IAutomataValidatorContainer<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	EventType extends TAutomataBaseEventType
> extends TAutomataEventContainer<EventType> {
	setStateValidator(stateValidator?: TValidator<StateType>): this;

	setActionValidator(actionValidator?: TValidator<ActionType>): this;
}

export interface IAutomataEventAdapter<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	EventType extends TAutomataBaseEventType,
	ContextType extends { [K in StateType]: any } = Record<StateType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>,
	EventMetaType extends { [K in EventType]: any } = Record<EventType, any>
> extends IAutomataValidatorContainer<StateType, ActionType, EventType> {
	addEventListener: <T extends EventType>(
		type: T,
		handler: TAutomataEventHandler<T, ActionType, EventMetaType, PayloadType>
	) => null | TSubscriptionCancelFunction;
	addEventEmitter: <T extends StateType>(
		on: T,
		emitter: TAutomataEventEmitter<EventType, T, EventMetaType, ContextType>
	) => null | TSubscriptionCancelFunction;
	handleEvent: <T extends EventType>(
		event: TAutomataEventMetaType<T, EventMetaType>
	) => Array<ReturnType<TAutomataEventHandler<T, ActionType, EventMetaType, PayloadType>>>;
	handleTransition: <T extends StateType>(
		newState: TAutomataStateContext<T, ContextType>
	) => Array<ReturnType<TAutomataEventEmitter<EventType, T, EventMetaType, ContextType>>>;
	removeAllListeners: <T extends EventType>(type: T | null) => this;
	removeAllEmitters: <T extends StateType>(type: T | null) => this;
	getObservedEvents: () => EventType[];
	getObservedStates: () => StateType[];
}

export interface IAutomata<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	EventType extends TAutomataBaseEventType,
	ContextType extends {
		[K in StateType]: any;
	} = Record<StateType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>,
	EventMetaType extends { [K in EventType]: any } = Record<EventType, any>
> extends TAutomataStateContext<StateType, ContextType>,
		IAutomataValidatorContainer<StateType, ActionType, EventType> {
	eventAdapter: IAutomataEventAdapter<
		StateType,
		ActionType,
		EventType,
		ContextType,
		PayloadType,
		EventMetaType
	> | null;

	/**
	 * Reset the Instance and provide a Reducer, new State and optionally Validators
	 */
	init: (params: TAutomataParams<StateType, ActionType, EventType, ContextType, PayloadType, EventMetaType>) => this;

	/**
	 * Return current Reducer function
	 */
	getReducer: () => TAutomataReducer<StateType, ActionType, ContextType, PayloadType> | null;

	/**
	 * When the Instance is Disabled, Consuming Actions doesn't change the internal state
	 */
	enable: () => this;
	disable: (clearQueue?: boolean) => this;
	isEnabled: () => boolean;

	/**
	 * When the Instance is Paused, dispatched Actions aren't Consumed, but put into the Queue instead
	 */
	isPaused: () => boolean;

	pause: () => this;
	/**
	 * Resuming will Collapse the Queue, unless the Instance is Disabled
	 */
	resume: () => this;

	/**
	 * Returns internal State and Context of the Instance
	 */
	getContext: <K extends StateType = StateType>() => TAutomataStateContext<K, ContextType>;

	/**
	 * Consume all Actions in the Queue and return the resulting State
	 * Works even when Paused
	 * When Disabled, consumed Actions don't change the internal State
	 * Returns the final result of all consumed Actions
	 */
	collapseActionQueue: () => {
		actions: TAutomataQueue<ActionType, PayloadType> | null;
		newState: TAutomataStateContext<StateType, ContextType>;
	};

	getActionQueue: () => TAutomataQueue<ActionType, PayloadType>;
	clearActionQueue: () => this;

	/**
	 * Pop at most [count] Actions from the Queue and Consume them
	 * Works even when Paused
	 * When Disabled, consumed Actions don't change the internal State
	 * Returns the final result of all consumed Actions
	 * @param count Number of Actions to consume, defaults to 1
	 */
	consumeAction: (count: number) => {
		action: TAutomataActionPayload<ActionType, PayloadType> | null;
		newState: TAutomataStateContext<StateType, ContextType>;
	};

	/**
	 * Consume Action and return the new State and its context
	 * The Queue is Collapsed beforehand, if not Disabled
	 * When Paused, puts an Action into the Queue instead
	 * When Disabled, doesn't change the internal State
	 * Returns the final result of all Actions, including the Queue
	 */
	dispatch: TAutomataDispatch<StateType, ActionType, ContextType, PayloadType>;
}

export interface IAutomataSlice<
	EventType extends TAutomataBaseEventType,
	EventMetaType extends { [K in EventType]: any } = Record<EventType, any>,
	ModelType extends object = Record<string, any>
> extends TAutomataEventContainer<EventType> {
	getMachines: Record<string, IAutomata<any, any, EventType>>;
	addMachine: <
		StateType extends TAutomataBaseStateType,
		ActionType extends TAutomataBaseActionType,
		ContextType extends { [K in StateType]: any } = Record<StateType, any>,
		PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>
	>(
		machineId: string,
		automata: IAutomata<StateType, ActionType, EventType, ContextType, PayloadType, EventMetaType>
	) => this;
	removeMachine: (machineId: string) => this;
	getCompositeState: Record<string, TAutomataStateContext<any, any>>;
	restoreState: (machineId: string, state: TAutomataStateContext<any, any>) => this;
	restoreCompositeState: (compositeState: Record<string, TAutomataStateContext<any, any>>) => this;
	getEventMatrix: () => Record<EventType, Array<TAutomataEffect<ModelType, EventType>>>;
	dispatchEvent: (event: TAutomataEventMetaType<EventType, EventMetaType>) => this;
	start: () => this;
	stop: (clearStack: boolean) => this;
	isRunning: () => boolean;
	getEventStack: () => TAutomataEventStack<EventType, EventMetaType>;
	clearEventStack: () => this;
	consumeEvent: () => {
		events: TAutomataEventStack<EventType, EventMetaType>;
		effects: Array<TAutomataEffect<ModelType, EventType>>;
	};
	getEventEffects: (event: EventType) => Array<TAutomataEffect<ModelType, EventType>>;
}
