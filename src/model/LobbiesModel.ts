import BaseModel from './BaseModel';

export default class LobbiesModel extends BaseModel {
	private readonly table = 'lobbies';
	private readonly playersTable = 'lobby_players';
	private readonly requestsTable = 'lobby_requests';

	async createLobby(payload: { hostPlayerId: string; maxPlayers?: number }) {
		const row = {
			host_player_id: payload.hostPlayerId,
			max_players: payload.maxPlayers ?? 7,
		};
		const { data, error } = await this.db.from(this.table).insert(row).select().single();
		if (error) throw error;

		await this.db.from(this.playersTable).insert({
			lobby_id: data.id,
			player_id: payload.hostPlayerId,
			is_host: true,
		});

		return {
			lobbyId: data.id,
			hostPlayerId: data.host_player_id,
			status: data.status,
			maxPlayers: data.max_players,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
		};
	}

	async getLobbyById(lobbyId: string) {
		const { data, error } = await this.db.from(this.table).select('*').eq('id', lobbyId).single();
		if (error && error.code !== 'PGRST116') throw error;
		if (!data) return null;
		return {
			lobbyId: data.id,
			hostPlayerId: data.host_player_id,
			status: data.status,
			maxPlayers: data.max_players,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
		};
	}

	async listLobbies(params: { status: string; excludeHostPLayerId?: string }) {
		const { status, excludeHostPLayerId } = params;
		let q = this.db
			.from(this.table)
			.select(
				`
			id,
			host_player_id,
			status,
			max_players,
			created_at,
			updated_at,
			host:players!lobbies_host_player_id_fkey ( nickname )
			`
			)
			.order('created_at', { ascending: false });
		if (status) q = q.eq('status', status);
		if (excludeHostPLayerId) {
			q = q.neq('host_player_id', excludeHostPLayerId);
		}
		const { data, error } = await q;
		if (error) throw error;
		return (data || []).map((d) => {
			const row = d as {
				id: string;
				host_player_id: string;
				status: string;
				max_players: number;
				created_at: string;
				updated_at: string | null;
				host?: { nickname?: string | null } | null;
			};
			return {
				lobbyId: row.id,
				hostPlayerId: row.host_player_id,
				hostNickname: row.host?.nickname || null,
				status: row.status,
				maxPlayers: row.max_players,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			};
		});
	}

	async closeLobbyById(lobbyId: string): Promise<boolean> {
		const { error } = await this.db
			.from(this.table)
			.update({ status: 'closed', updated_at: new Date().toISOString() })
			.eq('id', lobbyId);
		if (error) throw error;
		return true;
	}

	async addPlayerByLobbyId(lobbyId: string, playerId: string, isHost = false) {
		const { data, error } = await this.db
			.from(this.playersTable)
			.insert({
				lobby_id: lobbyId,
				player_id: playerId,
				is_host: isHost,
			})
			.select()
			.single();

		if (error) throw error;
		return {
			id: data.id,
			lobbyId: data.lobby_id,
			playerId: data.player_id,
			isHost: data.is_host,
			joinedAt: data.joined_at,
			isReady: data.is_ready ?? false,
		};
	}

	async removePlayerByLobbyId(lobbyId: string, playerId: string): Promise<boolean> {
		const { error } = await this.db
			.from(this.playersTable)
			.delete()
			.match({ lobby_id: lobbyId, player_id: playerId });
		if (error) throw error;
		return true;
	}

	async listPlayersByLobbyId(lobbyId: string) {
		const { data, error } = await this.db
			.from(this.playersTable)
			.select('*')
			.eq('lobby_id', lobbyId)
			.order('joined_at', { ascending: true });
		if (error) throw error;
		return (data || []).map((d) => {
			const row = d as {
				id: string;
				lobby_id: string;
				player_id: string;
				is_host: boolean;
				is_ready?: boolean | null;
				joined_at: string;
			};
			return {
				id: row.id,
				lobbyId: row.lobby_id,
				playerId: row.player_id,
				isHost: row.is_host,
				joinedAt: row.joined_at,
				isReady: row.is_ready ?? false,
			};
		});
	}

	async setPlayerReadyByLobbyId(lobbyId: string, playerId: string, isReady: boolean) {
		const { data, error } = await this.db
			.from(this.playersTable)
			.update({ is_ready: isReady })
			.match({ lobby_id: lobbyId, player_id: playerId })
			.select()
			.single();

		if (error) throw error;
		if (!data) throw new Error('Lobby player not found');

		return {
			id: data.id,
			lobbyId: data.lobby_id,
			playerId: data.player_id,
			isHost: data.is_host,
			joinedAt: data.joined_at,
			isReady: data.is_ready ?? false,
		};
	}

	async requestJoinByLobbyId(lobbyId: string, playerId: string) {
		// Do not allow host to create join requests for own lobby.
		const { data: lobby, error: lobbyErr } = await this.db
			.from(this.table)
			.select('host_player_id')
			.eq('id', lobbyId)
			.maybeSingle();
		if (lobbyErr) throw lobbyErr;
		if (lobby && lobby.host_player_id === playerId) {
			return null;
		}

		const { data: existing, error: existingErr } = await this.db
			.from(this.requestsTable)
			.select('*')
			.match({ lobby_id: lobbyId, player_id: playerId, status: 'pending' })
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();
		if (existingErr) throw existingErr;
		if (existing) {
			return {
				id: existing.id,
				lobbyId: existing.lobby_id,
				playerId: existing.player_id,
				nickname: existing.nickname,
				status: existing.status,
				createdAt: existing.created_at,
				processedAt: existing.processed_at,
			};
		}

		const { data, error } = await this.db
			.from(this.requestsTable)
			.insert({
				lobby_id: lobbyId,
				player_id: playerId,
				status: 'pending',
			})
			.select()
			.single();
		if (error) throw error;
		return {
			id: data.id,
			lobbyId: data.lobby_id,
			playerId: data.player_id,
			nickname: data.nickname,
			status: data.status,
			createdAt: data.created_at,
			processedAt: data.processed_at,
		};
	}

	async listJoinRequestsByLobbyId(lobbyId: string) {
		// Safety net: never show requests made by the host.
		const { data: lobby, error: lobbyErr } = await this.db
			.from(this.table)
			.select('host_player_id')
			.eq('id', lobbyId)
			.maybeSingle();
		if (lobbyErr) throw lobbyErr;
		const hostPlayerId = lobby?.host_player_id ?? null;

		const { data, error } = await this.db
			.from(this.requestsTable)
			.select('*')
			.eq('lobby_id', lobbyId)
			.order('created_at', { ascending: true });
		if (error) throw error;
		return (data || [])
			.filter((d) => !hostPlayerId || d.player_id !== hostPlayerId)
			.map((d) => {
				const row = d as {
					id: string;
					lobby_id: string;
					player_id: string;
					nickname: string | null;
					status: string;
					created_at: string;
					processed_at: string | null;
				};
				return {
					id: row.id,
					lobbyId: row.lobby_id,
					playerId: row.player_id,
					nickname: row.nickname,
					status: row.status,
					createdAt: row.created_at,
					processedAt: row.processed_at,
				};
			});
	}

	async approveJoin(requestId: string): Promise<boolean> {
		const { data: req, error: getErr } = await this.db
			.from(this.requestsTable)
			.select('*')
			.eq('id', requestId)
			.single();
		if (getErr) throw getErr;
		if (!req) throw new Error('Request not found');

		await this.addPlayerByLobbyId(req.lobby_id, req.player_id, false);

		const { error } = await this.db
			.from(this.requestsTable)
			.update({ status: 'approved', processed_at: new Date().toISOString() })
			.eq('id', requestId);
		if (error) throw error;
		return true;
	}

	async rejectJoin(requestId: string): Promise<boolean> {
		const { error } = await this.db
			.from(this.requestsTable)
			.update({ status: 'rejected', processed_at: new Date().toISOString() })
			.eq('id', requestId);
		if (error) throw error;
		return true;
	}
}

