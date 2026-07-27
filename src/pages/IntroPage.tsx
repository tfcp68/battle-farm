import React from 'react';
import IntroSplash from '~/shared/ui/IntroSplash';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

export default function IntroPage() {
	// IntroSplash is position: fixed and covers the viewport on its own,
	// so no sized wrapper here — it would only overflow the page padding.
	return (
		<IntroSplash
			durationMs={2000}
			text="Battle Farm"
			onComplete={() => {
				emitDomainEvent(WindowDomainEvents.intro_complete, null);
			}}
		/>
	);
}
