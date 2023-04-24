import {
	IAutomataValidatorContainer,
	TAutomataBaseActionType,
	TAutomataBaseEventType,
	TAutomataBaseStateType,
} from '~/src/types/fsm/automata';
import { isPositiveInteger, TValidator } from '~/src/types/typeGuards';

export abstract class AutomataValidatorContainer<
	StateType extends TAutomataBaseStateType,
	ActionType extends TAutomataBaseActionType,
	EventType extends TAutomataBaseEventType,
	ContextType extends { [K in StateType]: any } = Record<StateType, any>,
	PayloadType extends { [K in ActionType]: any } = Record<ActionType, any>,
	EventMetaType extends { [K in EventType]: any } = Record<EventType, any>
> implements IAutomataValidatorContainer<StateType, ActionType, EventType>
{
	protected defaultEventValidator = isPositiveInteger as TValidator<EventType>;
	protected defaultStateValidator = isPositiveInteger as TValidator<StateType>;
	protected defaultActionValidator = isPositiveInteger as TValidator<ActionType>;
	#eventValidator?: TValidator<EventType>;
	#stateValidator?: TValidator<StateType>;
	#actionValidator?: TValidator<ActionType>;

	protected constructor() {}

	protected get validateEvent() {
		return this.#eventValidator ?? this.defaultEventValidator;
	}

	protected get validateAction() {
		return this.#actionValidator ?? this.defaultActionValidator;
	}

	protected get validateState() {
		return this.#stateValidator ?? this.defaultStateValidator;
	}

	setEventValidator(eventValidator: TValidator<EventType> | null = null) {
		if (eventValidator === null || eventValidator === undefined) {
			this.#eventValidator = undefined;
			return this;
		}
		if (typeof eventValidator !== 'function') throw new Error(`passed Event Validator is not a function`);
		this.#eventValidator = eventValidator;
		return this;
	}

	setActionValidator(actionValidator: TValidator<ActionType> | null = null) {
		if (actionValidator === null || actionValidator === undefined) {
			this.#actionValidator = undefined;
			return this;
		}
		if (typeof actionValidator !== 'function') throw new Error(`passed Action Validator is not a function`);
		this.#actionValidator = actionValidator;
		return this;
	}

	setStateValidator(stateValidator: TValidator<StateType> | null = null) {
		if (stateValidator === null || stateValidator === undefined) {
			this.#stateValidator = undefined;
			return this;
		}
		if (typeof stateValidator !== 'function') throw new Error(`passed State Validator is not a function`);
		this.#stateValidator = stateValidator;
		return this;
	}
}
