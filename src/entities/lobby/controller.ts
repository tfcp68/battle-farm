import LobbiesModel from './model';

export type LobbiesControllerDeps = {
	model: LobbiesModel;
};

export default class LobbiesController {
	private readonly model: LobbiesModel;

	constructor({ model }: LobbiesControllerDeps) {
		this.model = model;
	}

	async create(hostPlayerId: string, opts?: { maxPlayers?: number }) {
		return await this.model.createLobby({ hostPlayerId, maxPlayers: opts?.maxPlayers });
	}

	async getByLobbyId(lobbyId: string) {
		return this.model.getLobbyById(lobbyId);
	}

	async list(params: { status: string }) {
		return this.model.listLobbies(params);
	}

	async closeByLobbyId(lobbyId: string): Promise<boolean> {
		return await this.model.closeLobbyById(lobbyId);
	}

	async addPlayerByLobbyId(lobbyId: string, playerId: string, isHost = false) {
		return await this.model.addPlayerByLobbyId(lobbyId, playerId, isHost);
	}

	async removePlayerByLobbyId(lobbyId: string, playerId: string): Promise<boolean> {
		return await this.model.removePlayerByLobbyId(lobbyId, playerId);
	}

	async listPlayersByLobbyId(lobbyId: string) {
		return this.model.listPlayersByLobbyId(lobbyId);
	}

	async setPlayerReadyByLobbyId(lobbyId: string, playerId: string, isReady: boolean) {
		return this.model.setPlayerReadyByLobbyId(lobbyId, playerId, isReady);
	}

	async requestJoinByLobbyId(lobbyId: string, playerId: string) {
		return await this.model.requestJoinByLobbyId(lobbyId, playerId);
	}

	async listRequestsByLobbyId(lobbyId: string | null) {
		return this.model.listJoinRequestsByLobbyId(lobbyId);
	}

	async approveRequest(requestId: string): Promise<boolean> {
		return await this.model.approveJoin(requestId);
	}

	async rejectRequest(requestId: string): Promise<boolean> {
		return await this.model.rejectJoin(requestId);
	}
}

