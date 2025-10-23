import React from 'react';
import { setRuntimeConfig, YantrixRuntimeConfig } from './runtime-config';

type Props = {
	config?: YantrixRuntimeConfig;
	children: React.ReactNode;
};

export function YantrixProvider({ config, children }: Props) {
	React.useEffect(() => {
		if (config) setRuntimeConfig(config);
	}, [config]);

	return <>{children}</>;
}