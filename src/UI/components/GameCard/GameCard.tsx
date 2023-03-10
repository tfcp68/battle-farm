import React from "react";
import frameCard from "~/assets/elements/frame_card.png";
import styles from './GameCard.module.scss'


interface IGameCardProps {
  cropImage: string;
}

const GameCard = ({cropImage}: IGameCardProps) => {
  return (
    <section className={styles.gameCard}>
      <div className={styles.gameCard__inner}>
        <div className={styles.gameCard__face + ' ' + styles.gameCard__front}>
          <img className={styles.gameCard__img} src={cropImage} alt="card" />
          <img className={styles.gameCard__frame} src={frameCard} alt="frame" />
          <img className={styles.gameCard__timer} src="" alt="icon" />
        </div>
        <div className={styles.gameCard__face + ' ' + styles.gameCard__back}>
        </div>
      </div>
    </section>
  );
}

export default GameCard;