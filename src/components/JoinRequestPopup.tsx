import React from 'react';

export default function JoinRequestPopup({
	gameId,
	hostPlayerId,
	onAccept,
	onCancel,
}: {
	gameId?: string | null;
	hostPlayerId?: string | null;
	onAccept: () => void;
	onCancel: () => void;
}) {
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Join Request"
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 2000,
				background: 'rgba(0,0,0,0.6)',
				display: 'grid',
				placeItems: 'center',
				padding: 16,
			}}>
			<div className="auth-card" onClick={(e) => e.stopPropagation()} style={{ width: 420, maxWidth: '92vw' }}>
				<h3 className="section-title" style={{ margin: 0, textAlign: 'center' }}>
					Join request
				</h3>
				<small className="muted" style={{ textAlign: 'center' }}>
					You’ve sent a request to join lobby {gameId ?? '—'}
					{hostPlayerId ? `, host: ${hostPlayerId}` : ''}
				</small>

				<div className="actions">
					<button className="ok" onClick={onAccept}>
						Accept request
					</button>
					<button className="warn" onClick={onCancel}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}