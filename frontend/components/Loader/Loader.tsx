import React from 'react';
import styles from './Loader.module.scss';

interface ILoaderProps {
	classWraper?: string;
}
export const Loader: React.FC<ILoaderProps> = ({ classWraper }) => {
	return (
		<div className={classWraper}>
			<div className={styles.loader}></div>
		</div>
	);
};
