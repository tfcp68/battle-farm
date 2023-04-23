import { baseAssetNamesTypes, baseAssetSizeType, baseAssetType } from './assetBuilderTypes';

const assetsDictionary: {
	[T in baseAssetNamesTypes]: Record<
		baseAssetSizeType<T>,
		Record<'webp' | 'avif' | 'jpeg', Partial<Record<baseAssetType<T>, string>>>
	>;
} = {
	[baseAssetNamesTypes.ACTIONS]: {
		SMALL: {
			jpeg: {},
			webp: {},
			avif: {},
		},
		MEDIUM: {
			jpeg: {},
			webp: {},
			avif: {},
		},
		LARGE: {
			jpeg: {},
			webp: {},
			avif: {},
		},
	},
	[baseAssetNamesTypes.CLASSES]: {
		SMALL: {
			jpeg: {},
			webp: {},
			avif: {},
		},
		LARGE: {
			jpeg: {},
			webp: {},
			avif: {},
		},
	},
	[baseAssetNamesTypes.CROPS]: {
		SMALL: {
			jpeg: {},
			webp: {},
			avif: {},
		},
		MEDIUM: {
			jpeg: {},
			webp: {},
			avif: {},
		},
		LARGE: {
			jpeg: {},
			webp: {},
			avif: {},
		},
	},
};

function importAll<K extends baseAssetNamesTypes>(
	f: ReturnType<typeof require.context>,
	dict: Partial<Record<baseAssetType<K>, string>>
) {
	f.keys().forEach((key) => {
		const fullPathToAsset = f(key);
		const assetName = key.replace('./', '').replace('.png', '').toUpperCase() as baseAssetType<K>;
		dict[assetName] = fullPathToAsset;
	});
}


importAll<baseAssetNamesTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${webpSMALLClasses}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CLASSES]['SMALL']['webp'] = {})
);
importAll<baseAssetNamesTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${webpLARGEClasses}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CLASSES]['SMALL']['webp'] = {})
);
importAll<baseAssetNamesTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${avifSMALLClasses}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CLASSES]['SMALL']['avif'] = {})
);
importAll<baseAssetNamesTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${avifLARGEClasses}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CLASSES]['LARGE']['avif'] = {})
);
importAll<baseAssetNamesTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${jpegLARGEClasses}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CLASSES]['LARGE']['jpeg'] = {})
);
importAll<baseAssetNamesTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${jpegSMALLClasses}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CLASSES]['SMALL']['jpeg'] = {})
);

importAll<baseAssetNamesTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpSMALLCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['SMALL']['webp'] = {})
);
importAll<baseAssetNamesTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['MEDIUM']['webp'] = {})
);
importAll<baseAssetNamesTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpLARGECards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['LARGE']['webp'] = {})
);

importAll<baseAssetNamesTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifSMALLCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['SMALL']['avif'] = {})
);
importAll<baseAssetNamesTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['MEDIUM']['avif'] = {})
);
importAll<baseAssetNamesTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifLARGECards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['LARGE']['avif'] = {})
);

importAll<baseAssetNamesTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegSMALLCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['SMALL']['jpeg'] = {})
);
importAll<baseAssetNamesTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['MEDIUM']['jpeg'] = {})
);
importAll<baseAssetNamesTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegLARGECards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.ACTIONS]['LARGE']['jpeg'] = {})
);


importAll<baseAssetNamesTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpSMALLCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['SMALL']['webp'] = {})
);
importAll<baseAssetNamesTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['MEDIUM']['webp'] = {})
);
importAll<baseAssetNamesTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpLARGECards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['LARGE']['webp'] = {})
);

importAll<baseAssetNamesTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifSMALLCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['SMALL']['avif'] = {})
);
importAll<baseAssetNamesTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['MEDIUM']['avif'] = {})
);
importAll<baseAssetNamesTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifLARGECards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['LARGE']['avif'] = {})
);

importAll<baseAssetNamesTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegSMALLCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['SMALL']['jpeg'] = {})
);
importAll<baseAssetNamesTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['MEDIUM']['jpeg'] = {})
);
importAll<baseAssetNamesTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegLARGECards}`, true, /\.png$/),
	(assetsDictionary[baseAssetNamesTypes.CROPS]['LARGE']['jpeg'] = {})
);


export default assetsDictionary;
