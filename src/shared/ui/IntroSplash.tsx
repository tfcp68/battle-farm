import React from 'react';

/**
 * Fullscreen intro overlay.
 * The parent decides what to do on completion (including emitting any events).
 */
export default function IntroSplash({
	durationMs = 600,
	text = 'Battle Farm',
	onComplete,
}: {
	durationMs?: number;
	text?: string;
	onComplete?: () => void;
}) {
	React.useEffect(() => {
		const timer = setTimeout(() => {
			onComplete?.();
		}, durationMs);

		return () => clearTimeout(timer);
	}, [durationMs, onComplete]);

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Intro"
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 3000,
				background: 'rgba(0,0,0,0.85)',
				display: 'grid',
				placeItems: 'center',
				padding: 16,
			}}>
			<h1 className="intro-title" style={{ margin: 0 }}>
				{text}
			</h1>
		</div>
	);
}