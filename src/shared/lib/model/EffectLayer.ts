import type { IAutomataEventBus, TAutomataEventMetaType } from '@yantrix/core';
import type { IModelStore } from './ModelStore';

/**
 * Effect Layer prototype — the missing Yantrix piece between the Event Bus and
 * the Data Model (yantrix/docs/concepts/400_data_flow, "Effects").
 *
 * Upstream already ships the *contracts* (`TAutomataEffect`, the Effect Matrix
 * on `IAutomataSlice`, the optional `model` argument of
 * `IDataDestination.update`) but no implementation. This file implements the
 * minimal working subset against the published `@yantrix/core@0.5.4` API so the
 * game can use it now; the upstream port folds it into `CoreLoop`.
 *
 * Known deviations from the spec, acceptable for the prototype:
 * - Effects apply per event, not batched once per Main Loop iteration.
 * - No distinction between Source events and Adapter-emitted events: every
 *   event listed in the matrix triggers its effects.
 */

/**
 * One pure model update: `(event, model) => model`. Mirrors upstream
 * `TAutomataEffect`, but takes the concrete `{ event, meta }` object the bus
 * delivers (the upstream generic leaves the first argument as the whole
 * event→meta map, which cannot be narrowed per event).
 */
export type TModelEffect<TModel extends object, EventId extends number = number> = (
	event: TAutomataEventMetaType<EventId, Record<EventId, unknown>>,
	model: TModel,
) => TModel;

/** Event id → ordered effects, the per-slice "Effect Matrix" from the architecture doc. */
export type TEffectMatrix<TModel extends object, EventId extends number = number> = Partial<
	Record<EventId, ReadonlyArray<TModelEffect<TModel, EventId>>>
>;

/**
 * Subscribe an Effect Matrix to the bus. On every matched event the effects run
 * left to right over the current snapshot and the result is committed to the
 * store, which notifies its subscribers (destinations, React, persistence).
 *
 * Call *after* all `registerAutomata` calls: bus subscribers run in
 * subscription order, and the spec wants FSM reducers to finish before effects.
 *
 * @returns detach function that unsubscribes every bound event.
 */
export function attachEffectLayer<TModel extends object, EventId extends number = number>(opts: {
	bus: IAutomataEventBus<EventId, Record<EventId, unknown>>;
	store: IModelStore<TModel>;
	matrix: TEffectMatrix<TModel, EventId>;
}): () => void {
	const { bus, store, matrix } = opts;
	const unsubs: Array<() => void> = [];

	for (const [key, effects] of Object.entries(matrix) as Array<
		[string, ReadonlyArray<TModelEffect<TModel, EventId>> | undefined]
	>) {
		if (!effects?.length) continue;
		const eventId = Number(key) as EventId;

		const handler = (raw: TAutomataEventMetaType<EventId, Record<EventId, unknown>>) => {
			const next = effects.reduce((model, effect) => effect(raw, model), store.get());
			store.commit(next);
			return {
				event: raw.event,
				meta: raw.meta ?? null,
				task_id: `effect_${String(raw.event)}`,
				// Effects never emit follow-up events — they only move the Model.
				result: null,
			};
		};

		bus.subscribe(eventId, handler);
		unsubs.push(() => bus.unsubscribe(eventId, handler));
	}

	return () => {
		unsubs.forEach((unsub) => unsub());
	};
}
