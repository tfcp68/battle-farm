import React, { FC, useState } from 'react';
import styles from './GameDeck.module.scss';
import { TCard } from '~/src/types/serializables/cards';
import GameCard from '~/components/GameCard/GameCard';

interface IGameDeckProps {
	listCards: TCard[];
}

const GameDeck: FC<IGameDeckProps> = ({ listCards }) => {
	const [deck, setDeck] = useState(listCards);
	return (
		<div className={styles.deck}>
			<h1 className={styles.deck__title}>Deck</h1>
			{deck.map((card) => {
				const { id } = card;
				return <GameCard key={id} cropImage={id} typeCard={card.type} />;
			})}
		</div>
	);
};

export default GameDeck;
