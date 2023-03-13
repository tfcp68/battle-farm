import {
	IAutomata,
	IAutomataEventAdapter,
	TAutomataActionPayload,
	TAutomataBaseActionType,
	TAutomataBaseEventType,
	TAutomataBaseStateType,
	TAutomataParams,
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
> implements IAutomata<StateType, ActionType, EventType, ContextType, PayloadType, EventMetaType>
{
	public eventAdapter: IAutomataEventAdapter<
		StateType,
		ActionType,
		EventType,
		ContextType,
		PayloadType,
		EventMetaType
	> | null;
	public state: StateType | null;
	public context: ContextType[StateType] | null;
	protected actionQueue: Array<TAutomataActionPayload<ActionType, PayloadType>> | null;
	protected stateValidator?: (t: any) => t is StateType;
	protected actionValidator?: (t: any) => t is ActionType;
	protected eventValidator?: (t: any) => t is EventType;
	private rootReducer: TAutomataReducer<StateType, ActionType, ContextType, PayloadType> | null;

	protected constructor() {
		this.state = null;
		this.context = null;
		this.rootReducer = null;
		this.actionQueue = [];
		this.eventAdapter = null;
	}

	init(params: TAutomataParams<StateType, ActionType, EventType, ContextType, PayloadType, EventMetaType>) {
		const { state = null, context, rootReducer = null, stateValidator, eventValidator, actionValidator } = params;
		if (stateValidator instanceof Function && !stateValidator(state))
			throw new Error(`Invalid initial State: ${this.state}`);
		this.state = state;
		if (state) this.context = context;
		else this.context = null;
		if (rootReducer instanceof Function) this.rootReducer = rootReducer;
		else this.rootReducer = null;
		if (stateValidator instanceof Function) this.stateValidator = stateValidator;
		else if (stateValidator) throw new Error(`Invalid State Validator provided: ${stateValidator}`);
		else this.stateValidator = undefined;
		if (eventValidator instanceof Function) this.eventValidator = eventValidator;
		else if (eventValidator) throw new Error(`Invalid Event Validator provided: ${eventValidator}`);
		else this.eventValidator = undefined;
		if (actionValidator instanceof Function) this.actionValidator = actionValidator;
		else if (actionValidator) throw new Error(`Invalid Action Validator provided: ${actionValidator}`);
		else this.actionValidator = undefined;

		return this;
	}

	dispatch(action: TAutomataActionPayload<ActionType, PayloadType>): TAutomataStateContext<StateType, ContextType> {
		if (!action?.action || (this.actionValidator && !this.actionValidator(action.action)))
			throw new Error(`Invalid Action: ${action?.action}`);
		if (this.actionQueue) this.actionQueue.push(action);
		return this.rootReducer
			? this.rootReducer({
					...action,
					...this.getState(),
			  })
			: this.getState();
	}

	getState<K extends StateType = StateType>(): TAutomataStateContext<K, ContextType> {
		return {
			state: this.state as K,
			context: this.context,
		};
	}

	getActionQueue() {
		return this.actionQueue ?? [];
	}

	getReducer() {
		return this.rootReducer;
	}

	consumeAction() {
		const currentResponse = {
			action: null,
			newState: {
				state: this.state,
				context: this.context,
			},
		};
		if (!this.actionQueue?.length) return currentResponse;
		const action = this.actionQueue.shift() || null;
		if (!action) return currentResponse;
		const newState = this.rootReducer
			? this.rootReducer({
					state: this.state,
					context: this.context,
					...action,
			  })
			: currentResponse.newState;
		return { action, newState };
	}
}

export default GenericAutomata;
