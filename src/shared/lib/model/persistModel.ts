import type { StoragePort } from '~/shared/storage/StoragePort';
import type { IModelStore } from './ModelStore';

/**
 * Sync Loop prototype (yantrix/docs/concepts/100_architecture: the Model "can
 * be propagated to external Storages in an independent Sync Loop").
 *
 * Writes are debounced: the Model can change on every event, but a savegame
 * only needs the latest snapshot. Restore is the caller's concern — read the
 * key via `StoragePort.get` and validate at the boundary before seeding the
 * store, same as every other external input.
 */
export function attachModelPersistence<TModel extends object>(opts: {
	store: IModelStore<TModel>;
	storage: StoragePort;
	key: string;
	debounceMs?: number;
}): () => void {
	const { store, storage, key, debounceMs = 250 } = opts;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let pending: TModel | null = null;

	const flush = () => {
		timer = null;
		if (pending === null) return;
		const snapshot = pending;
		pending = null;
		// StoragePort adapters degrade to no-op on failure; nothing to handle here.
		void storage.set(key, snapshot);
	};

	const unsubscribe = store.subscribe((model) => {
		pending = model;
		if (timer !== null) clearTimeout(timer);
		timer = setTimeout(flush, debounceMs);
	});

	return () => {
		unsubscribe();
		if (timer !== null) clearTimeout(timer);
		// Don't lose the last snapshot on teardown.
		flush();
	};
}
