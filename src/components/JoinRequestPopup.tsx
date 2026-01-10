import React from 'react';

export default function JoinRequestPopup({
	gameId,
	hostPlayerId,
	onCancel,
}: {
	gameId?: string | null;
	hostPlayerId?: string | null;
	onAccept?: () => void;
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
					Заявка на вступление
				</h3>
				<small className="muted" style={{ textAlign: 'center' }}>
					Заявка отправлена в лобби {gameId ?? '—'}
					{hostPlayerId ? `, хост: ${hostPlayerId}` : ''}. Ожидайте решения хоста.
				</small>

				<div className="actions">
					<button className="warn" onClick={onCancel}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}