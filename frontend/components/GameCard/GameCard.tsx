import React from "react";
import { useImage } from "~/frontend/hooks/useImage";
import { TCard } from "~/src/types/serializables/cards";
import styles from "./GameCard.module.scss";

interface IGameCardProps {
  card: TCard;
}

const GameCard: React.FC<IGameCardProps> = ({ card }) => {
  const { image, loading, error } = useImage(card.id, "SMALL");
  if (error) return <p>{"Error loading images"}</p>;
  return !loading ? (
    <section className={styles.gameCard}>
      <div className={styles.gameCard__inner}>
        <div className={styles.gameCard__face}>
          <img className={styles.gameCard__img} src={image} alt="card" />
          <div className={styles.gameCard__timer}></div>
          {/*<img className={styles.gameCard__frame} src={frameCard} alt="frame" />*/}
        </div>
        <div
          className={styles.gameCard__face + " " + styles.gameCard__back}
        ></div>
      </div>
    </section>
  ) : (
    <div>Loading...</div>
  );
};

export default GameCard;
