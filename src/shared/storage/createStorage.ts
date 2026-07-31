import { LocalStorageAdapter } from './LocalStorageAdapter';
import { IndexedDbAdapter } from './IndexedDbAdapter';
import { DEFAULT_STORAGE_DRIVER, type StorageDriver, type StoragePort } from './StoragePort';

/** Adding a driver means adding a line here; the type keeps the map exhaustive. */
const ADAPTERS: Record<StorageDriver, () => StoragePort> = {
	local: () => new LocalStorageAdapter(),
	indexeddb: () => new IndexedDbAdapter(),
};

function readDriver(): StorageDriver {
	const raw = import.meta.env?.VITE_STORAGE_DRIVER;
	return raw && raw in ADAPTERS ? (raw as StorageDriver) : DEFAULT_STORAGE_DRIVER;
}

/**
 * Picks the storage implementation for this build. The only place in the app
 * that knows more than one adapter exists — everything else takes a
 * {@link StoragePort}.
 */
export function createStorage(driver: StorageDriver = readDriver()): StoragePort {
	return (ADAPTERS[driver] ?? ADAPTERS[DEFAULT_STORAGE_DRIVER])();
}
