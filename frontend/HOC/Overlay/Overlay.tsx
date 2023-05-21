import React, { ReactNode } from 'react';
import styles from './Overlay.module.scss';

const Overlay = (el: ReactNode) => {
	return <div className={styles.overlay}>{el}</div>;
};

export default Overlay;
