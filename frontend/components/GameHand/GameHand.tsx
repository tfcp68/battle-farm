import React, { FC } from 'react';
import { TCard } from '~/src/types/serializables/cards';
import styles from '~/components/GameBlockInfo/GameBlockInfo.module.scss';

interface IGameHandProps {
	listCards: TCard[];
}

const GameHand: FC<IGameHandProps> = ({ listCards }) => {
	return (
		<ul className={styles.gameBlockInfo__list}>
			{'Hand: '}
			{listCards.map((card) => {
				return <li key={card.uuid}>{card.id}</li>;
			})}
		</ul>
	);
};

export default GameHand;
