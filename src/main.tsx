import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { startYantrixCore, YantrixBootstrap } from '~/yantrix/coreLoop';
import { AppServicesProvider } from '~/providers/AppServicesProvider';

startYantrixCore();

const el = document.getElementById('root')!;
createRoot(el).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppServicesProvider>
				<YantrixBootstrap/>
                <App />
            </AppServicesProvider>
        </BrowserRouter>
    </React.StrictMode>
);