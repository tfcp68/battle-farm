import React, { FC } from 'react';
import { TCard } from '~/src/types/serializables/cards';
import styles from './GameMarket.module.scss';
import GameCard from '~/components/GameCard/GameCard';

interface IGameMarketProps {
	listCards: TCard[];
}

const GameMarket: FC<IGameMarketProps> = ({ listCards }) => {
	return (
		<div className={styles.market}>
			<h1 className={styles.market__title}>Market</h1>
			<div className={styles.market__wrapper}>
				{listCards.map((card) => {
					return <GameCard key={card.id} card={card} />;
				})}
			</div>
		</div>
	);
};

export default GameMarket;
