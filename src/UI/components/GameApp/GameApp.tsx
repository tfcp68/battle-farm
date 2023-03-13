import React from 'react';
import beans from '~/assets/crops/beans.png';
import GameCard from '~/components/GameCard/GameCard';
import styles from './GameApp.module.scss';

interface IGameAppProps {}

const GameApp = () => {
	return (
		<div className={styles.gameApp}>
			<GameCard cropImage={beans} />
		</div>
	);
};

export default GameApp;
