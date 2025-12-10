import BaseController from './BaseController';
import AuthModel from '~/model/AuthModel';

export default class AuthController extends BaseController {
	private readonly model: AuthModel;

	constructor({ model }: { model: AuthModel }) {
		super();
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