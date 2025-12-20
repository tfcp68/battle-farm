import BaseController from '~/controllers/BaseController';
import GameModel from '~/model/GameModel';

export type GameControllerDeps = {
	model: GameModel;
};

export default class GameController extends BaseController {
	private readonly model: GameModel;

	constructor({ model }: GameControllerDeps) {
		super();
		this.model = model;
	}

	async create(payload: { lobbyId: string }) {
		return await this.model.create(payload);
	}

	async getById(id: string) {
		return await this.model.getById(id);
	}

	async getByLobbyId(lobbyId: string) {
		return await this.model.getByLobbyId(lobbyId);
	}

	async list() {
		return await this.model.list();
	}

	async update(id: string, patch: Partial<{ lobbyId: string; updatedAt: string | null }>) {
		return await this.model.update(id, patch);
	}

	async delete(id: string) {
		return await this.model.delete(id);
	}
}