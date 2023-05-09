import React, { FC } from 'react';
import styles from './GameAmountFertilize.module.scss';
import iconFertilize from '~/assets/elements/fertilize_icon.png';

interface IGameAmountFertilize {
	amountFertilize: number;
}

const GameAmountFertilize: FC<IGameAmountFertilize> = ({ amountFertilize }) => {
	return (
		<div className={styles.amountFertilize}>
			<img className={styles.amountFertilize__iconFertilize} src={iconFertilize} alt="icon" />
			<div className={styles.amountFertilize__fertilize}>{amountFertilize + ' fertilize'}</div>
		</div>
	);
};

export default GameAmountFertilize;
