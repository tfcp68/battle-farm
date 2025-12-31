import React from 'react';
import { useNavigate } from 'react-router-dom';
import IntroSplash from '~/components/IntroSplash';
import { emitDomainEvent } from '~/yantrix/sources/uiBridgeSource';
import { WindowDomainEvents } from '~/yantrix/windowDomainEvents';

export default function IntroPage() {
	const navigate = useNavigate();

	return (
		<div style={{ position: 'relative', minHeight: '100dvh' }}>
			<IntroSplash
				durationMs={2000}
				text="Battle Farm"
				onComplete={() => {
					emitDomainEvent(WindowDomainEvents.intro_complete, null);
					navigate('/menu', { replace: true });
				}}
			/>
		</div>
	);
}