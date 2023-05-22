import React, { FC } from 'react';
import styles from './GameAmountCoins.module.scss';
import iconCoin from '~/assets/elements/coin.png?as=jpeg&width=50&height=50@loader';

interface IGameAmountCoins {
	amountCoins: number;
}

const GameAmountCoins: FC<IGameAmountCoins> = ({ amountCoins }) => {
	return (
		<div className={styles.amountCoins}>
			<img className={styles.amountCoins__iconCoin} src={iconCoin} alt="icon" />
			<div className={styles.amountCoins__coins}>{amountCoins + ' coins'}</div>
		</div>
	);
};

export default GameAmountCoins;
