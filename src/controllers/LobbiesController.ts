import BaseController from './BaseController';
import LobbiesModel from '~/model/LobbiesModel';
import { uniqId } from '@yantrix/core';

export type LobbiesControllerDeps = {
	model: LobbiesModel;
};

export default class LobbiesController extends BaseController {
	private readonly model: LobbiesModel;

	constructor({ model }: LobbiesControllerDeps) {
		super();
		this.model = model;
	}

	async create(hostPlayerId: string, opts?: { gameId?: string; maxPlayers?: number }) {
		const gameId = opts?.gameId ?? uniqId();
		return await this.model.createLobby({
			gameId,
			hostPlayerId,
			maxPlayers: opts?.maxPlayers,
		});
	}

	// Новый основной метод: получение по lobbyId
	async getByLobbyId(lobbyId: string) {
		return this.model.getLobbyById(lobbyId);
	}

	// Старый метод по gameId для обратной совместимости
	async get(gameId: string) {
		return this.model.getLobby(gameId);
	}

	async list(params: { excludeHostPlayerId: string; status: string }) {
		return this.model.listLobbies(params);
	}

	// Новый основной метод: закрыть по lobbyId
	async closeByLobbyId(lobbyId: string): Promise<boolean> {
		return await this.model.closeLobbyById(lobbyId);
	}

	// Обратная совместимость по gameId
	async close(gameId: string): Promise<boolean> {
		return await this.model.closeLobby(gameId);
	}

	async addPlayerByLobbyId(lobbyId: string, playerId: string, isHost = false) {
		return await this.model.addPlayerByLobbyId(lobbyId, playerId, isHost);
	}

	async addPlayer(gameId: string, playerId: string, isHost = false) {
		return await this.model.addPlayer(gameId, playerId, isHost);
	}

	async removePlayerByLobbyId(lobbyId: string, playerId: string): Promise<boolean> {
		return await this.model.removePlayerByLobbyId(lobbyId, playerId);
	}

	async removePlayer(gameId: string, playerId: string): Promise<boolean> {
		return await this.model.removePlayer(gameId, playerId);
	}

	async listPlayersByLobbyId(lobbyId: string) {
		return this.model.listPlayersByLobbyId(lobbyId);
	}

	async listPlayers(gameId: string) {
		return this.model.listPlayers(gameId);
	}

	// Ready-state update API
	async setPlayerReadyByLobbyId(lobbyId: string, playerId: string, isReady: boolean) {
		return this.model.setPlayerReadyByLobbyId(lobbyId, playerId, isReady);
	}

	async setPlayerReady(gameId: string, playerId: string, isReady: boolean) {
		return this.model.setPlayerReady(gameId, playerId, isReady);
	}

	// Requests flow
	async requestJoinByLobbyId(lobbyId: string, playerId: string, nickname?: string) {
		return await this.model.requestJoinByLobbyId(lobbyId, playerId, nickname);
	}

	async requestJoin(gameId: string, playerId: string, nickname?: string) {
		return await this.model.requestJoin(gameId, playerId, nickname);
	}

	async listRequestsByLobbyId(lobbyId: string) {
		return this.model.listJoinRequestsByLobbyId(lobbyId);
	}

	async listRequests(gameId: string) {
		return this.model.listJoinRequests(gameId);
	}

	async approveRequest(requestId: string): Promise<boolean> {
		return await this.model.approveJoin(requestId);
	}

	async rejectRequest(requestId: string): Promise<boolean> {
		return await this.model.rejectJoin(requestId);
	}
}