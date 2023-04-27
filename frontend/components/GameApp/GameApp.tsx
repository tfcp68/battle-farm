import React from 'react';
import styles from './GameApp.module.scss';
import GameBlockInfo from '~/components/GameBlockInfo/GameBlockInfo';
import GameDeck from '~/components/GameDeck/GameDeck';
import GameMarket from '~/components/GameMarket/GameMarket';
import GamePlayerInfo from '~/components/GamePlayerInfo/GamePlayerInfo';
import { listCards, playerInfo } from '../../constants/gameConstants';
import GameEnemyInfo from '~/components/GameEnemyInfo/GameEnemyInfo';
import GameDices from '~/components/GameDices/GameDices';

const GameApp = () => {
	return (
		<div className={styles.gameApp}>
			<div className={'container'}>
				<div className={styles.gameApp__wrapper}>
					<GameBlockInfo playerInfo={playerInfo} />
					<GameDices />
					<GamePlayerInfo playerInfo={playerInfo} />
					<GameEnemyInfo enemyInfo={playerInfo} />
					<GameDeck listCards={listCards} />
					<GameMarket listCards={listCards} />
				</div>
			</div>
		</div>
	);
};

export default GameApp;
