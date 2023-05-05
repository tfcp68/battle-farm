import React, { FC } from 'react';

const ProgressBarThumb = {
	backgroundColor: 'orange',
	borderRadius: '10px',
	height: 'inherit',
	border: 'none',
};

interface IProgressBarProps {
	winLimit: number;
	currentMaxCoins: number;
}

const GameProgressBar: FC<IProgressBarProps> = ({ winLimit, currentMaxCoins }) => {
	const styleProgressBar = (width: number) => {
		return {
			width: `${width}px`,
			height: '14px',
			backgroundColor: '#ffe2cf',
			borderRadius: '10px',
			border: 'none',
		};
	};
	return (
		<div style={{ ...styleProgressBar(winLimit) }}>
			<div style={{ ...ProgressBarThumb, width: `${currentMaxCoins}%` }}></div>
		</div>
	);
};

export default GameProgressBar;
