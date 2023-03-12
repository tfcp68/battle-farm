import React from 'react';
import styles from './GameApp.module.scss';
import beans from '~/assets/crops/beans.png';
import GameCard from "~/components/GameCard/GameCard";


interface IGameAppProps {
}

const GameApp = () => {
    return (
        <div
            className={styles.gameApp}>
            <GameCard
                cropImage={beans}/>
        </div>
    );
}

export default GameApp;