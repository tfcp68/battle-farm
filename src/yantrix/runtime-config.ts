export type YantrixRuntimeConfig = {
	playerId?: string;
	// можно добавлять любые поля
	[k: string]: unknown;
};

let runtimeConfig: YantrixRuntimeConfig = {};

// мерджим, чтобы можно было обновлять точечно
export function setRuntimeConfig(next: YantrixRuntimeConfig) {
	runtimeConfig = { ...runtimeConfig, ...next };
}

export function getRuntimeConfig(): YantrixRuntimeConfig {
	return runtimeConfig;
}