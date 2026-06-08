import React from 'react';
import Field from '~/shared/ui/Field';
import { useAuthActions } from '~/features/auth/useAuthActions';
import { Button } from '~/shared/ui/components/button';
import { useMachines } from '~/app/providers/MachinesContext';
import { useFSM } from '@yantrix/react';
import { selectAuthError, selectAuthPending } from '~/shared/lib/fsm/selectors';
import type { TWindowModeContext } from '~/shared/types/types';

export default function LoginPage() {
	const [nickname, setNickname] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [isRegister, setIsRegister] = React.useState(false);
	const { signIn, register } = useAuthActions();

	const { mode: modeFSM } = useMachines();
	const { getContext: getModeContext } = useFSM<TWindowModeContext>(modeFSM.instance);
	const modeCtx = getModeContext();

	const isPending = selectAuthPending(modeCtx?.state);
	const authError = selectAuthError(modeCtx);

	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isPending || !nickname || !password) return;
		if (isRegister) {
			register(nickname, password);
		} else {
			signIn(nickname, password);
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
					<Button className="primary" type="submit" disabled={isPending}>
						{isPending ? '...' : isRegister ? 'Create account' : 'Sign in'}
					</Button>
					<Button type="button" onClick={() => setIsRegister((v) => !v)}>
						{isRegister ? 'I already have an account' : 'Create an account'}
					</Button>
				</div>
				{authError && (
					<div style={{ textAlign: 'center' }}>
						<small className="muted">{authError}</small>
					</div>
				)}
			</form>
		</div>
	);
}
