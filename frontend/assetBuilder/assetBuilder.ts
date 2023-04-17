import { baseAssetNamesTypes, baseAssetSizeType, baseAssetType } from './assetBuilderTypes';

const assetsDictionary: {
	[T in baseAssetNamesTypes]: Partial<Record<baseAssetSizeType<T>, Partial<Record<baseAssetType<T>, string>>>>;
} = {
	[baseAssetNamesTypes.ACTIONS]: {
		SMALL: {},
		MEDIUM: {},
		LARGE: {},
	},
	[baseAssetNamesTypes.CLASSES]: {
		SMALL: {},
		LARGE: {},
	},
	[baseAssetNamesTypes.CROPS]: {
		SMALL: {},
		MEDIUM: {},
		LARGE: {},
	},
};

function importAll<K extends baseAssetNamesTypes>(
	f: ReturnType<typeof require.context>,
	dict: Partial<Record<baseAssetType<K>, string>>
) {
	f.keys().forEach((key) => {
		console.log(f.keys());
		const fullPathToAsset = f(key);
		const assetName = key.replace('./', '').replace('.png', '').toUpperCase() as baseAssetType<K>;
		dict[assetName] = fullPathToAsset;
	});
}

importAll<baseAssetNamesTypes.CLASSES>(
	require.context(`~/assets/classes?width=${UIClassSize.SMALL}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CLASSES]['SMALL'] = {})
);
importAll<baseAssetNamesTypes.CLASSES>(
	require.context(`~/assets/classes?width=${UIClassSize.LARGE}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CLASSES]['LARGE'] = {})
);

importAll<baseAssetNamesTypes.ACTIONS>(
	require.context(`~/assets/actions?width=${UICardSize.SMALL}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['SMALL'] = {})
);
importAll<baseAssetNamesTypes.ACTIONS>(
	require.context(`~/assets/actions?width=${UICardSize.MEDIUM}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['MEDIUM'] = {})
);
importAll<baseAssetNamesTypes.ACTIONS>(
	require.context(`~/assets/actions?width=${UICardSize.LARGE}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['LARGE'] = {})
);

importAll<baseAssetNamesTypes.CROPS>(
	require.context(`~/assets/crops?width=${UICardSize.SMALL}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['SMALL'] = {})
);
importAll<baseAssetNamesTypes.CROPS>(
	require.context(`~/assets/crops?width=${UICardSize.MEDIUM}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['MEDIUM'] = {})
);
importAll<baseAssetNamesTypes.CROPS>(
	require.context(`~/assets/crops?width=${UICardSize.LARGE}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['LARGE'] = {})
);

export default assetsDictionary;
