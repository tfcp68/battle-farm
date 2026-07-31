import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createServices, Services } from '~/shared/services/createServices';
import { setCurrentProfile } from '~/entities/profile/currentProfile';

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

/**
 * Module-level for the same reason as `queryClient`: `CoreLoop` is a singleton
 * that captures whatever services it is first started with. Built per-component,
 * a remount would hand the React tree a second `RoomService` while the loop kept
 * hosting the room in the first — and the tree would render an empty lobby.
 */
const services = createServices();

export function AppServicesProvider({ children }: { children: React.ReactNode }) {
	const [isProfileLoaded, setProfileLoaded] = useState(false);

	// The mode FSM reads the player id synchronously at boot, so the profile has
	// to be in the mirror before anything downstream (MachinesProvider) mounts.
	useEffect(() => {
		let cancelled = false;
		services.controllers.profile
			.current()
			.then((profile) => {
				if (cancelled) return;
				setCurrentProfile(profile);
			})
			.catch(() => {
				if (!cancelled) setCurrentProfile(null);
			})
			.finally(() => {
				if (!cancelled) setProfileLoaded(true);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const value = useMemo<AppServicesContextValue>(() => ({ ...services, queryClient }), []);

	return (
		<AppServicesContext.Provider value={value}>
			<QueryClientProvider client={queryClient}>
				{isProfileLoaded ? children : null}
			</QueryClientProvider>
		</AppServicesContext.Provider>
	);
}

export function useServices(): Services {
	const ctx = useContext(AppServicesContext);
	if (!ctx) throw new Error('useServices must be used inside AppServicesProvider');
	return ctx;
}
