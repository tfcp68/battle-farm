import React from 'react';
import styles from '~/components/GameBlockInfo/GameBlockInfo.module.scss';
import { TBed } from '~/src/types/serializables/crops';
import Bed from '~/components/GameBeds/Bed/Bed';

interface IGameHandProps {
	listBeds: TBed[];
}

function GameBeds({ listBeds }: IGameHandProps) {
	return (
		<ul className={styles.gameBlockInfo__list}>
			{'Beds: '}
			{listBeds.map((bed, ix) => {
				return <Bed key={ix} bedInfo={bed} />;
			})}
		</ul>
	);
}

export default GameBeds;
