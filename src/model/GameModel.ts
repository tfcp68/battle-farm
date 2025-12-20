import BaseModel from '~/model/BaseModel';
import type { Database } from '~/types/supabase';

export default class GameModel extends BaseModel {
	private readonly table = 'games';

	async create(payload: {
		lobbyId: string;
	}): Promise<{ id: string; lobbyId: string; createdAt: string; updatedAt: string | null }> {
		const row = {
			lobby_id: payload.lobbyId,
		};
		const { data, error } = await this.db.from(this.table).insert(row).select('*').single();
		if (error) throw error;
		return {
			id: data.id,
			lobbyId: data.lobby_id,
			createdAt: data.created_at,
			updatedAt: data.updated_at ?? null,
		};
	}

	async getById(
		id: string
	): Promise<{ id: string; lobbyId: string; createdAt: string; updatedAt: string | null } | null> {
		const { data, error } = await this.db.from(this.table).select('*').eq('id', id).maybeSingle();
		if (error) throw error;
		if (!data) return null;
		return {
			id: data.id,
			lobbyId: data.lobby_id,
			createdAt: data.created_at,
			updatedAt: data.updated_at ?? null,
		};
	}

	async getByLobbyId(
		lobbyId: string
	): Promise<{ id: string; lobbyId: string; createdAt: string; updatedAt: string | null } | null> {
		const { data, error } = await this.db.from(this.table).select('*').eq('lobby_id', lobbyId).maybeSingle();
		if (error) throw error;
		if (!data) return null;
		return {
			id: data.id,
			lobbyId: data.lobby_id,
			createdAt: data.created_at,
			updatedAt: data.updated_at ?? null,
		};
	}

	async list(): Promise<Array<{ id: string; lobbyId: string; createdAt: string; updatedAt: string | null }>> {
		const { data, error } = await this.db.from(this.table).select('*').order('created_at', { ascending: false });
		if (error) throw error;
		return (data || []).map((d) => ({
			id: d.id,
			lobbyId: d.lobby_id,
			createdAt: d.created_at,
			updatedAt: d.updated_at ?? null,
		}));
	}

	async update(
		id: string,
		patch: Partial<{ lobbyId: string; updatedAt: string | null }>
	): Promise<{ id: string; lobbyId: string; createdAt: string; updatedAt: string | null }> {
		const body: Partial<Database['public']['Tables']['games']['Update']> = {};
		if (patch.lobbyId !== undefined) body.lobby_id = patch.lobbyId;
		if (patch.updatedAt !== undefined) body.updated_at = patch.updatedAt;

		const { data, error } = await this.db.from(this.table).update(body).eq('id', id).select('*').single();
		if (error) throw error;
		return {
			id: data.id,
			lobbyId: data.lobby_id,
			createdAt: data.created_at,
			updatedAt: data.updated_at ?? null,
		};
	}

	async delete(id: string): Promise<boolean> {
		const { error } = await this.db.from(this.table).delete().eq('id', id);
		if (error) throw error;
		return true;
	}
}