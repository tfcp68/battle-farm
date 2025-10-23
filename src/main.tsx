import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { YantrixProvider } from '~/src/yantrix/YantrixProvider';
import config from './yantrix/config.json';
import { registerYantrixFunctions } from '~/src/yantrix/register-functions';

registerYantrixFunctions();
const el = document.getElementById('root')!;
createRoot(el).render(
    <React.StrictMode>
        <BrowserRouter>
            <YantrixProvider config={config}>
                <App />
            </YantrixProvider>
        </BrowserRouter>
    </React.StrictMode>
);