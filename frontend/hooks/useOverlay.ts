import { ReactElement, ReactPortal, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Overlay from '../HOC/Overlay/Overlay';

const overlay = document.getElementById('overlay') as Element;
export const useOverlay = () => {
	const [element, setElement] = useState<ReactElement>();
	const [portal, setPortal] = useState<ReactPortal>();

	useEffect(() => {
		if (element) {
			setPortal(createPortal(Overlay(element), overlay));
		}
	}, [element]);

	return [portal, setElement];
};
