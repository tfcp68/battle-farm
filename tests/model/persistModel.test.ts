import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { attachModelPersistence, ModelStore } from '~/shared/lib/model';
import type { StoragePort } from '~/shared/storage/StoragePort';

interface TestModel {
	coins: number;
}

/** In-memory StoragePort — the contract is covered against real adapters in tests/storage. */
function memoryStorage(): StoragePort & { data: Map<string, unknown> } {
	const data = new Map<string, unknown>();
	return {
		data,
		get: async <T>(key: string) => (data.has(key) ? (data.get(key) as T) : null),
		set: async (key, value) => void data.set(key, value),
		remove: async (key) => void data.delete(key),
	};
}

const KEY = 'battle-farm:test-savegame';

describe('attachModelPersistence', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('writes the latest snapshot once after the debounce window', async () => {
		const store = new ModelStore<TestModel>({ coins: 0 });
		const storage = memoryStorage();
		const setSpy = jest.spyOn(storage, 'set');
		attachModelPersistence({ store, storage, key: KEY, debounceMs: 100 });

		store.commit({ coins: 1 });
		store.commit({ coins: 2 });
		store.commit({ coins: 3 });
		jest.advanceTimersByTime(100);
		await Promise.resolve();

		expect(setSpy).toHaveBeenCalledTimes(1);
		expect(storage.data.get(KEY)).toEqual({ coins: 3 });
	});

	it('does not write before the debounce window elapses', () => {
		const store = new ModelStore<TestModel>({ coins: 0 });
		const storage = memoryStorage();
		attachModelPersistence({ store, storage, key: KEY, debounceMs: 100 });

		store.commit({ coins: 1 });
		jest.advanceTimersByTime(99);

		expect(storage.data.has(KEY)).toBe(false);
	});

	it('detach flushes the pending snapshot instead of dropping it', () => {
		const store = new ModelStore<TestModel>({ coins: 0 });
		const storage = memoryStorage();
		const detach = attachModelPersistence({ store, storage, key: KEY, debounceMs: 100 });

		store.commit({ coins: 7 });
		detach();

		expect(storage.data.get(KEY)).toEqual({ coins: 7 });
	});

	it('stops tracking commits after detach', () => {
		const store = new ModelStore<TestModel>({ coins: 0 });
		const storage = memoryStorage();
		const detach = attachModelPersistence({ store, storage, key: KEY, debounceMs: 100 });
		detach();

		store.commit({ coins: 9 });
		jest.advanceTimersByTime(1000);

		expect(storage.data.has(KEY)).toBe(false);
	});

	it('restore is a plain StoragePort.get of the persisted key', async () => {
		const store = new ModelStore<TestModel>({ coins: 4 });
		const storage = memoryStorage();
		const detach = attachModelPersistence({ store, storage, key: KEY, debounceMs: 100 });
		store.commit({ coins: 11 });
		detach();

		expect(await storage.get<TestModel>(KEY)).toEqual({ coins: 11 });
	});
});
