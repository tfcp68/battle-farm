import type { StoragePort } from './StoragePort';

/**
 * `localStorage`-backed {@link StoragePort}. Degrades to a no-op rather than
 * throwing when the browser denies access: every consumer already handles a
 * `null` read, so losing persistence must not take the app down.
 */
export class LocalStorageAdapter implements StoragePort {
	readonly #store: Storage | null;

	constructor(store: Storage | null = typeof window === 'undefined' ? null : window.localStorage) {
		this.#store = store;
	}

	async get<T>(key: string): Promise<T | null> {
		if (!this.#store) return null;
		let raw: string | null;
		try {
			raw = this.#store.getItem(key);
		} catch {
			return null;
		}
		if (raw === null) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			// Value written by something other than this adapter — treat as absent.
			return null;
		}
	}

	async set<T>(key: string, value: T): Promise<void> {
		if (!this.#store) return;
		try {
			this.#store.setItem(key, JSON.stringify(value));
		} catch {
			/* quota exceeded or storage denied — ignore */
		}
	}

	async remove(key: string): Promise<void> {
		if (!this.#store) return;
		try {
			this.#store.removeItem(key);
		} catch {
			/* ignore */
		}
	}
}
