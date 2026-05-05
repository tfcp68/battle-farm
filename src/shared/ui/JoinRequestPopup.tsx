type JoinRequestPopupProps = {
	gameId?: string | null;
	hostPlayerId?: string | null;
	message?: string;
	onAccept?: () => void;
	onCancel: () => void;
};

export function JoinRequestPopup({ gameId, hostPlayerId, message = 'Your request to join the lobby has been sent.', onAccept, onCancel }: JoinRequestPopupProps) {
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Join Request"
			onClick={onCancel}
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
					Join Request Sent
				</h3>
				<p style={{ textAlign: 'center', marginTop: 8, marginBottom: 16 }}>{message}</p>
				<div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
					{onAccept ? (
						<button className="btn btn-primary" onClick={onAccept}>
							OK
						</button>
					) : null}
					<button className="btn btn-outline" onClick={onCancel}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

export default JoinRequestPopup;
