import React, { useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createServices, Services } from '~/services/createServices';

const Ctx = React.createContext<Services | null>(null);

export function AppServicesProvider({ children }: { children: React.ReactNode }) {
	const services = React.useMemo(() => createServices(), []);
	const queryClientRef = useRef<QueryClient>(null);
	if (!queryClientRef.current) queryClientRef.current = new QueryClient();

	return (
		<QueryClientProvider client={queryClientRef.current}>
			<Ctx.Provider value={services}>{children}</Ctx.Provider>
		</QueryClientProvider>
	);
}

export function useServices(): Services {
	const ctx = React.useContext(Ctx);
	if (!ctx) throw new Error('useServices must be used within AppServicesProvider');
	return ctx;
}