import React, { createContext, useRef } from 'react';
import { type Machines, startYantrixCore } from '~/yantrix/coreLoop';
import { useAppQueryClient, useServices } from '~/providers/AppServicesProvider';

export const MachinesContext = createContext<Machines | null>(null);

export function MachinesProvider({ children }: { children: React.ReactNode }) {
	const services = useServices();
	const queryClient = useAppQueryClient();

	const machinesRef = useRef<Machines | null>(null);
	if (!machinesRef.current) {
		machinesRef.current = startYantrixCore({ services, queryClient });
		console.log('Machines started', machinesRef.current);
	}

	return <MachinesContext.Provider value={machinesRef.current}>{children}</MachinesContext.Provider>;
}