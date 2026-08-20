import type { TimedCoreLoop } from '@yantrix/core';
import { type AppModel, createGameEffectMatrix, emptyAppModel } from '~/entities/game';
import { attachEffectLayer, ModelStore } from '~/shared/lib/model';
import { GameDomainEvents } from './gameDomainEvents';

/**
 * The application's Data Model store and its Effect Layer, wired to the
 * CoreLoop bus.
 *
 * Module-level for the same reason the loop itself is: one model per session,
 * reachable from React (`useSyncExternalStore` in phase 5) and from
 * destinations (snapshot broadcast in phase 4) without threading it through
 * props.
 */

let store: ModelStore<AppModel> | null = null;
let detachEffects: (() => void) | null = null;

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		detachEffects?.();
		detachEffects = null;
		store = null;
	});
}

/** The current model store; throws before `attachGameEffects` has run. */
export function getAppModelStore(): ModelStore<AppModel> {
	if (!store) throw new Error('App model store is not initialised — startYantrixCore has not run');
	return store;
}

/**
 * Creates the store and subscribes the game Effect Matrix to the loop's bus.
 *
 * Must run *after* every `registerAutomata` call: bus subscribers fire in
 * subscription order, and the FSMs are supposed to finish their transitions
 * before the effects touch the model.
 */
export function attachGameEffects(loop: TimedCoreLoop<number, Record<number, unknown>>): ModelStore<AppModel> {
	if (store) return store;

	store = new ModelStore<AppModel>(emptyAppModel());
	detachEffects = attachEffectLayer({
		bus: loop.getBus(),
		store,
		matrix: createGameEffectMatrix(GameDomainEvents),
	});
	return store;
}
