import React, { FC } from 'react';
import styles from './GameBlockInfo.module.scss';
import { TPlayer } from '~/src/types/serializables/players';
import GameProgressBar from '~/components/GameProgressBar/GameProgressBar';
import { GAME_AMOUNT_PLAYERS, GAME_WIN_LIMIT, TOTAL_SUM_VALUES_IN_DECK } from '~/frontend/constants/gameConstants';
import { getPlayerClassName } from '~/src/helpers/playerClass';

interface IGameBlockInfoProps {
	currPlayer: TPlayer;
	currPhaseName: string;
	currSubphaseName: string;
}

const GameBlockInfo: FC<IGameBlockInfoProps> = ({ currPlayer, currSubphaseName, currPhaseName }) => {
	const { class: currPlayerClass } = currPlayer;
	return (
		<div className={styles.gameBlockInfo}>
			<p>Current phase: {currPhaseName}</p>
			<p>Current subphase: {currSubphaseName}</p>
			<p>Current player: {getPlayerClassName(currPlayerClass)}</p>
			<GameProgressBar
				currentMaxCoins={40}
				winLimit={GAME_WIN_LIMIT(GAME_AMOUNT_PLAYERS, TOTAL_SUM_VALUES_IN_DECK)}
			/>
		</div>
	);
};

export default GameBlockInfo;
