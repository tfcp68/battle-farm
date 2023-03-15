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

export abstract class AutomataEventAdapter<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	EventType extends TAutomataBaseEventType,
	ContextType extends { [K in StateType]: any } = Record<StateType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>,
	EventObject extends { [K in EventType]: any } = Record<EventType, any>
> implements
		IAutomataEventAdapter<
			StateType,
			ActionType,
			EventType,
			ContextType,
			PayloadType,
			EventObject
		>
{
	protected eventListeners: {
		[T in EventType]?: Array<
			TAutomataEventHandler<T, ActionType, EventObject, PayloadType>
		>;
	};
	protected eventEmitters: {
		[T in StateType]?: Array<
			TAutomataEventEmitter<EventType, T, EventObject, ContextType>
		>;
	};

	protected eventValidator?: TValidator<EventType>;

	protected constructor() {
		this.eventListeners = {};
		this.eventEmitters = {};
	}

	public setEventValidator(eventValidator?: TValidator<EventType>) {
		if (eventValidator === null || eventValidator === undefined)
			this.eventValidator = undefined;
		if (!(eventValidator instanceof Function))
			throw new Error(`passed Event Validator is not a function`);
		this.eventValidator = eventValidator;
		return this;
	}

	public addEventEmitter<T extends StateType>(
		on: T,
		emitter: TAutomataEventEmitter<EventType, T, EventObject, ContextType>
	) {
		if (!on || !emitter) return null;
		this.eventEmitters = Object.assign(this.eventEmitters ?? {}, {
			[on]: (this.eventEmitters[on] ?? []).concat(emitter),
		});
		return () => {
			if (this?.eventEmitters?.[on])
				this.eventEmitters[on] = this.eventEmitters?.[on]?.filter(
					(v) => v === emitter
				);
		};
	}

	public addEventListener<T extends EventType>(
		type: T,
		handler: TAutomataEventHandler<T, ActionType, EventObject, PayloadType>
	) {
		if (
			type === null ||
			type === undefined ||
			!(handler instanceof Function) ||
			(this.eventValidator && !this.eventValidator(type))
		)
			return null;
		this.eventListeners = Object.assign(this.eventListeners ?? {}, {
			[type]: [...(this.eventListeners?.[type] ?? []), handler],
		});
		return () => {
			if (this.eventListeners?.[type]) {
				const newHandlers = (this.eventListeners[type] || []).filter(
					(v) => v !== handler
				);
				if (!newHandlers.length) delete this.eventListeners[type];
				else this.eventListeners[type] = newHandlers;
			}
		};
	}

	public handleEvent<T extends EventType>(
		event: TAutomataEventMetaType<T, EventObject>
	): Array<
		ReturnType<
			TAutomataEventHandler<T, ActionType, EventObject, PayloadType>
		>
	> {
		if (!event?.event) return [];
		return (this.eventListeners?.[event.event] || []).map((handler) =>
			handler(event)
		);
	}

	public handleTransition<T extends StateType>(
		newState: TAutomataStateContext<T, ContextType>
	): Array<
		ReturnType<
			TAutomataEventEmitter<EventType, T, EventObject, ContextType>
		>
	> {
		if (!newState?.state) return [];
		return (this.eventEmitters?.[newState.state] || []).map((emitter) =>
			emitter(newState)
		);
	}

	public removeAllListeners<T extends EventType>(type: T | null = null) {
		if (type === null) {
			this.eventListeners = {};
		} else if (this.eventListeners?.[type]) {
			delete this.eventListeners[type];
		}
		return this;
	}

	public removeAllEmitters<T extends StateType>(type: T | null = null): this {
		if (type === null) {
			this.eventEmitters = {};
		} else if (this.eventEmitters?.[type]) {
			delete this.eventEmitters[type];
		}
		return this;
	}

	public getObservedEvents() {
		return (
			Object.keys(this.eventListeners).map((k) =>
				parseInt(k)
			) as EventType[]
		)
			.filter((k) => this.eventListeners[k]?.length)
			.filter(this.eventValidator ?? this.defaultEventValidator);
	}

	public getObservedStates() {
		return (
			Object.keys(this.eventEmitters).map((k) =>
				parseInt(k)
			) as StateType[]
		).filter((k) => this.eventEmitters[k]?.length);
	}

	protected defaultEventValidator = (x: any): x is EventType => x >= 0;
}

export default AutomataEventAdapter;
