import React from 'react';
import styles from './GameApp.module.scss';
import assetsDictionary from '../../assetBuilder/assetBuilder';

interface IGameAppProps {}

const GameApp = () => {
	return (
		<div className={styles.gameApp}>
			{Object.values(assetsDictionary.actions).map((el) => {
				return <img src={el} alt="" />;
			})}
		</div>
	);
};
export default GameApp;
