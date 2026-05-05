import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Machines, startYantrixCore } from '~/app/yantrix/coreLoop';
import { useServices } from '~/app/providers/AppServicesProvider';
import { registerNavigate, unregisterNavigate } from '~/app/yantrix/navigationRef';

const MachinesContext = createContext<Machines | null>(null);

export function MachinesProvider({ children }: { children: React.ReactNode }) {
	const services = useServices();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const machinesRef = useRef<Machines | null>(null);

	// 1. Register navigate first so it is ready before the core loop starts.
	useEffect(() => {
		registerNavigate(navigate);
		return () => unregisterNavigate();
	}, [navigate]);

	if (!machinesRef.current) {
		machinesRef.current = startYantrixCore({ services, queryClient });
	}

	return (
		<MachinesContext.Provider value={machinesRef.current}>
			{children}
		</MachinesContext.Provider>
	);
}

export function useMachines(): Machines {
	const ctx = useContext(MachinesContext);
	if (!ctx) throw new Error('useMachines must be used inside MachinesProvider');
	return ctx;
}



