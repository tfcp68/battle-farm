import React from 'react';
import Field from '~/components/Field';
import { useNavigate } from 'react-router-dom';
import { useAuthActions } from '~/hooks/useAuth';

export default function RegisterPage() {
	const [nickname, setNickname] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [message, setMessage] = React.useState<string>('');
	const navigate = useNavigate();
	const { register } = useAuthActions();

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage('');
		const name = nickname.trim();
		const pass = password.trim();
		if (!name) {
			setMessage('Enter a nickname');
			return;
		}
		if (!pass) {
			setMessage('Enter a password');
			return;
		}
		try {
			await register.mutateAsync({ nickname: name, password: pass });

			navigate('/intro', { replace: true });
		} catch (e: unknown) {
			const err = e as { message?: string };
			setMessage(err?.message || 'Registration error');
		}
	};

	return (
		<div className="auth-page">
			<form className="auth-card" onSubmit={submit}>
				<h3 className="section-title" style={{ margin: 0, textAlign: 'center' }}>
					Sign up
				</h3>
				<Field label="Nickname" value={nickname} onChange={setNickname} placeholder="Enter a nickname" />
				<Field label="Password" value={password} onChange={setPassword} placeholder="Enter a password" />
				<div className="actions">
					<button className="primary" type="submit" disabled={register.isPending}>
						{register.isPending ? '...' : 'Create account'}
					</button>
				</div>
				{message && (
					<div style={{ textAlign: 'center' }}>
						<small className="muted">{message}</small>
					</div>
				)}
			</form>
		</div>
	);
}