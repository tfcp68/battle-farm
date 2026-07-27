import type { RoomService } from '~/entities/room/RoomService';
import LobbiesModel from './model';

export type LobbiesControllerDeps = {
	model: LobbiesModel;
	rooms: RoomService;
};

/**
 * Reads go through the model; opening or entering a room goes straight to
 * {@link RoomService}, since that is transport lifecycle rather than lobby data.
 */
export default class LobbiesController {
	private readonly model: LobbiesModel;
	private readonly rooms: RoomService;

	constructor({ model, rooms }: LobbiesControllerDeps) {
		this.model = model;
		this.rooms = rooms;
	}

	/** Opens a room; the returned `lobbyId` is the code players type to join. */
	async create(hostPlayerId: string, opts: { nickname: string; maxPlayers?: number }) {
		const state = await this.rooms.host({
			playerId: hostPlayerId,
			nickname: opts.nickname,
			maxPlayers: opts.maxPlayers,
		});
		return { lobbyId: state.code, hostPlayerId: state.hostPlayerId, maxPlayers: state.maxPlayers };
	}

	/** Connects to a room and asks its host for admission. Throws if nobody answers. */
	async requestJoinByCode(code: string, playerId: string, nickname: string) {
		const state = await this.rooms.join({ code, playerId, nickname });
		this.rooms.requestJoin();
		return { lobbyId: state.code, hostPlayerId: state.hostPlayerId };
	}

	async getByLobbyId(lobbyId: string) {
		return this.model.getLobbyById(lobbyId);
	}

	async listPlayersByLobbyId(lobbyId: string) {
		return this.model.listPlayersByLobbyId(lobbyId);
	}

	async listRequestsByLobbyId(lobbyId: string | null) {
		return this.model.listJoinRequestsByLobbyId(lobbyId);
	}

	async setPlayerReadyByLobbyId(lobbyId: string, playerId: string, isReady: boolean) {
		return this.model.setPlayerReadyByLobbyId(lobbyId, playerId, isReady);
	}

	async removePlayerByLobbyId(lobbyId: string, playerId: string): Promise<boolean> {
		return this.model.removePlayerByLobbyId(lobbyId, playerId);
	}

	async closeByLobbyId(lobbyId: string): Promise<boolean> {
		return this.model.closeLobbyById(lobbyId);
	}

	async approveRequest(requestId: string): Promise<boolean> {
		return this.model.approveJoin(requestId);
	}

	async rejectRequest(requestId: string): Promise<boolean> {
		return this.model.rejectJoin(requestId);
	}

	/** Leaves whatever room this player is in — host or guest. */
	async leave(): Promise<void> {
		await this.rooms.leave();
	}
}
