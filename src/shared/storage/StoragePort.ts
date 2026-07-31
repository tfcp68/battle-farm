/**
 * Key/value persistence for everything the app keeps on the device.
 *
 * Async even though `localStorage` isn't: a synchronous contract could not be
 * implemented by IndexedDB without rewriting every call site later.
 */
export interface StoragePort {
	get<T>(key: string): Promise<T | null>
	set<T>(key: string, value: T): Promise<void>
	remove(key: string): Promise<void>
}

/** Driver names accepted by `VITE_STORAGE_DRIVER`. */
export type StorageDriver = 'local' | 'indexeddb'

export const DEFAULT_STORAGE_DRIVER: StorageDriver = 'local'

/** Keys owned by the app. Kept here so no two modules invent the same string. */
export const StorageKeys = {
	profile: 'battle-farm:profile',
	recentRoomCodes: 'battle-farm:recent-room-codes',
} as const
