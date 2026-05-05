import AuthModel from './model';

export default class AuthController {
	private readonly model: AuthModel;

	constructor({ model }: { model: AuthModel }) {
		this.model = model;
	}

	async register(nickname: string, password: string) {
		return this.model.register(nickname, password);
	}

	async signIn(nickname: string, password: string) {
		return this.model.signIn(nickname, password);
	}

	async signOut() {
		await this.model.signOut();
	}

	async currentPlayer() {
		return this.model.getCurrentPlayer();
	}
}

