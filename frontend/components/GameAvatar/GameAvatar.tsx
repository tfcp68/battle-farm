import React, { FC } from 'react';
import styles from './GameAvatar.module.scss';
import { TPlayerClass } from '~/src/types/serializables/players';
import useImage from '~/hooks/useImage';
import { TCardType } from '~/src/types/serializables/cards';
import { getPlayerClassName } from '~/src/helpers/playerClass';

interface IGameAvatarProps {
	avatarImageIx: TPlayerClass;
	typeAvatar: 'enemy' | 'player';
}

const GameAvatar: FC<IGameAvatarProps> = ({ avatarImageIx, typeAvatar }) => {
	const avatarName = getPlayerClassName(avatarImageIx);
	const { image } = useImage(avatarName, TCardType.UNKNOWN);
	return (
		<div className={styles.gameAvatar}>
			<div className={styles.gameAvatar__img}>
				<img
					style={typeAvatar === 'player' ? { border: '8px solid #92d393' } : { border: '8px solid #e84242' }}
					src={image}
					alt="icon"
				/>
			</div>
			<h3>{avatarName}</h3>
		</div>
	);
};

export default GameAvatar;
