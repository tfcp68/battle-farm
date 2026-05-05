import React, { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createServices, Services } from '~/shared/services/createServices';

type AppServicesContextValue = Services & { queryClient: QueryClient };

const AppServicesContext = createContext<AppServicesContextValue | null>(null);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 10_000,
		},
	},
});

export function AppServicesProvider({ children }: { children: React.ReactNode }) {
	const services = useMemo(() => createServices(), []);

	const value = useMemo<AppServicesContextValue>(
		() => ({ ...services, queryClient }),
		[services]
	);

	return (
		<AppServicesContext.Provider value={value}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</AppServicesContext.Provider>
	);
}

export function useServices(): Services {
	const ctx = useContext(AppServicesContext);
	if (!ctx) throw new Error('useServices must be used inside AppServicesProvider');
	return ctx;
}

export function useAppQueryClient(): QueryClient {
	const ctx = useContext(AppServicesContext);
	if (!ctx) throw new Error('useAppQueryClient must be used inside AppServicesProvider');
	return ctx.queryClient;
}

