import type { StoragePort } from './StoragePort';

const DB_NAME = 'battle-farm';
const DB_VERSION = 1;
const STORE = 'kv';

function promisify<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

/**
 * IndexedDB-backed {@link StoragePort} — one object store used as a key/value
 * map. The handle is memoised because opening per call would serialise every
 * read behind a fresh connection.
 */
export class IndexedDbAdapter implements StoragePort {
	#dbPromise: Promise<IDBDatabase | null> | null = null;

	#open(): Promise<IDBDatabase | null> {
		if (this.#dbPromise) return this.#dbPromise;

		this.#dbPromise = new Promise<IDBDatabase | null>((resolve) => {
			if (typeof indexedDB === 'undefined') {
				resolve(null);
				return;
			}
			let request: IDBOpenDBRequest;
			try {
				request = indexedDB.open(DB_NAME, DB_VERSION);
			} catch {
				resolve(null);
				return;
			}
			request.onupgradeneeded = () => {
				if (!request.result.objectStoreNames.contains(STORE)) {
					request.result.createObjectStore(STORE);
				}
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => resolve(null);
		});

		return this.#dbPromise;
	}

	async #withStore<T>(
		mode: IDBTransactionMode,
		run: (store: IDBObjectStore) => IDBRequest<T>,
	): Promise<T | null> {
		const db = await this.#open();
		if (!db) return null;
		try {
			const tx = db.transaction(STORE, mode);
			return await promisify(run(tx.objectStore(STORE)));
		} catch {
			return null;
		}
	}

	async get<T>(key: string): Promise<T | null> {
		const value = await this.#withStore<unknown>('readonly', (store) => store.get(key));
		return (value ?? null) as T | null;
	}

	async set<T>(key: string, value: T): Promise<void> {
		await this.#withStore('readwrite', (store) => store.put(value, key));
	}

	async remove(key: string): Promise<void> {
		await this.#withStore('readwrite', (store) => store.delete(key));
	}
}
