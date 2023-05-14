import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import styles from './Overlay.module.scss';
import { createPortal } from 'react-dom';

interface IOverlayProps {
	children: ReactNode;
	isShow: boolean;
	hideOverlay: Dispatch<SetStateAction<boolean>>;
}

const Overlay = ({ children, hideOverlay, isShow }: IOverlayProps) => {
	const overlay = document.getElementById('overlay') as Element;
	if (!isShow) return null;
	return createPortal(<div className={styles.overlay}>{children}</div>, overlay);
};

export default Overlay;
