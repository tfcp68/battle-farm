import React from 'react';
import Field from '~/shared/ui/Field';
import { Button } from '~/shared/ui/components/button';
import { useProfileActions } from '~/features/profile/useProfileActions';
import { useCurrentProfile } from '~/entities/profile/queries';
import { readRoomCodeFromUrl } from '~/shared/net/roomLink';

/**
 * The whole of "signing in": pick a name. There are no accounts, so nothing to
 * verify and nothing to recover.
 */
export default function ProfilePage() {
	const { data: profile } = useCurrentProfile();
	const { setNickname } = useProfileActions();
	const [nickname, setLocalNickname] = React.useState('');
	const [isSaving, setIsSaving] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	// Someone arriving on an invite link is joining a specific room, not just
	// picking a name — say so, since the join happens on its own afterwards.
	const [invitedTo] = React.useState(() => readRoomCodeFromUrl());

	// Pre-fill when the player came back to rename themselves.
	React.useEffect(() => {
		if (profile?.nickname) setLocalNickname(profile.nickname);
	}, [profile?.nickname]);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSaving || !nickname.trim()) return;
		setIsSaving(true);
		setError(null);
		try {
			await setNickname(nickname);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not save your nickname.');
			setIsSaving(false);
		}
	};

	return (
		<div className="auth-page">
			<form className="auth-card" onSubmit={submit}>
				<h3 className="section-title" style={{ margin: 0, textAlign: 'center' }}>
					Choose a nickname
				</h3>
				{invitedTo && (
					<small className="muted" style={{ textAlign: 'center' }}>
						You were invited to room <strong>{invitedTo}</strong> — you will join it right after.
					</small>
				)}
				<Field
					label="Nickname"
					value={nickname}
					onChange={setLocalNickname}
					placeholder="How other players will see you"
				/>
				<div className="actions">
					<Button className="primary" type="submit" disabled={isSaving || !nickname.trim()}>
						{isSaving ? '...' : 'Continue'}
					</Button>
				</div>
				{error && (
					<div style={{ textAlign: 'center' }}>
						<small className="muted">{error}</small>
					</div>
				)}
			</form>
		</div>
	);
}
