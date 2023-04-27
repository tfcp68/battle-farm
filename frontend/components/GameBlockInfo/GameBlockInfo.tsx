import React, { FC } from 'react';
import styles from './GameBlockInfo.module.scss';
import { TPlayer } from '~/src/types/serializables/players';

interface IGameBlockInfoProps {
	playerInfo: TPlayer;
}

const GameBlockInfo: FC<IGameBlockInfoProps> = ({ playerInfo }) => {
	return <div className={styles.gameBlockInfo}></div>;
};

export default GameBlockInfo;
