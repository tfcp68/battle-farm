import React, { FC } from 'react';
import styles from './GameBeds.module.scss';
import { TBed } from '~/src/types/serializables/crops';
import Bed from '~/components/GameBeds/Bed/Bed';

interface IGameHandProps {
	listBeds: TBed[];
}

const GameBeds: FC<IGameHandProps> = ({ listBeds }) => {
	return (
		<ul className={styles.gameBeds}>
			{'Beds: '}
			{listBeds.map((bed, ix) => {
				return <Bed key={ix} bedInfo={bed} />;
			})}
		</ul>
	);
};

export default GameBeds;
