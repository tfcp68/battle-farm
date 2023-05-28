import React from 'react';
import { TCard } from '~/src/types/serializables/cards';
import styles from './GameCard.module.scss';
import { useAsset } from '~/frontend/hooks/useAsset';

interface IGameCardProps {
	card: TCard;
}

const GameCard: React.FC<IGameCardProps> = ({ card }) => {
	const [path] = useAsset(card.id, 'SMALL');
	return (
		<section className={styles.gameCard}>
			<div className={styles.gameCard__inner}>
				<div className={styles.gameCard__face}>
					<img src={path} alt="Card" />
					<div className={styles.gameCard__timer}></div>
					{/*<img className={styles.gameCard__frame} src={frameCard} alt="frame" />*/}
				</div>
				<div className={styles.gameCard__face + ' ' + styles.gameCard__back}></div>
			</div>
		</section>
	);
};

export default GameCard;
