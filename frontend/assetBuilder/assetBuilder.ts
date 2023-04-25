import { assetNamesDictTypes, baseAssetSizeType, baseAssetType, extTypes, extTypesKey } from './assetBuilderTypes';
import { UICardSize, UIClassSize } from './assetSIzes';

const assetsDictionary: {
	[T in assetNamesDictTypes]: Partial<
		Record<baseAssetSizeType<T>, Partial<Record<extTypesKey, Partial<Record<baseAssetType<T>, string>>>>>
	>;
} = {
	[assetNamesDictTypes.CLASSES]: {},
	[assetNamesDictTypes.ACTIONS]: {},
	[assetNamesDictTypes.CROPS]: {},
};

export function importAll<K extends assetNamesDictTypes>(
	f: ReturnType<typeof require.context>,
	dict: Partial<Record<baseAssetType<K>, string>>
) {
	f.keys().forEach((key) => {
		const fullPathToAsset = f(key);
		const assetName = key.replace('./', '').replace('.png', '').toUpperCase() as baseAssetType<K>;
		dict[assetName] = fullPathToAsset;
	});
}

Object.keys(UIClassSize).forEach((size) => {
	assetsDictionary[assetNamesDictTypes.CLASSES]![size as keyof typeof UIClassSize] = {};
	Object.keys(extTypes).forEach((ext) => {
		assetsDictionary[assetNamesDictTypes.CLASSES]![size as keyof typeof UIClassSize]![ext as extTypesKey] = {};
	});
});
Object.keys(UICardSize).forEach((size) => {
	assetsDictionary[assetNamesDictTypes.ACTIONS][size as keyof typeof UICardSize] = {};
	assetsDictionary[assetNamesDictTypes.CROPS][size as keyof typeof UICardSize] = {};
	Object.values(extTypes).forEach((ext) => {
		assetsDictionary[assetNamesDictTypes.ACTIONS][size as keyof typeof UICardSize]![ext as extTypesKey] = {};
		assetsDictionary[assetNamesDictTypes.CROPS][size as keyof typeof UICardSize]![ext as extTypesKey] = {};
	});
});

importAll<assetNamesDictTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${webpSMALLClasses}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CLASSES]['SMALL']!['WEBP'] = {})
);
importAll<assetNamesDictTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${webpLARGEClasses}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CLASSES]['LARGE']!['WEBP'] = {})
);
importAll<assetNamesDictTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${avifSMALLClasses}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CLASSES]['SMALL']!['AVIF'] = {})
);
importAll<assetNamesDictTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${avifLARGEClasses}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CLASSES]['LARGE']!['AVIF'] = {})
);
importAll<assetNamesDictTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${jpegLARGEClasses}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CLASSES]['LARGE']!['JPEG'] = {})
);
importAll<assetNamesDictTypes.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${jpegSMALLClasses}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CLASSES]['SMALL']!['JPEG'] = {})
);

importAll<assetNamesDictTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpSMALLCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.ACTIONS]['SMALL']!['WEBP'] = {})
);
importAll<assetNamesDictTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.ACTIONS]['MEDIUM']!['WEBP'] = {})
);
importAll<assetNamesDictTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpLARGECards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.ACTIONS]['LARGE']!['WEBP'] = {})
);

importAll<assetNamesDictTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifSMALLCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.ACTIONS]['SMALL']!['AVIF'] = {})
);
importAll<assetNamesDictTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.ACTIONS]['MEDIUM']!['AVIF'] = {})
);
importAll<assetNamesDictTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifLARGECards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.ACTIONS]['LARGE']!['AVIF'] = {})
);

importAll<assetNamesDictTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegSMALLCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.ACTIONS]['SMALL']!['JPEG'] = {})
);
importAll<assetNamesDictTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.ACTIONS]['MEDIUM']!['JPEG'] = {})
);
importAll<assetNamesDictTypes.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegLARGECards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.ACTIONS]['LARGE']!['JPEG'] = {})
);

importAll<assetNamesDictTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpSMALLCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CROPS]['SMALL']!['WEBP'] = {})
);
importAll<assetNamesDictTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CROPS]['MEDIUM']!['WEBP'] = {})
);
importAll<assetNamesDictTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpLARGECards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CROPS]['LARGE']!['WEBP'] = {})
);

importAll<assetNamesDictTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifSMALLCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CROPS]['SMALL']!['AVIF'] = {})
);
importAll<assetNamesDictTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CROPS]['MEDIUM']!['AVIF'] = {})
);
importAll<assetNamesDictTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifLARGECards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CROPS]['LARGE']!['AVIF'] = {})
);

importAll<assetNamesDictTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegSMALLCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CROPS]['SMALL']!['JPEG'] = {})
);
importAll<assetNamesDictTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CROPS]['MEDIUM']!['JPEG'] = {})
);
importAll<assetNamesDictTypes.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegLARGECards}`, true, /\.png$/),
	(assetsDictionary[assetNamesDictTypes.CROPS]['LARGE']!['JPEG'] = {})
);

export default assetsDictionary;
