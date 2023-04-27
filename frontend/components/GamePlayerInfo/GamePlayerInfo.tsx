import React, { FC } from 'react';
import styles from './GamePlayerInfo.module.scss';
import { TPlayer } from '~/src/types/serializables/players';
import GameAvatar from '~/components/GameAvatar/GameAvatar';
import GameHand from '~/components/GameHand/GameHand';
import { listCards } from '../../constants/gameConstants';
import GameBeds from '~/components/GameBeds/GameBeds';
import GameAmountCoins from '~/components/GameAmountCoins/GameAmountCoins';
import GameAmountFertilize from '~/components/GameAmountFertilize/GameAmountFertilize';

interface IGameBlockInfoProps {
	playerInfo: TPlayer;
}

const GamePlayerInfo: FC<IGameBlockInfoProps> = ({ playerInfo }) => {
	const { coins, class: playerClassIndex, fertilizers } = playerInfo;

	return (
		<div className={styles.playerInfo}>
			<GameAvatar avatarImageIx={playerClassIndex} typeAvatar={'player'} />
			<div className={styles.playerInfo__sourceInfo}>
				<GameAmountCoins amountCoins={coins} />
				<GameAmountFertilize amountFertilize={fertilizers} />
			</div>
			<div className={styles.playerInfo__cropInfoBlock}>
				<GameHand listCards={listCards} />
				<GameBeds listBeds={playerInfo.beds} />
			</div>
		</div>
	);
};

export default GamePlayerInfo;
