import { beforeEach, describe, expect, it } from '@jest/globals';
import 'fake-indexeddb/auto';
import { LocalStorageAdapter } from '~/shared/storage/LocalStorageAdapter';
import { IndexedDbAdapter } from '~/shared/storage/IndexedDbAdapter';
import type { StoragePort } from '~/shared/storage/StoragePort';

/** Minimal in-memory `Storage`, since the jest environment is `node`. */
function fakeLocalStorage(): Storage {
	const map = new Map<string, string>();
	return {
		get length() {
			return map.size;
		},
		clear: () => map.clear(),
		getItem: (key: string) => map.get(key) ?? null,
		key: (index: number) => [...map.keys()][index] ?? null,
		removeItem: (key: string) => void map.delete(key),
		setItem: (key: string, value: string) => void map.set(key, value),
	} as Storage;
}

const adapters: Array<[string, () => StoragePort]> = [
	['LocalStorageAdapter', () => new LocalStorageAdapter(fakeLocalStorage())],
	['IndexedDbAdapter', () => new IndexedDbAdapter()],
];

describe.each(adapters)('StoragePort contract: %s', (_name, create) => {
	let storage: StoragePort;

	beforeEach(() => {
		storage = create();
	});

	it('returns null for a key that was never written', async () => {
		expect(await storage.get('storage-contract:missing')).toBeNull();
	});

	it('round-trips an object', async () => {
		const key = `storage-contract:object:${_name}`;
		const value = { playerId: 'p1', nickname: 'Alex', nested: { ok: true } };

		await storage.set(key, value);

		expect(await storage.get(key)).toEqual(value);
	});

	it('overwrites an existing value', async () => {
		const key = `storage-contract:overwrite:${_name}`;
		await storage.set(key, { n: 1 });
		await storage.set(key, { n: 2 });

		expect(await storage.get(key)).toEqual({ n: 2 });
	});

	it('removes a value', async () => {
		const key = `storage-contract:remove:${_name}`;
		await storage.set(key, 'gone');
		await storage.remove(key);

		expect(await storage.get(key)).toBeNull();
	});

	it('treats removing an absent key as a no-op', async () => {
		await expect(storage.remove('storage-contract:absent')).resolves.toBeUndefined();
	});
});

describe('LocalStorageAdapter', () => {
	it('degrades to no-op reads when storage is unavailable', async () => {
		const storage = new LocalStorageAdapter(null);

		await storage.set('k', 'v');

		expect(await storage.get('k')).toBeNull();
	});

	it('treats a value it did not write as absent', async () => {
		const store = fakeLocalStorage();
		store.setItem('foreign', 'not json');
		const storage = new LocalStorageAdapter(store);

		expect(await storage.get('foreign')).toBeNull();
	});
});
