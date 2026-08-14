/**
 * Anemic Data Model store — the "Model" of the Yantrix MVC triad
 * (yantrix/docs/concepts/400_data_flow: a serializable snapshot that fully
 * describes the app, like a savegame). Prototyped here in battle-farm; once
 * proven in the game loop it moves upstream next to `CoreLoop`.
 *
 * The store holds one immutable snapshot. Only the Effect Layer commits new
 * snapshots (see `EffectLayer.ts`); everything else reads or subscribes.
 */

export type TModelListener<TModel extends object> = (model: TModel, prev: TModel) => void;

export interface IModelStore<TModel extends object> {
	get: () => TModel;
	/** Replace the snapshot and notify listeners. No-op when the reference is unchanged. */
	commit: (next: TModel) => void;
	subscribe: (listener: TModelListener<TModel>) => () => void;
}

export class ModelStore<TModel extends object> implements IModelStore<TModel> {
	#model: TModel;
	readonly #listeners = new Set<TModelListener<TModel>>();

	constructor(initial: TModel) {
		this.#model = initial;
	}

	get(): TModel {
		return this.#model;
	}

	commit(next: TModel): void {
		if (next === this.#model) return;
		const prev = this.#model;
		this.#model = next;
		this.#listeners.forEach((listener) => listener(next, prev));
	}

	subscribe(listener: TModelListener<TModel>): () => void {
		this.#listeners.add(listener);
		return () => {
			this.#listeners.delete(listener);
		};
	}
}
