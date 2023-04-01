import {
	IAutomataEventAdapter,
	TAutomataBaseActionType,
	TAutomataBaseEventType,
	TAutomataBaseStateType,
	TAutomataEventEmitter,
	TAutomataEventHandler,
	TAutomataEventMetaType,
	TAutomataStateContext,
} from '~/src/types/fsm/automata';
import { TValidator } from '~/src/types/typeGuards';
import unifyObjectKey from '~/src/utils/unifyObjectKey';

export abstract class AutomataEventAdapter<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	EventType extends TAutomataBaseEventType,
	ContextType extends { [K in StateType]: any } = Record<StateType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>,
	EventObject extends { [K in EventType]: any } = Record<EventType, any>
> implements IAutomataEventAdapter<StateType, ActionType, EventType, ContextType, PayloadType, EventObject>
{
	protected eventListeners: {
		[T in EventType]?: Array<TAutomataEventHandler<T, ActionType, EventObject, PayloadType>>;
	};
	protected eventEmitters: {
		[T in StateType]?: Array<TAutomataEventEmitter<EventType, T, EventObject, ContextType>>;
	};

	protected eventValidator?: TValidator<EventType>;
	protected stateValidator?: TValidator<StateType>;
	protected actionValidator?: TValidator<ActionType>;

	protected constructor() {
		this.eventListeners = {};
		this.eventEmitters = {};
	}

	protected get validateEvent() {
		return this.eventValidator ?? this.defaultEventValidator;
	}

	protected get validateAction() {
		return this.actionValidator ?? this.defaultActionValidator;
	}

	protected get validateState() {
		return this.stateValidator ?? this.defaultStateValidator;
	}

	public setEventValidator(eventValidator?: TValidator<EventType>) {
		if (eventValidator === null || eventValidator === undefined) {
			this.eventValidator = undefined;
			return this;
		}
		if (typeof eventValidator !== 'function') throw new Error(`passed Event Validator is not a function`);
		this.eventValidator = eventValidator;
		return this;
	}

	public setActionValidator(actionValidator?: TValidator<ActionType>) {
		if (actionValidator === null || actionValidator === undefined) {
			this.actionValidator = undefined;
			return this;
		}
		if (typeof actionValidator !== 'function') throw new Error(`passed Action Validator is not a function`);
		this.actionValidator = actionValidator;
		return this;
	}

	public setStateValidator(stateValidator?: TValidator<StateType>) {
		if (stateValidator === null || stateValidator === undefined) {
			this.stateValidator = undefined;
			return this;
		}
		if (typeof stateValidator !== 'function') throw new Error(`passed State Validator is not a function`);
		this.stateValidator = stateValidator;
		return this;
	}

	public addEventEmitter<T extends StateType>(
		on: T,
		emitter: TAutomataEventEmitter<EventType, T, EventObject, ContextType>
	) {
		if (on === null || on === undefined || !(emitter instanceof Function) || !this.validateState(on)) return null;
		this.eventEmitters = Object.assign(this.eventEmitters ?? {}, {
			[on]: (this.eventEmitters[on] ?? []).concat(emitter),
		});
		return () => {
			if (this.eventEmitters?.[on]) {
				const newEmitters = (this.eventEmitters[on] || []).filter((v) => v !== emitter);
				if (!newEmitters.length) delete this.eventEmitters[on];
				else this.eventEmitters[on] = newEmitters;
			}
		};
	}

	public addEventListener<T extends EventType>(
		type: T,
		handler: TAutomataEventHandler<T, ActionType, EventObject, PayloadType>
	) {
		if (type === null || type === undefined || !(handler instanceof Function) || !this.validateEvent(type))
			return null;
		this.eventListeners = Object.assign(this.eventListeners ?? {}, {
			[type]: [...(this.eventListeners?.[type] ?? []), handler],
		});
		return () => {
			if (this.eventListeners?.[type]) {
				const newHandlers = (this.eventListeners[type] || []).filter((v) => v !== handler);
				if (!newHandlers.length) delete this.eventListeners[type];
				else this.eventListeners[type] = newHandlers;
			}
		};
	}

	public handleEvent<T extends EventType>(
		event: TAutomataEventMetaType<T, EventObject>
	): Array<ReturnType<TAutomataEventHandler<T, ActionType, EventObject, PayloadType>>> {
		if (!event?.event) return [];
		return (this.eventListeners?.[event.event] || [])
			.map((handler) => handler(event))
			.filter((action) => this.validateAction(action.action));
	}

	public handleTransition<T extends StateType>(
		newState: TAutomataStateContext<T, ContextType>
	): Array<ReturnType<TAutomataEventEmitter<EventType, T, EventObject, ContextType>>> {
		if (!newState?.state) return [];
		return (this.eventEmitters?.[newState.state] || [])
			.map((emitter) => emitter(newState))
			.filter((event) => this.validateEvent(event.event));
	}

	public removeAllListeners<T extends EventType>(type: T | null = null) {
		switch (true) {
			case type === null:
				this.eventListeners = {};
				break;
			default:
				if (this.validateEvent(type) && this.eventListeners?.[type]) delete this.eventListeners[type];
		}
		return this;
	}

	public removeAllEmitters<T extends StateType>(type: T | null = null): this {
		switch (true) {
			case type === null:
				this.eventEmitters = {};
				break;
			default:
				if (this.validateState(type) && this.eventEmitters?.[type]) delete this.eventEmitters[type];
		}
		return this;
	}

	public getObservedEvents() {
		return Object.keys(this.eventListeners)
			.map(unifyObjectKey<EventType>)
			.filter((k) => this.eventListeners[k]?.length)
			.filter(this.validateEvent);
	}

	public getObservedStates() {
		return Object.keys(this.eventEmitters)
			.map(unifyObjectKey<StateType>)
			.filter((k) => this.eventEmitters[k]?.length)
			.filter(this.validateState);
	}

	protected defaultEventValidator = (x: any): x is EventType => x >= 0;
	protected defaultStateValidator = (x: any): x is StateType => x >= 0;
	protected defaultActionValidator = (x: any): x is EventType => x >= 0;
}

export default AutomataEventAdapter;
