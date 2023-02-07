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

	protected constructor() {
		this.eventListeners = {};
		this.eventEmitters = {};
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
		if (!type || !handler) return null;
		this.eventListeners = Object.assign(this.eventListeners ?? {}, {
			[type]: (this.eventListeners[type] ?? []).concat(handler),
		});
		return () => {
			if (this?.eventListeners?.[type])
				this.eventListeners[type] = this.eventListeners?.[type]?.filter(
					(v) => v === handler
				);
		};
	}

	handleEvent<T extends EventType>(
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
}

export default AutomataEventAdapter;
