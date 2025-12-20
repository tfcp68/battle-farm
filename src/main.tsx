import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { AppServicesProvider } from '~/providers/AppServicesProvider';
import { registerYantrixFunctions } from '~/yantrix/register-functions';
import { MachinesProvider } from '~/yantrix/MachinesContext';

registerYantrixFunctions();

const el = document.getElementById('root')!;
createRoot(el).render(
	<React.StrictMode>
		<BrowserRouter>
			<MachinesProvider>
				<AppServicesProvider>
					<App />
				</AppServicesProvider>
			</MachinesProvider>
		</BrowserRouter>
	</React.StrictMode>
);