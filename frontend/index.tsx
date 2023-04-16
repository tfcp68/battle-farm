import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.scss';
import GameApp from './components/GameApp/GameApp';

const root = document.getElementById('root');
if (root) {
	const App = createRoot(root);
	App.render(<GameApp></GameApp>);
} else throw new Error('App container #root not found');
