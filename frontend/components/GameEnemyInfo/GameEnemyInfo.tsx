import React, { FC } from 'react';
import styles from './GameEnemyInfo.module.scss';
import { TPlayer } from '~/src/types/serializables/players';
import GameAvatar from '~/components/GameAvatar/GameAvatar';
import GameAmountCoins from '~/components/GameAmountCoins/GameAmountCoins';
import GameAmountFertilize from '~/components/GameAmountFertilize/GameAmountFertilize';

interface IEnemyInfo {
	enemyInfo: TPlayer;
}

const GameEnemyInfo: FC<IEnemyInfo> = ({ enemyInfo }) => {
	const { coins, class: enemyClassIx, fertilizers } = enemyInfo;
	return (
		<div className={styles.enemyInfo}>
			<GameAvatar avatarImageIx={enemyClassIx} typeAvatar={'enemy'} />
			<div className={styles.enemyInfo__sourceInfo}>
				<GameAmountCoins amountCoins={coins} />
				<GameAmountFertilize amountFertilize={fertilizers} />
			</div>
		</div>
	);
};

export default GameEnemyInfo;
