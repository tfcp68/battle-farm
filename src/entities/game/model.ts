import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/shared/types/supabase';
import supabase from '~/shared/api/connect';

export default class GameModel {
	private readonly db: SupabaseClient;
	private readonly table = 'games';

	constructor(db: SupabaseClient = supabase) {
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
			id: data.id as string,
			lobbyId: data.lobby_id as string,
			createdAt: data.created_at as string,
			updatedAt: (data.updated_at ?? null) as string | null,
		};
	}

	async getById(id: string) {
		const { data, error } = await this.db.from(this.table).select('*').eq('id', id).maybeSingle();
		if (error) throw error;
		if (!data) return null;
		return {
			id: data.id as string,
			lobbyId: data.lobby_id as string,
			createdAt: data.created_at as string,
			updatedAt: (data.updated_at ?? null) as string | null,
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
			id: data.id as string,
			lobbyId: data.lobby_id as string,
			createdAt: data.created_at as string,
			updatedAt: (data.updated_at ?? null) as string | null,
		};
	}

	async list() {
		const { data, error } = await this.db
			.from(this.table)
			.select('*')
			.order('created_at', { ascending: false });
		if (error) throw error;
		return (data || []).map((d) => ({
			id: d.id as string,
			lobbyId: d.lobby_id as string,
			createdAt: d.created_at as string,
			updatedAt: (d.updated_at ?? null) as string | null,
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
			id: data.id as string,
			lobbyId: data.lobby_id as string,
			createdAt: data.created_at as string,
			updatedAt: (data.updated_at ?? null) as string | null,
		};
	}

	async delete(id: string) {
		const { error } = await this.db.from(this.table).delete().eq('id', id);
		if (error) throw error;
		return true;
	}
}


