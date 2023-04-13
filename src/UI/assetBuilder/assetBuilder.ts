import { baseAssetNamesTypes, TBaseAssetType } from './assetBuilderTypes';

const assetsDictionary: {
	[T in baseAssetNamesTypes]: Partial<Record<TBaseAssetType<T>, string>>;
} = {
	[baseAssetNamesTypes.ACTIONS]: {},
	[baseAssetNamesTypes.CLASSES]: {},
	[baseAssetNamesTypes.CROPS]: {},
};

async function importAll<K extends baseAssetNamesTypes>(
	f: ReturnType<typeof require.context>,
	dict: Partial<Record<TBaseAssetType<K>, string>>
) {
	f.keys().forEach((key) => {
		const fullPathToAsset = f(key);
		const assetName = key.replace('./', '').replace('.png', '').toUpperCase() as TBaseAssetType<K>;
		dict[assetName] = fullPathToAsset;
	});
}

importAll<baseAssetNamesTypes.ACTIONS>(
	require.context(`~/assets/actions?width=300`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS] = {})
);

importAll<baseAssetNamesTypes.CROPS>(
	require.context(`~/assets/crops?width=100`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS] = {})
);
importAll<baseAssetNamesTypes.CLASSES>(
	require.context(`~/assets/classes?width=100`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CLASSES] = {})
);

export default assetsDictionary;
