import React from 'react';
import Field from '~/components/Field';
import { useNavigate } from 'react-router-dom';
import { useAuthActions } from '~/hooks/useAuth';

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
					{isRegister ? 'Регистрация' : 'Вход'}
				</h3>
				<Field label="Ник" value={nickname} onChange={setNickname} placeholder="Введите никнейм" />
				<Field label="Пароль" type="password" value={password} onChange={setPassword} placeholder="Введите пароль" />
				<div className="actions">
					<button className="primary" type="submit" disabled={register.isPending || signIn.isPending}>
						{register.isPending || signIn.isPending ? '...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
					</button>
					<button type="button" onClick={() => setIsRegister(v => !v)} style={{ marginLeft: 8 }}>
						{isRegister ? 'У меня есть аккаунт' : 'Создать аккаунт'}
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