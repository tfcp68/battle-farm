import React from 'react';
import styles from './GameApp.module.scss';
import GameBlockInfo from '~/components/GameBlockInfo/GameBlockInfo';
import { TCropColor, TGardenBedType } from '~/src/types/serializables/crops';
import { TCardType } from '~/src/types/serializables/cards';
import { TPlayerClass } from '~/src/types/serializables/players';

interface IGameAppProps {}

const GameApp = () => {
	return (
		<div className={styles.gameApp}>
			{/*<GameCard cropImage={beans} />*/}
			<GameBlockInfo
				playerInfo={{
					id: '1',
					coins: 10,
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
					class: TPlayerClass.WEATHER_WATCHER,
					fertilizers: 4,
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
				}}
			/>
		</div>
	);
};

export default GameApp;
