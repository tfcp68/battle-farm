import React, {FC} from 'react';
import styles from './GameAvatar.module.scss'
import {TPlayerClass} from "~/src/types/serializables/players";
import useImage from "~/hooks/useImage";
import {TCardType} from "~/src/types/serializables/cards";
import {getPlayerClassName} from "~/src/helpers/playerClass";

interface IGameAvatarProps {
    avatarImage: TPlayerClass
}

const GameAvatar: FC<IGameAvatarProps> = ({avatarImage}) => {
    const {image, loading, error} = useImage(getPlayerClassName(avatarImage), TCardType.UNKNOWN)
    return (
        <div className={styles.gameAvatar}>
            <img src={image} alt="icon"/>
        </div>
    );
};

export default GameAvatar;