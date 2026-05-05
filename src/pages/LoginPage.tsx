import React from 'react';
import Field from '~/shared/ui/Field';
import { useNavigate } from 'react-router-dom';
import { useAuthActions } from '~/features/auth/useAuthActions';

export default function LoginPage() {
	const [nickname, setNickname] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [isRegister, setIsRegister] = React.useState(false);
	const [error, setError] = React.useState<string>('');
	const { register, signIn } = useAuthActions();
	const navigate = useNavigate();

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		try {
			if (isRegister) {
				await register.mutateAsync({ nickname, password });
			} else {
				await signIn.mutateAsync({ nickname, password });
			}
			navigate('/intro', { replace: true });
		} catch (e: any) {
			setError(e?.message ?? 'Auth error');
		}
	};

	return (
		<div className="auth-page">
			<form className="auth-card" onSubmit={submit}>
				<h3 className="section-title" style={{ margin: 0, textAlign: 'center' }}>
					{isRegister ? 'Sign up' : 'Sign in'}
				</h3>
				<Field label="Nickname" value={nickname} onChange={setNickname} placeholder="Enter your nickname" />
				<Field
					label="Password"
					type="password"
					value={password}
					onChange={setPassword}
					placeholder="Enter your password"
				/>
				<div className="actions">
					<button className="primary" type="submit" disabled={register.isPending || signIn.isPending}>
						{register.isPending || signIn.isPending ? '...' : isRegister ? 'Create account' : 'Sign in'}
					</button>
					<button type="button" onClick={() => setIsRegister((v) => !v)}>
						{isRegister ? 'I already have an account' : 'Create an account'}
					</button>
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