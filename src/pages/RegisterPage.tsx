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
			setMessage('Введите ник');
			return;
		}
		if (!pass) {
			setMessage('Введите пароль');
			return;
		}
		try {
			await register.mutateAsync({ nickname: name, password: pass });
			// После успешной регистрации currentPlayer подтянется через useCurrentPlayer, просто идём на intro
			navigate('/intro', { replace: true });
		} catch (e: unknown) {
			const err = e as { message?: string };
			setMessage(err?.message || 'Ошибка регистрации');
		}
	};

	return (
		<div className="auth-page">
			<form className="auth-card" onSubmit={submit}>
				<h3 className="section-title" style={{ margin: 0, textAlign: 'center' }}>Регистрация</h3>
				<small className="muted" style={{ textAlign: 'center' }}>
					Введите ник и пароль — создадим аккаунт в Supabase и привяжем игрока
				</small>
				<Field label="Ник" value={nickname} onChange={setNickname} placeholder="Введите ник" />
				<Field label="Пароль" value={password} onChange={setPassword} placeholder="Введите пароль" />
				<div className="actions">
					<button className="primary" type="submit" disabled={register.isPending}>
						{register.isPending ? '...' : 'Зарегистрироваться'}
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