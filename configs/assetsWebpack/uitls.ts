export const getPresetName = (ext: string, size: string, assetName: string) => {
	return [ext, size, assetName].join('');
};
