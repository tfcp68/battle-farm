import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { AppServicesProvider } from '~/app/providers/AppServicesProvider';
import { MachinesProvider } from '~/app/providers/MachinesContext';

const el = document.getElementById('root')!;
createRoot(el).render(
	<React.StrictMode>
		<BrowserRouter>
			<AppServicesProvider>
				<MachinesProvider>
					<App />
				</MachinesProvider>
			</AppServicesProvider>
		</BrowserRouter>
	</React.StrictMode>
);