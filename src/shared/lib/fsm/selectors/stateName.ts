import { statesDictionary as fertilizingStates } from '~/shared/lib/fsm/game/FertilizingAutomata';
import { statesDictionary as harvestStates } from '~/shared/lib/fsm/game/HarvestAutomata';
import { statesDictionary as shoppingStates } from '~/shared/lib/fsm/game/ShoppingAutomata';
import { statesDictionary as tradingStates } from '~/shared/lib/fsm/game/TradingAutomata';
import { statesDictionary as waitingStates } from '~/shared/lib/fsm/game/WaitingAutomata';

/**
 * A state's name from its id — the mapping the generator already holds, but
 * only exposes one way round.
 *
 * The return type is derived from the dictionary, so a state added to a diagram
 * breaks the build at the consumer that switches on the old set, instead of
 * quietly falling through to a default. That default is exactly what the five
 * hand-written `id -> 'browsing'` tables this replaces used to do, which made
 * every new state read as `idle` until somebody noticed.
 *
 * `null` means "this machine has not started", not "IDLE" — the two are
 * different and only the caller knows which one matters.
 */
export function stateNamesOf<D extends Record<string, number>>(dict: D) {
	const byId = new Map<number, keyof D>();
	for (const [name, id] of Object.entries(dict)) byId.set(id, name);
	return (state: number | null): keyof D | null => (state === null ? null : (byId.get(state) ?? null));
}

export type HarvestStateName = keyof typeof harvestStates;
export type ShoppingStateName = keyof typeof shoppingStates;
export type TradingStateName = keyof typeof tradingStates;
export type FertilizeStateName = keyof typeof fertilizingStates;
export type WaitingStateName = keyof typeof waitingStates;

export const harvestStateName = stateNamesOf(harvestStates);
export const shoppingStateName = stateNamesOf(shoppingStates);
export const tradingStateName = stateNamesOf(tradingStates);
export const fertilizeStateName = stateNamesOf(fertilizingStates);
export const waitingStateName = stateNamesOf(waitingStates);
