import React, { createContext, useContext, useRef } from 'react';
import { startYantrixCore } from '~/yantrix/coreLoop';

const MachinesContext = createContext<ReturnType<typeof startYantrixCore> | null>(null);

export function MachinesProvider({ children }: { children: React.ReactNode }) {
	const machinesRef = useRef<ReturnType<typeof startYantrixCore> | null>(null);
	if (!machinesRef.current) {
		machinesRef.current = startYantrixCore();
	}

	return <MachinesContext.Provider value={machinesRef.current}>{children}</MachinesContext.Provider>;
}

export function useMachines(): NonNullable<ReturnType<typeof startYantrixCore>> {
	const ctx = useContext(MachinesContext);
	if (!ctx) throw new Error('useMachines must be used within MachinesProvider');
	return ctx;
}