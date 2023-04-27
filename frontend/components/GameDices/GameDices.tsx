import React, { useRef } from 'react';
import ReactDice, { ReactDiceRef } from 'react-dice-complete';

const GameDices = () => {
	const reactDice = useRef<ReactDiceRef>(null);

	const rollDone = (totalValue: number, values: number[]) => {
		console.log('individual die values array:', values);
		console.log('total dice value:', totalValue);
	};

	return (
		<div>
			<ReactDice
				dotColor={'#fff'}
				faceColor={'#8dd27f'}
				rollTime={3}
				numDice={2}
				ref={reactDice}
				rollDone={rollDone}
			/>
		</div>
	);
};

export default GameDices;
