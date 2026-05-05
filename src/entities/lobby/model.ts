import type { SupabaseClient } from '@supabase/supabase-js';
import supabase from '~/shared/api/connect';

export default class LobbiesModel {
	private readonly db: SupabaseClient;
	private readonly table = 'lobbies';
	private readonly playersTable = 'lobby_players';
	private readonly requestsTable = 'lobby_requests';

	constructor(db: SupabaseClient = supabase) {
		this.db = db;
	}

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
			lobbyId: data.id as string,
			hostPlayerId: data.host_player_id as string,
			status: data.status as string,
			maxPlayers: data.max_players as number,
			createdAt: data.created_at as string,
			updatedAt: (data.updated_at ?? null) as string | null,
		};
	}

	async getLobbyById(lobbyId: string) {
		const { data, error } = await this.db.from(this.table).select('*').eq('id', lobbyId).single();
		if (error && error.code !== 'PGRST116') throw error;
		if (!data) return null;
		return {
			lobbyId: data.id as string,
			hostPlayerId: data.host_player_id as string,
			status: data.status as string,
			maxPlayers: data.max_players as number,
			createdAt: data.created_at as string,
			updatedAt: (data.updated_at ?? null) as string | null,
		};
	}

	async listLobbies(params: { status: string }) {
		const { status } = params;
		let q = this.db
			.from(this.table)
			.select(
				`id, host_player_id, status, max_players, created_at, updated_at,
				host:players!lobbies_host_player_id_fkey ( nickname )`
			)
			.order('created_at', { ascending: false });
		if (status) q = q.eq('status', status);

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
			.insert({ lobby_id: lobbyId, player_id: playerId, is_host: isHost })
			.select()
			.single();
		if (error) throw error;
		return {
			id: data.id as string,
			lobbyId: data.lobby_id as string,
			playerId: data.player_id as string,
			isHost: data.is_host as boolean,
			joinedAt: data.joined_at as string,
			isReady: (data.is_ready ?? false) as boolean,
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
		return (data || []).map((row) => ({
			id: row.id as string,
			lobbyId: row.lobby_id as string,
			playerId: row.player_id as string,
			isHost: row.is_host as boolean,
			joinedAt: row.joined_at as string,
			isReady: (row.is_ready ?? false) as boolean,
		}));
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
			id: data.id as string,
			lobbyId: data.lobby_id as string,
			playerId: data.player_id as string,
			isHost: data.is_host as boolean,
			joinedAt: data.joined_at as string,
			isReady: (data.is_ready ?? false) as boolean,
		};
	}

	async requestJoinByLobbyId(lobbyId: string, playerId: string) {
		const { data: lobby, error: lobbyErr } = await this.db
			.from(this.table)
			.select('host_player_id')
			.eq('id', lobbyId)
			.maybeSingle();
		if (lobbyErr) throw lobbyErr;
		if (lobby && lobby.host_player_id === playerId) return null;

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
				id: existing.id as string,
				lobbyId: existing.lobby_id as string,
				playerId: existing.player_id as string,
				status: existing.status as string,
				createdAt: existing.created_at as string,
				processedAt: (existing.processed_at ?? null) as string | null,
			};
		}

		const { data, error } = await this.db
			.from(this.requestsTable)
			.insert({ lobby_id: lobbyId, player_id: playerId, status: 'pending' })
			.select()
			.single();
		if (error) throw error;
		return {
			id: data.id as string,
			lobbyId: data.lobby_id as string,
			playerId: data.player_id as string,
			status: data.status as string,
			createdAt: data.created_at as string,
			processedAt: (data.processed_at ?? null) as string | null,
		};
	}

	async listJoinRequestsByLobbyId(lobbyId: string | null) {
		if (!lobbyId) throw new Error('Invalid lobby id or lobbyId is empty');

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
			.map((d) => ({
				id: d.id as string,
				lobbyId: d.lobby_id as string,
				playerId: d.player_id as string,
				status: d.status as string,
				createdAt: d.created_at as string,
				processedAt: (d.processed_at ?? null) as string | null,
			}));
	}

	async approveJoin(requestId: string): Promise<boolean> {
		const { data: req, error: getErr } = await this.db
			.from(this.requestsTable)
			.select('*')
			.eq('id', requestId)
			.single();
		if (getErr) throw getErr;
		if (!req) throw new Error('Request not found');

		await this.addPlayerByLobbyId(req.lobby_id as string, req.player_id as string, false);

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

