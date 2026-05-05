import supabase from '~/shared/api/connect';

// Base email local-part and domain for dev "nickname+password" auth.
const BASE_LOCAL = import.meta.env.VITE_AUTH_BASE_EMAIL_LOCAL || '';
const BASE_DOMAIN = import.meta.env.VITE_AUTH_BASE_EMAIL_DOMAIN || 'gmail.com';

function slug(nick: string) {
	return String(nick || '')
		.toLowerCase()
		.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48) || 'player';
}

export function nicknameToEmail(nickname: string) {
	if (!BASE_LOCAL) throw new Error('Set VITE_AUTH_BASE_EMAIL_LOCAL=yourgmailname');
	return `${BASE_LOCAL}+${slug(nickname)}@${BASE_DOMAIN}`;
}

export async function signUpWithNickname(nickname: string, password: string) {
	const email = nicknameToEmail(nickname);
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: { data: { nickname } },
	});
	if (error) {
		if (error.code === 'email_address_invalid') {
			throw new Error(
				`Supabase rejected "${email}". Check VITE_AUTH_BASE_EMAIL_LOCAL and VITE_AUTH_BASE_EMAIL_DOMAIN.`
			);
		}
		throw error;
	}
	return data;
}

export async function signInWithNickname(nickname: string, password: string) {
	const email = nicknameToEmail(nickname);
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw error;
	return data;
}

export async function signOutSupabase(): Promise<void> {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

export async function getCurrentUser() {
	const { data: { user }, error } = await supabase.auth.getUser();
	if (error) throw error;
	return user ?? null;
}

