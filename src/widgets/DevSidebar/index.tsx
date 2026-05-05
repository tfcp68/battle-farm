import React from 'react';

type DevSidebarProps = {
	automataName?: string;
	stateName?: string | null;
	snapshot?: unknown;
	children?: React.ReactNode;
	style?: React.CSSProperties;
};

export default function DevSidebar({ automataName, stateName, snapshot, children, style }: DevSidebarProps) {
	return (
		<aside
			className="dev-fixed"
			style={{ height: 'auto', border: '1px solid var(--border)', borderRadius: 10, ...style }}>
			<div className="dev-fixed-inner">
				{(automataName || stateName || snapshot != null) && (
					<div className="grid" style={{ marginBottom: 8 }}>
						{automataName && (
							<div className="row" style={{ alignItems: 'center' }}>
								<small className="muted">Automata:</small>
								<span style={{ marginLeft: 6 }}>{automataName}</span>
							</div>
						)}
						{stateName && (
							<div className="state-badge">
								<span className="state-badge-label">State:</span>
								<span className="state-badge-value">{stateName}</span>
							</div>
						)}
						{snapshot != null && (
							<pre style={{ overflow: 'auto', margin: 0 }}>{JSON.stringify(snapshot, null, 2)}</pre>
						)}
					</div>
				)}
				{children}
			</div>
		</aside>
	);
}

