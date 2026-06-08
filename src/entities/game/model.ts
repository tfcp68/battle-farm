import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/shared/types/supabase';
import supabase from '~/shared/api/connect';

export default class GameModel {
	private readonly db: SupabaseClient<Database>;
	private readonly table = 'games';

	constructor(db: SupabaseClient<Database> = supabase) {
		this.db = db;
	}

	async create(payload: { lobbyId: string }) {
		const { data, error } = await this.db
			.from(this.table)
			.insert({ lobby_id: payload.lobbyId })
			.select('*')
			.single();
		if (error) throw error;
		return {
			id: data.id,
			lobbyId: data.lobby_id ?? payload.lobbyId,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
		};
	}

	async getById(id: string) {
		const { data, error } = await this.db.from(this.table).select('*').eq('id', id).maybeSingle();
		if (error) throw error;
		if (!data) return null;
		return {
			id: data.id,
			lobbyId: data.lobby_id,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
		};
	}

	async getByLobbyId(lobbyId: string) {
		const { data, error } = await this.db
			.from(this.table)
			.select('*')
			.eq('lobby_id', lobbyId)
			.maybeSingle();
		if (error) throw error;
		if (!data) return null;
		return {
			id: data.id,
			lobbyId: data.lobby_id ?? lobbyId,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
		};
	}

	async list() {
		const { data, error } = await this.db
			.from(this.table)
			.select('*')
			.order('created_at', { ascending: false });
		if (error) throw error;
		return (data || []).map((d) => ({
			id: d.id,
			lobbyId: d.lobby_id,
			createdAt: d.created_at,
			updatedAt: d.updated_at,
		}));
	}

	async update(id: string, patch: Partial<{ lobbyId: string; updatedAt: string | null }>) {
		const body: Partial<Database['public']['Tables']['games']['Update']> = {};
		if (patch.lobbyId !== undefined) body.lobby_id = patch.lobbyId;
		if (patch.updatedAt !== undefined) body.updated_at = patch.updatedAt;

		const { data, error } = await this.db
			.from(this.table)
			.update(body)
			.eq('id', id)
			.select('*')
			.single();
		if (error) throw error;
		return {
			id: data.id,
			lobbyId: data.lobby_id,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
		};
	}

	async delete(id: string) {
		const { error } = await this.db.from(this.table).delete().eq('id', id);
		if (error) throw error;
		return true;
	}
}
