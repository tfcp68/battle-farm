import React from 'react';
import { createRoot } from 'react-dom/client';
import GameApp from './components/GameApp/GameApp';
import './styles/global.scss';

const root = document.getElementById('root');
if (root) {
	const App = createRoot(root);
	App.render(<GameApp></GameApp>);
} else throw new Error('App container #root not found');
