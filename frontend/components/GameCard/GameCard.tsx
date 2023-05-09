import React from 'react';
import styles from './GameCard.module.scss';
import useImage from '~/hooks/useImage';
import { TCardType } from '~/src/types/serializables/cards';

interface IGameCardProps {
	cropImage: string;
	typeCard: TCardType;
}

const GameCard: React.FC<IGameCardProps> = ({ cropImage, typeCard }) => {
	const { image, loading, error } = useImage(cropImage, typeCard);
	if (error) return <p>{'Error loading images'}</p>;
	return !loading ? (
		<section className={styles.gameCard}>
			<div className={styles.gameCard__inner}>
				<div className={styles.gameCard__face}>
					<img className={styles.gameCard__img} src={image} alt="card" />
					<div className={styles.gameCard__timer}></div>
					{/*<img className={styles.gameCard__frame} src={frameCard} alt="frame" />*/}
				</div>
				<div className={styles.gameCard__face + ' ' + styles.gameCard__back}></div>
			</div>
		</section>
	) : (
		<div>Loading...</div>
	);
};

export default GameCard;
