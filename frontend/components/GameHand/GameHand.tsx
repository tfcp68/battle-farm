import React, { FC } from 'react';
import { TCard } from '~/src/types/serializables/cards';
import styles from '~/components/GameHand/GameHand.module.scss';
import GameCard from '~/components/GameCard/GameCard';

interface IGameHandProps {
	listCards: TCard[];
}

const GameHand: FC<IGameHandProps> = ({ listCards }) => {
	return (
		<ul className={styles.gameHand__list}>
			{'Hand: '}
			{listCards.map((card) => {
				return <GameCard key={card.uuid} card={card} />;
			})}
		</ul>
	);
};

export default GameHand;
