import React, {FC} from 'react';
import {TBed} from '~/src/types/serializables/crops';
import styles from './Bed.module.scss';

interface IBedProps {
    bedInfo: TBed;
}

const Bed: FC<IBedProps> = ({bedInfo}) => {
    const {crop} = bedInfo;

    return (
        <li className={styles.bed}>
            <div>
                {'Timer: ' + crop?.ripeTimer + ' '}
            </div>
            <div>
                {'Fertilized: ' + crop?.fertilized}
            </div>
            <div>
                {'Cost: ' + crop?.value}
            </div>
        </li>
    );
};

export default Bed;
