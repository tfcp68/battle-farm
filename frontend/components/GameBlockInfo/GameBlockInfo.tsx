import React, { FC } from 'react';
import styles from './GameBlockInfo.module.scss';
import { TPlayer } from '~/src/types/serializables/players';
import GameHand from '~/components/GameHand/GameHand';
import GameBeds from '~/components/GameBeds/GameBeds';
import { getPlayerClassName } from '~/src/helpers/playerClass';

interface IGameBlockInfoProps {
	playerInfo: TPlayer;
}

const GameBlockInfo: FC<IGameBlockInfoProps> = ({ playerInfo }) => {
	const { coins, class: playerClassIndex, discardedCards, hand, id, beds, fertilizers } = playerInfo;

	return (
		<div className={styles.gameBlockInfo}>
			<div>{coins + ' coins'}</div>
			<div>{fertilizers + ' fertilizers'}</div>
			<div>{getPlayerClassName(playerClassIndex)}</div>
			<GameHand listCards={hand} />
			<GameBeds listBeds={beds} />
		</div>
	);
};

export default GameBlockInfo;
