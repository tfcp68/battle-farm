import React, { FC } from 'react';
import { TBed } from '~/src/types/serializables/crops';
import styles from './Bed.module.scss';

interface IBedProps {
	bedInfo: TBed;
}

const Bed: FC<IBedProps> = ({ bedInfo }) => {
	const { crop } = bedInfo;
	return (
		<li className={styles.bed}>
			{'Timer: ' + crop?.ripeTimer + ' '}
			{'Fertilize: ' + crop?.fertilized}
		</li>
	);
};

export default Bed;
