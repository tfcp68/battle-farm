import React, { useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createServices, Services } from '~/services/createServices';

type AppCtx = { services: Services; queryClient: QueryClient };

const Ctx = React.createContext<AppCtx | null>(null);

export function AppServicesProvider({ children }: { children: React.ReactNode }) {
	const services = React.useMemo(() => createServices(), []);
	const queryClientRef = useRef<QueryClient>(null);
	if (!queryClientRef.current) queryClientRef.current = new QueryClient();


	// for tanstack query extension debugging
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	declare global {
		interface Window {
			__TANSTACK_QUERY_CLIENT__:
				import("@tanstack/query-core").QueryClient;
		}
	}
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	window.__TANSTACK_QUERY_CLIENT__ = queryClientRef.current;

	const value = React.useMemo(() => ({ services, queryClient: queryClientRef.current! }), [services]);

	return (
		<QueryClientProvider client={queryClientRef.current}>
			<Ctx.Provider value={value}>{children}</Ctx.Provider>
		</QueryClientProvider>
	);
}

export function useServices(): Services {
	const ctx = React.useContext(Ctx);
	if (!ctx) throw new Error('useServices must be used within AppServicesProvider');
	return ctx.services;
}

export function useAppQueryClient(): QueryClient {
	const ctx = React.useContext(Ctx);
	if (!ctx) throw new Error('useAppQueryClient must be used within AppServicesProvider');
	return ctx.queryClient;
}