import React, { FC } from 'react';
import { TCard } from '~/src/types/serializables/cards';
import styles from './GameMarket.module.scss';

interface IGameMarketProps {
	listCards: TCard[];
}

const GameMarket: FC<IGameMarketProps> = ({ listCards }) => {
	return (
		<div className={styles.market}>
			<div className={styles.market__lot}></div>
			<div className={styles.market__lot}></div>
			<div className={styles.market__lot}></div>
			<div className={styles.market__lot}></div>
			<div className={styles.market__lot}></div>
			<div className={styles.market__lot}></div>
		</div>
	);
};

export default GameMarket;
