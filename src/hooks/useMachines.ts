import { useContext } from 'react';
import type { Machines } from '~/yantrix/coreLoop';
import { MachinesContext } from '~/providers/MachinesContext';

export function useMachines(): Machines {
	const ctx = useContext(MachinesContext);
	if (!ctx) throw new Error('useMachines must be used within MachinesProvider');
	return ctx;
}

