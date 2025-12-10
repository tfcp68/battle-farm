import React from 'react';
import { useNavigate } from 'react-router-dom';
import WindowModeAutomata from '~/fsm/window/WindowModeAutomata';
import IntroSplash from '~/components/IntroSplash';
import { useFSM } from '@yantrix/react';

export default function IntroPage() {
	const { dispatch: modeDispatch } = useFSM({ id: WindowModeAutomata.id, Automata: WindowModeAutomata });
	const navigate = useNavigate();

	React.useEffect(() => {
		const reset = WindowModeAutomata.getAction?.('RESET');
		if (reset) modeDispatch({ action: reset, payload: {} });
	}, [modeDispatch]);

	return (
		<div style={{ position: 'relative', minHeight: '100dvh' }}>
			<IntroSplash
				durationMs={2000}
				text="Battle Farm"
				onComplete={() => {
					const toMenu = WindowModeAutomata.getAction?.('TO_MENU');
					if (toMenu) modeDispatch({ action: toMenu, payload: {} });
					navigate('/menu', { replace: true });
				}}
			/>
		</div>
	);
}