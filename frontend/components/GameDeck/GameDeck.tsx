import React, { FC, useState } from 'react';
import styles from './GameDeck.module.scss';
import { TCard } from '~/src/types/serializables/cards';
import cardBack from '~/assets/elements/card_back.png?as=webp&width=300&height==300@loader';

interface IGameDeckProps {
	listCards: TCard[];
}

const GameDeck: FC<IGameDeckProps> = ({ listCards }) => {
	const [amountCards] = useState(listCards);
	return (
		<div className={styles.deck}>
			<div className={styles.deck__info}>
				<h1 className={styles.deck__title}>Deck</h1>
				<div className={styles.deck__amountCards}>{`Total cards in deck: ${amountCards.length}`}</div>
			</div>
			<div className={styles.deck__shirtCard}>
				<img src={cardBack} alt="icon" />
			</div>
		</div>
	);
};

export default GameDeck;
