import React, { FC, useState } from 'react';
import styles from './GameDeck.module.scss';
import { TCard } from '~/src/types/serializables/cards';
import cardBack from '~/assets/elements/card_back.png';
import { GAME_WIN_LIMIT } from '../../constants/gameConstants';

interface IGameDeckProps {
	listCards: TCard[];
}

const GameDeck: FC<IGameDeckProps> = ({ listCards }) => {
	const [amountCards, setAmountCards] = useState(listCards);
	return (
		<div className={styles.deck}>
			<h1 className={styles.deck__title}>Deck</h1>
			<div className={styles.deck__amountCards}>{`${amountCards.length} / ${GAME_WIN_LIMIT}`}</div>
			<div className={styles.deck__shirtCard}>
				<img src={cardBack} alt="icon" />
			</div>
		</div>
	);
};

export default GameDeck;
