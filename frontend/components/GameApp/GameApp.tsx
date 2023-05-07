import React from 'react';
import styles from './GameApp.module.scss';
import GameBlockInfo from '~/components/GameBlockInfo/GameBlockInfo';
import GameDeck from '~/components/GameDeck/GameDeck';
import GameMarket from '~/components/GameMarket/GameMarket';
import GamePlayerInfo from '~/components/GamePlayerInfo/GamePlayerInfo';
import { enemyInfo, listCards, playerInfo } from '../../constants/gameConstants';
import GameEnemyInfo from '~/components/GameEnemyInfo/GameEnemyInfo';
import { TTurnPhase } from '~/src/types/fsm';
import { TShoppingPhase } from '~/src/types/fsm/slices/shopping';

const GameApp = () => {
	return (
		<div className={styles.gameApp}>
			<div className={'container'}>
				<div className={styles.gameApp__wrapper}>
					<GameBlockInfo
						currPhaseName={TTurnPhase[TTurnPhase.SHOPPING]}
						currSubphaseName={TShoppingPhase[TShoppingPhase.FINISHED]}
						currPlayer={playerInfo}
					/>
					<GamePlayerInfo playerInfo={playerInfo} />
					<GameEnemyInfo enemyInfo={enemyInfo} />
					<GameDeck listCards={listCards} />
					<GameMarket listCards={listCards} />
				</div>
			</div>
		</div>
	);
};

export default GameApp;
