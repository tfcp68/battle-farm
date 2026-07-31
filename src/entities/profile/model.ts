import { StorageKeys, type StoragePort } from '~/shared/storage/StoragePort';

export interface Profile {
	playerId: string;
	nickname: string;
}

const MAX_NICKNAME_LENGTH = 24;

/** Nicknames are cosmetic — trim and cap, otherwise take as typed. */
export function normalizeNickname(nickname: string): string {
	return String(nickname ?? '').trim().slice(0, MAX_NICKNAME_LENGTH);
}

function isProfile(value: unknown): value is Profile {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Record<string, unknown>;
	return typeof v.playerId === 'string' && !!v.playerId && typeof v.nickname === 'string';
}

/**
 * The local player's identity — there is no server to authenticate against, so
 * this is a generated id plus a display name.
 *
 * `playerId` never rotates: the host recognises a player who reloads the page by
 * that id, so a new one would drop them from the room.
 */
export default class ProfileModel {
	readonly #storage: StoragePort;
	readonly #newId: () => string;

	constructor(opts: { storage: StoragePort; newId?: () => string }) {
		this.#storage = opts.storage;
		this.#newId = opts.newId ?? (() => crypto.randomUUID());
	}

	async get(): Promise<Profile | null> {
		const stored = await this.#storage.get<unknown>(StorageKeys.profile);
		return isProfile(stored) ? stored : null;
	}

	/**
	 * Creates the profile or renames the existing one, keeping its `playerId`.
	 * One method because the caller is a single "enter your nickname" screen.
	 */
	async createOrRename(nickname: string): Promise<Profile> {
		const clean = normalizeNickname(nickname);
		if (!clean) throw new Error('Nickname must not be empty');

		const existing = await this.get();
		const profile: Profile = {
			playerId: existing?.playerId ?? this.#newId(),
			nickname: clean,
		};
		await this.#storage.set(StorageKeys.profile, profile);
		return profile;
	}

	async clear(): Promise<void> {
		await this.#storage.remove(StorageKeys.profile);
	}
}
