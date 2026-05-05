import type { SupabaseClient } from '@supabase/supabase-js';
import supabase from '~/shared/api/connect';

export default class PlayersModel {
	private readonly db: SupabaseClient;
	private readonly table = 'players';

	constructor(db: SupabaseClient = supabase) {
		this.db = db;
	}

	async getById(playerId: string) {
		const { data, error } = await this.db
			.from(this.table)
			.select('*')
			.eq('id', playerId)
			.limit(1)
			.single();
		if (error) throw error;
		if (!data) return null;
		return {
			playerId: data.id as string,
			nickname: data.nickname as string,
			createdAt: data.created_at as string,
			lastSeen: (data.last_seen ?? null) as string | null,
		};
	}

	async list() {
		const { data, error } = await this.db
			.from(this.table)
			.select('*')
			.order('created_at', { ascending: false });
		if (error) throw error;
		return (data || []).map((d) => ({
			playerId: d.id as string,
			nickname: d.nickname as string,
			createdAt: d.created_at as string,
			lastSeen: (d.last_seen ?? null) as string | null,
		}));
	}

	async create(p: { nickname: string; userId?: string }) {
		const row: Record<string, string> = { nickname: p.nickname };
		if (p.userId) row.user_id = p.userId;

		const { data, error } = await this.db.from(this.table).insert(row).select().single();
		if (error) throw error;
		return {
			playerId: data.id as string,
			nickname: data.nickname as string,
			createdAt: data.created_at as string,
			lastSeen: (data.last_seen ?? null) as string | null,
		};
	}

	async update(playerId: string, patch: Partial<{ nickname: string; lastSeen: string }>) {
		const body: Record<string, string> = {};
		if (patch.nickname !== undefined) body.nickname = patch.nickname;
		if (patch.lastSeen !== undefined) body.last_seen = patch.lastSeen;

		const { data, error } = await this.db
			.from(this.table)
			.update(body)
			.eq('id', playerId)
			.select()
			.single();
		if (error) throw error;
		return {
			playerId: data.id as string,
			nickname: data.nickname as string,
			createdAt: data.created_at as string,
			lastSeen: (data.last_seen ?? null) as string | null,
		};
	}

	async delete(playerId: string): Promise<boolean> {
		const { error } = await this.db.from(this.table).delete().eq('id', playerId);
		if (error) throw error;
		return true;
	}
}

