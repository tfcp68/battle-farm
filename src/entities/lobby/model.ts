import type { RoomService } from '~/entities/room/RoomService';
import type { RoomState } from '~/entities/room/types';
import { LobbyNotOpenError } from './LobbyNotOpenError';

export interface LobbyView {
	lobbyId: string;
	hostPlayerId: string;
	status: RoomState['status'];
	maxPlayers: number;
}

export interface LobbyPlayerView {
	id: string;
	lobbyId: string;
	playerId: string;
	nickname: string;
	isHost: boolean;
	isReady: boolean;
}

export interface LobbyRequestView {
	id: string;
	lobbyId: string;
	playerId: string;
	nickname: string;
	status: 'pending';
}

/**
 * Projects the live {@link RoomState} into the shape the rest of the app already
 * expects. Methods are async because the callers are promise-based, not because
 * anything here does I/O.
 *
 * A room's code doubles as its lobby id, and there is one room at a time: a
 * `lobbyId` that doesn't match means the caller holds a stale lobby, so it gets
 * an empty result rather than someone else's data.
 */
export default class LobbiesModel {
	readonly #rooms: RoomService;

	constructor(rooms: RoomService) {
		this.#rooms = rooms;
	}

	#stateFor(lobbyId: string | null | undefined): RoomState | null {
		const state = this.#rooms.getState();
		if (!state) return null;
		if (lobbyId && state.code !== lobbyId) return null;
		return state;
	}

	async getLobbyById(lobbyId: string): Promise<LobbyView | null> {
		const state = this.#stateFor(lobbyId);
		if (!state) return null;
		return {
			lobbyId: state.code,
			hostPlayerId: state.hostPlayerId,
			status: state.status,
			maxPlayers: state.maxPlayers,
		};
	}

	async listPlayersByLobbyId(lobbyId: string): Promise<LobbyPlayerView[]> {
		const state = this.#stateFor(lobbyId);
		if (!state) return [];
		return state.players.map((player) => ({
			id: `${state.code}:${player.playerId}`,
			lobbyId: state.code,
			playerId: player.playerId,
			nickname: player.nickname,
			isHost: player.isHost,
			isReady: player.isReady,
		}));
	}

	async listJoinRequestsByLobbyId(lobbyId: string | null): Promise<LobbyRequestView[]> {
		const state = this.#stateFor(lobbyId);
		if (!state) return [];
		return state.requests.map((request) => ({
			// A player has at most one pending request, so its id is the request id.
			id: request.playerId,
			lobbyId: state.code,
			playerId: request.playerId,
			nickname: request.nickname,
			status: 'pending' as const,
		}));
	}

	async setPlayerReadyByLobbyId(lobbyId: string, playerId: string, isReady: boolean): Promise<void> {
		if (!this.#stateFor(lobbyId)) throw new LobbyNotOpenError(`Room ${lobbyId} is not active`);
		this.#rooms.setReady(playerId, isReady);
	}

	async removePlayerByLobbyId(lobbyId: string, playerId: string): Promise<boolean> {
		if (!this.#stateFor(lobbyId)) return false;
		this.#rooms.removePlayer(playerId);
		return true;
	}

	async closeLobbyById(lobbyId: string): Promise<boolean> {
		if (!this.#stateFor(lobbyId)) return false;
		await this.#rooms.leave();
		return true;
	}

	async approveJoin(playerId: string): Promise<boolean> {
		this.#rooms.approve(playerId);
		return true;
	}

	async rejectJoin(playerId: string): Promise<boolean> {
		this.#rooms.reject(playerId);
		return true;
	}
}
