import React from "react";
import frameCard from "../../../../assets/elements/frame_card.png";


interface IGameCardProps {
  cropImage: string;
}

const Card = ({cropImage}: IGameCardProps) => {
  return (
    <section className="game-card">
      <div className="game-card__inner">
        <div className="game-card__face game-card__front">
          <img className="game-card__img" src={cropImage} alt="card" />
          <img className="game-card__frame" src={frameCard} alt="frame" />
          <img className="game-card__timer" src="" alt="" />
        </div>
        <div className="game-card__face game-card__back">
        </div>
      </div>
    </section>
  );
}

export default Card;