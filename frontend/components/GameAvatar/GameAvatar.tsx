import React, { FC } from 'react';
import styles from './GameAvatar.module.scss';
import { TPlayerClass } from '~/src/types/serializables/players';
import useImage from '~/hooks/useImage';
import { TCardType } from '~/src/types/serializables/cards';
import { getPlayerClassName } from '~/src/helpers/playerClass';

interface IGameAvatarProps {
	avatarImageIx: TPlayerClass;
}

const GameAvatar: FC<IGameAvatarProps> = ({ avatarImageIx }) => {
	const avatarName = getPlayerClassName(avatarImageIx);
	const { image, loading, error } = useImage(avatarName, TCardType.UNKNOWN);
	return (
		<div className={styles.gameAvatar}>
			<div className={styles.gameAvatar__img}>
				<img src={image} alt="icon" />
			</div>
			<h3>{avatarName}</h3>
		</div>
	);
};

export default GameAvatar;
