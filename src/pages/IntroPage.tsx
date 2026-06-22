import React from 'react';
import IntroSplash from '~/shared/ui/IntroSplash';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

export default function IntroPage() {
	return (
		<div style={{ position: 'relative', minHeight: '100dvh' }}>
			<IntroSplash
				durationMs={2000}
				text="Battle Farm"
				onComplete={() => {
					emitDomainEvent(WindowDomainEvents.intro_complete, null);
				}}
			/>
		</div>
	);
}
