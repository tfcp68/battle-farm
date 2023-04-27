import { TValidator } from '~/src/types/typeGuards';

export type TAutomataBaseStateType = number;
export type TAutomataBaseActionType = number;
export type TAutomataBaseEventType = number;

export type TAutomataStateContainer<StateType extends TAutomataBaseStateType> = {
	state: StateType | null;
};

export type TAutomataActionContainer<ActionType extends TAutomataBaseActionType> = {
	action: ActionType | null;
};

export type TAutomataEventContainer<EventType extends TAutomataBaseEventType> = {
	event: EventType | null;
};

export type TAutomataStateContext<
	StateType extends TAutomataBaseStateType,
	ContextType extends { [K in StateType]: any }
> = TAutomataStateContainer<StateType> & {
	context: ContextType[StateType] | null;
};

export type TAutomataActionPayload<
	ActionType extends TAutomataBaseActionType,
	PayloadType extends { [K in ActionType]: any }
> = TAutomataActionContainer<ActionType> & {
	payload: PayloadType[ActionType] | null;
};

export type TAutomataEventMetaType<
	EventType extends TAutomataBaseEventType,
	EventMetaType extends { [K in EventType]: any } = Record<EventType, any>
> = TAutomataEventContainer<EventType> & {
	meta: EventMetaType[EventType] | null;
};

export type TAutomataEventHandler<
	EventType extends TAutomataBaseEventType,
	ActionType extends TAutomataBaseActionType,
	EventMetaType extends { [K in EventType]: any } = Record<EventType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>
> = (event: TAutomataEventMetaType<EventType, EventMetaType>) => TAutomataActionPayload<ActionType, PayloadType>;

export type TAutomataEventEmitter<
	EventType extends TAutomataBaseEventType,
	StateType extends TAutomataBaseStateType,
	EventMetaType extends { [K in EventType]: any } = Record<EventType, any>,
	ContextType extends { [K in StateType]: any } = Record<StateType, any>
> = (state: TAutomataStateContext<StateType, ContextType>) => TAutomataEventMetaType<EventType, EventMetaType>;

export type TAutomataEvent<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	ContextType extends { [K in StateType]: any } = Record<StateType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>
> = TAutomataStateContext<StateType, ContextType> & TAutomataActionPayload<ActionType, PayloadType>;

export type TAutomataReducer<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	ContextType extends { [K in StateType]: any } = Record<StateType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>,
	NewStateType extends StateType = StateType
> = (
	params: TAutomataEvent<StateType, ActionType, ContextType, PayloadType>
) => TAutomataStateContext<NewStateType, ContextType>;

export type TAutomataDispatch<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	ContextType extends { [K in StateType]: any } = Record<StateType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>,
	NewStateType extends StateType = StateType
> = (
	action: TAutomataActionPayload<ActionType, PayloadType>
) => ReturnType<TAutomataReducer<StateType, ActionType, ContextType, PayloadType, NewStateType>>;

type TSubscriptionCancelFunction = () => void;

export interface IAutomataValidatorContainer<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	EventType extends TAutomataBaseEventType
> {
	setEventValidator(eventValidator?: TValidator<EventType>): this;

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

export type TAutomataParams<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	EventType extends TAutomataBaseEventType,
	ContextType extends {
		[K in StateType]: any;
	} = Record<StateType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>,
	EventMetaType extends { [K in EventType]: any } = Record<EventType, any>
> = TAutomataStateContext<StateType, ContextType> & {
	rootReducer: TAutomataReducer<StateType, ActionType, ContextType, PayloadType>;
	stateValidator?: TValidator<StateType>;
	actionValidator?: TValidator<ActionType>;
	eventValidator?: TValidator<EventType>;
	enabled?: boolean;
	paused?: boolean;
};

export type TAutomataQueue<
	ActionType extends TAutomataBaseActionType,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>
> = Array<TAutomataActionPayload<ActionType, PayloadType>>;

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
