import type { SupabaseClient } from '@supabase/supabase-js';
import supabase from '~/shared/api/connect';
import { getCurrentUser, signInWithNickname, signOutSupabase, signUpWithNickname } from './auth';

export default class AuthModel {
	private readonly db: SupabaseClient;

	constructor(db: SupabaseClient = supabase) {
		this.db = db;
	}

	async register(nickname: string, password: string) {
		const { user } = await signUpWithNickname(nickname, password);
		if (!user) throw new Error('Failed to sign up');

		const { data: existing } = await this.db
			.from('players')
			.select('*')
			.eq('user_id', user.id)
			.maybeSingle();

		if (existing) {
			return { user, player: { playerId: existing.id as string, nickname: existing.nickname as string } };
		}

		const { data, error } = await this.db
			.from('players')
			.insert({ nickname, user_id: user.id })
			.select()
			.single();
		if (error) throw error;

		return { user, player: { playerId: data.id as string, nickname: data.nickname as string } };
	}

	async signIn(nickname: string, password: string) {
		const { user } = await signInWithNickname(nickname, password);
		if (!user) throw new Error('Failed to sign in');

		const { data: player, error } = await this.db
			.from('players')
			.select('*')
			.eq('user_id', user.id)
			.single();
		if (error) throw error;

		return { user, player: { playerId: player.id as string, nickname: player.nickname as string } };
	}

	async signOut() {
		await signOutSupabase();
	}

	async getCurrentPlayer() {
		const user = await getCurrentUser();
		if (!user) return null;

		const { data: player } = await this.db
			.from('players')
			.select('*')
			.eq('user_id', user.id)
			.maybeSingle();
		if (!player) return null;

		return { playerId: player.id as string, nickname: player.nickname as string };
	}
}

