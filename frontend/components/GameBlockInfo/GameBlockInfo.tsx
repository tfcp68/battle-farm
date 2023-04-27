import React, { FC } from 'react';
import styles from './GameBlockInfo.module.scss';
import { TPlayer } from '~/src/types/serializables/players';
import GameProgressBar from '~/components/GameProgressBar/GameProgressBar';

interface IGameBlockInfoProps {
	playerInfo: TPlayer;
}

const GameBlockInfo: FC<IGameBlockInfoProps> = ({ playerInfo }) => {
	return (
		<div className={styles.gameBlockInfo}>
			<GameProgressBar />
		</div>
	);
};

export default GameBlockInfo;
