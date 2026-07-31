import { beforeEach, describe, expect, it } from '@jest/globals';
import ProfileModel from '~/entities/profile/model';
import { StorageKeys, type StoragePort } from '~/shared/storage/StoragePort';

function memoryStorage(): StoragePort {
	const map = new Map<string, unknown>();
	return {
		async get<T>(key: string) {
			return (map.get(key) ?? null) as T | null;
		},
		async set<T>(key: string, value: T) {
			map.set(key, value);
		},
		async remove(key: string) {
			map.delete(key);
		},
	};
}

describe('ProfileModel', () => {
	let storage: StoragePort;
	let ids: string[];
	let model: ProfileModel;

	beforeEach(() => {
		storage = memoryStorage();
		ids = ['id-1', 'id-2', 'id-3'];
		model = new ProfileModel({ storage, newId: () => ids.shift() ?? 'exhausted' });
	});

	it('has no profile before one is created', async () => {
		expect(await model.get()).toBeNull();
	});

	it('creates a profile with a generated id', async () => {
		const profile = await model.createOrRename('Alex');

		expect(profile).toEqual({ playerId: 'id-1', nickname: 'Alex' });
		expect(await model.get()).toEqual(profile);
	});

	it('keeps the player id when the nickname changes', async () => {
		await model.createOrRename('Alex');
		const renamed = await model.createOrRename('Alexey');

		// A rotating id would make the host treat a returning player as a stranger.
		expect(renamed.playerId).toBe('id-1');
		expect(renamed.nickname).toBe('Alexey');
	});

	it('trims the nickname and rejects an empty one', async () => {
		expect((await model.createOrRename('  Alex  ')).nickname).toBe('Alex');
		await expect(model.createOrRename('   ')).rejects.toThrow('Nickname must not be empty');
	});

	it('caps an over-long nickname', async () => {
		const profile = await model.createOrRename('x'.repeat(100));

		expect(profile.nickname).toHaveLength(24);
	});

	it('forgets the profile when cleared', async () => {
		await model.createOrRename('Alex');
		await model.clear();

		expect(await model.get()).toBeNull();
	});

	it('ignores a malformed stored value', async () => {
		await storage.set(StorageKeys.profile, { nickname: 'no id here' });

		expect(await model.get()).toBeNull();
	});

	it('generates a fresh id after the profile is cleared', async () => {
		await model.createOrRename('Alex');
		await model.clear();
		const recreated = await model.createOrRename('Alex');

		expect(recreated.playerId).toBe('id-2');
	});
});
