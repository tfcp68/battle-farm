import React from 'react';
import styles from './GameApp.module.scss';
import Card from "../GameCard/GameCard";
import beans from '~/assets/crops/beans.png';

interface IGameAppProps {
}

const GameApp = () => {
    return (
        <div className={styles.gameApp}>
            <Card cropImage={beans}/>
        </div>
    );
}

export default GameApp;