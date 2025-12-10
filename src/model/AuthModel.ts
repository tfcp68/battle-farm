// src/model/AuthModel.ts
import BaseModel from '~/model/BaseModel';
import { getCurrentUser, signInWithNickname, signOutSupabase, signUpWithNickname } from '~/auth/auth';

export default class AuthModel extends BaseModel {
	async register(nickname: string, password: string) {
		const { user } = await signUpWithNickname(nickname, password);
		if (!user) throw new Error('Failed to sign up');

		const { data: existing } = await this.db
			.from('players')
			.select('*')
			.eq('user_id', user.id)
			.maybeSingle();

		if (existing) {
			return { user, player: { playerId: existing.id, nickname: existing.nickname } };
		}

		const { data, error } = await this.db
			.from('players')
			.insert({ nickname, user_id: user.id })
			.select()
			.single();
		if (error) throw error;

		return { user, player: { playerId: data.id, nickname: data.nickname } };
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

		return { user, player: { playerId: player.id, nickname: player.nickname } };
	}

	async signOut() {
		await signOutSupabase();
	}

	async getCurrentPlayer(): Promise<{ playerId: string; nickname: string } | null> {
		const user = await getCurrentUser();
		if (!user) return null;

		const { data: player } = await this.db
			.from('players')
			.select('*')
			.eq('user_id', user.id)
			.maybeSingle();
		if (!player) return null;

		return { playerId: player.id, nickname: player.nickname };
	}
}
