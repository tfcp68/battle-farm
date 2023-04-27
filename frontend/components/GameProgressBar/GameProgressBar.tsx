import React from 'react';

const styleProgressBar = {
	width: '200px',
	height: '14px',
	backgroundColor: '#ffe2cf',
	borderRadius: '10px',
	border: 'none',
};

const ProgressBarThumb = {
	backgroundColor: 'orange',
	borderRadius: '10px',
	height: 'inherit',
	border: 'none',
};

const GameProgressBar = () => {
	const CURRENT_MAX_COINS = 40;
	return (
		<div style={{ ...styleProgressBar }}>
			<div style={{ ...ProgressBarThumb, width: `${CURRENT_MAX_COINS}%` }}></div>
		</div>
	);
};

export default GameProgressBar;
