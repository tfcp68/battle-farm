import ProfileModel, { type Profile } from './model';

export default class ProfileController {
	private readonly model: ProfileModel;

	constructor({ model }: { model: ProfileModel }) {
		this.model = model;
	}

	async current(): Promise<Profile | null> {
		return this.model.get();
	}

	async setNickname(nickname: string): Promise<Profile> {
		return this.model.createOrRename(nickname);
	}

	async clear(): Promise<void> {
		await this.model.clear();
	}
}
