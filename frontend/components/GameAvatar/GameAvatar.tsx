import React, { FC } from 'react';
import { getPlayerClassName } from '~/src/helpers/playerClass';
import { TPlayerClass } from '~/src/types/serializables/players';
import styles from './GameAvatar.module.scss';
import { useAsset } from '~/frontend/hooks/useAsset';

interface IGameAvatarProps {
	avatarImageIx: TPlayerClass;
	typeAvatar: 'enemy' | 'player';
}

const GameAvatar: FC<IGameAvatarProps> = ({ avatarImageIx, typeAvatar }) => {
	const avatarName = getPlayerClassName(avatarImageIx);
	const [path] = useAsset(avatarName, 'LARGE');
	return (
		<div className={styles.gameAvatar}>
			<div
				style={typeAvatar === 'player' ? { border: '8px solid #92d393' } : { border: '8px solid #e84242' }}
				className={styles.gameAvatar__img}>
				<img src={path} alt="Game avatar" />
			</div>
			<h3>{avatarName}</h3>
		</div>
	);
};

export default GameAvatar;
