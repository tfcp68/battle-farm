import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { startYantrixCore, Machines } from '~/app/yantrix/coreLoop';
import { useServices } from '~/app/providers/AppServicesProvider';
import { registerNavigate } from '~/app/yantrix/navigationRef';

const MachinesContext = createContext<Machines | null>(null);

export function MachinesProvider({ children }: { children: React.ReactNode }) {
	const services = useServices();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const machinesRef = useRef<Machines | null>(null);

	useEffect(() => {
		registerNavigate(navigate);
	}, [navigate]);

	useEffect(() => {
		if (!machinesRef.current) {
			machinesRef.current = startYantrixCore({ services, queryClient });
		}
	}, [services, queryClient]);

	const machines = machinesRef.current ?? startYantrixCore({ services, queryClient });

	return (
		<MachinesContext.Provider value={machines}>
			{children}
		</MachinesContext.Provider>
	);
}

export function useMachines(): Machines {
	const ctx = useContext(MachinesContext);
	if (!ctx) throw new Error('useMachines must be used inside MachinesProvider');
	return ctx;
}



