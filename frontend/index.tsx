import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.scss';
import GameApp from '~/components/GameApp/GameApp';
import {canUseAviF, canUseWebP, getExt, setSupportedExt} from "~/frontend/utils/imageBrowserCheck";

const root = document.getElementById('root');
const renderTree = ()=>{
	if (root) {
		const App = createRoot(root);
		App.render(<GameApp></GameApp>);
	} else throw new Error('App container #root not found');
}


if(!getExt()) {
	Promise.allSettled([canUseWebP(),canUseAviF()]).then((res) => {
		setSupportedExt(res)
		renderTree()
	})
}
else renderTree()