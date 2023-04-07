import React from 'react';
import styles from '~/components/GameBlockInfo/GameBlockInfo.module.scss';
import { TBed } from '~/src/types/serializables/crops';

interface IGameHandProps {
	listBeds: TBed[];
}

function GameBeds({ listBeds }: IGameHandProps) {
	return (
		<ul className={styles.gameBlockInfo__list}>
			{'Beds: '}
			{listBeds.map((bed, ix) => {
				return (
					<li key={ix}>
						{'Timer: ' + bed.crop?.ripeTimer + ' '}
						{'Fertilize: ' + bed.crop?.fertilized}
					</li>
				);
			})}
		</ul>
	);
}

export default GameBeds;
