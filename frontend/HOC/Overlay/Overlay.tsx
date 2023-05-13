import React, { Children, Dispatch, ReactNode, SetStateAction } from 'react';
import styles from './Overlay.module.scss';

interface IOverlayProps {
	children: ReactNode;
	isShow: boolean;
	hideOverlay: Dispatch<SetStateAction<boolean>>;
}

const Overlay = ({ children, hideOverlay, isShow }: IOverlayProps) => {
	const mappedChildren = Children.map(children, (child) => <div onClick={(e) => e.stopPropagation()}>{child}</div>);
	if (!isShow) return null;
	return (
		<div onClick={() => hideOverlay(!isShow)} className={styles.overlay}>
			{mappedChildren}
		</div>
	);
};

export default Overlay;
