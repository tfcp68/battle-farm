import React from 'react';
import styles from './GameApp.module.scss';

import { TCropColor, TGardenBedType } from '~/src/types/serializables/crops';
import { TCard, TCardType } from '~/src/types/serializables/cards';
import { TPlayer, TPlayerClass } from '~/src/types/serializables/players';
import GameBlockInfo from '~/components/GameBlockInfo/GameBlockInfo';
import GameDeck from '~/components/GameDeck/GameDeck';
import GameMarket from '~/components/GameMarket/GameMarket';

const GameApp = () => {
	const listCards: TCard[] = [
		{
			uuid: 1,
			type: TCardType.CROP,
			id: 'WHEAT',
			value: 5,
			fertilized: 10,
			ripeTimer: 30,
			group: TCropColor.GREEN,
		},
		{
			uuid: 2,
			type: TCardType.CROP,
			id: 'BEANS',
			value: 5,
			fertilized: 50,
			ripeTimer: 30,
			group: TCropColor.RED,
		},
	];
	const playerInfo: TPlayer = {
		id: '1',
		coins: 10,
		class: TPlayerClass.WEATHER_WATCHER,
		fertilizers: 4,
		hand: [
			{
				uuid: 1,
				type: TCardType.CROP,
				id: 'WHEAT',
				value: 5,
				fertilized: 10,
				ripeTimer: 30,
				group: TCropColor.GREEN,
			},
			{
				uuid: 2,
				type: TCardType.ACTION,
				id: 'RED_HEAT',
				value: 52,
			},
		],
		beds: [
			{
				type: TGardenBedType.COMMON,
				crop: {
					id: 'WHEAT',
					value: 5,
					fertilized: 10,
					ripeTimer: 30,
					group: TCropColor.GREEN,
				},
			},
			{
				type: TGardenBedType.RAISED,
				crop: {
					id: 'CABBAGE',
					value: 3,
					fertilized: 2,
					ripeTimer: 15,
					group: TCropColor.RED,
				},
			},
		],
	};
	return (
		<div className={styles.gameApp}>
			{/*<GameCard cropImage={beans} />*/}
			<div className={'container'}>
				<div className={styles.gameApp__wrapper}>
					<GameBlockInfo playerInfo={playerInfo} />
					<GameDeck listCards={listCards} />
					<GameMarket listCards={listCards} />
				</div>
			</div>
		</div>
	);
};

export default GameApp;
