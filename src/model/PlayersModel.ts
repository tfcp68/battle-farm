import BaseModel from './BaseModel';

export default class PlayersModel extends BaseModel {
	private readonly table = 'players';

	async getById(playerId: string) {
		const { data, error } = await this.db.from(this.table).select('*').eq('id', playerId).limit(1).single();

		if (error) throw error;
		if (!data) return null;
		return this.mapRow({
			playerId: data.id,
			nickname: data.nickname,
			createdAt: data.created_at,
			lastSeen: data.last_seen ?? null,
		});
	}

	async list() {
		const { data, error } = await this.db.from(this.table).select('*').order('created_at', { ascending: false });
		if (error) throw error;
		return (data || []).map((d: any) =>
			this.mapRow({
				playerId: d.id,
				nickname: d.nickname,
				createdAt: d.created_at,
				lastSeen: d.last_seen ?? null,
			})
		);
	}

	async create(p: { nickname: string; userId?: string }) {
		const row: any = {
			nickname: p.nickname,
		};
		if (p.userId) row.user_id = p.userId;

		const { data, error } = await this.db.from(this.table).insert(row).select().single();
		if (error) throw error;
		return this.mapRow({
			playerId: data.id,
			nickname: data.nickname,
			createdAt: data.created_at,
			lastSeen: data.last_seen ?? null,
		});
	}

	async update(playerId: string, patch: Partial<{ nickname: string; lastSeen: string }>) {
		const body: any = {};
		if (patch.nickname !== undefined) body.nickname = patch.nickname;
		if (patch.lastSeen !== undefined) body.last_seen = patch.lastSeen;

		const { data, error } = await this.db.from(this.table).update(body).eq('id', playerId).select().single();
		if (error) throw error;
		return this.mapRow({
			playerId: data.id,
			nickname: data.nickname,
			createdAt: data.created_at,
			lastSeen: data.last_seen ?? null,
		});
	}

	async delete(playerId: string): Promise<boolean> {
		const { error } = await this.db.from(this.table).delete().eq('id', playerId);
		if (error) throw error;
		return true;
	}
}