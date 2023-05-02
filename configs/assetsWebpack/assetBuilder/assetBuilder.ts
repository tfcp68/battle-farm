import { ExtKeysT, extTypes, TAssetNamesDict, TAssetsDictionary, TBaseAsset } from './assetBuilderTypes';
import { UICardSize, UIClassSize } from '../../../frontend/assetBuilder/assetSIzes';
import * as fs from 'fs';
import * as path from 'path';
import { ROOT_DIR } from '../../paths';

export const assetsDictionary: TAssetsDictionary = {
	[TAssetNamesDict.CLASSES]: {},
	[TAssetNamesDict.ACTIONS]: {},
	[TAssetNamesDict.CROPS]: {},
};

export function importAll<K extends TAssetNamesDict>(
	f: ReturnType<typeof require.context>,
	dict: Partial<Record<TBaseAsset<K>, string>>
) {
	f.keys().forEach((key) => {
		const fullPathToAsset = f(key);
		const assetName = path.basename(key, '.png').toUpperCase() as TBaseAsset<K>;
		dict[assetName] = fullPathToAsset;
	});
}

Object.keys(UIClassSize).forEach((size) => {
	assetsDictionary[TAssetNamesDict.CLASSES][size as keyof typeof UIClassSize] = {};
	Object.keys(extTypes).forEach((ext) => {
		assetsDictionary[TAssetNamesDict.CLASSES][size as keyof typeof UIClassSize]![ext as ExtKeysT] = {};
	});
});
Object.keys(UICardSize).forEach((size) => {
	assetsDictionary[TAssetNamesDict.ACTIONS][size as keyof typeof UICardSize] = {};
	assetsDictionary[TAssetNamesDict.CROPS][size as keyof typeof UICardSize] = {};
	Object.keys(extTypes).forEach((ext) => {
		assetsDictionary[TAssetNamesDict.ACTIONS][size as keyof typeof UICardSize]![ext as ExtKeysT] = {};
		assetsDictionary[TAssetNamesDict.CROPS][size as keyof typeof UICardSize]![ext as ExtKeysT] = {};
	});
});

importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${webpSMALLClasses}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CLASSES]['SMALL']!['WEBP'] = {})
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${webpLARGEClasses}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CLASSES]['LARGE']!['WEBP'] = {})
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${avifSMALLClasses}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CLASSES]['SMALL']!['AVIF'] = {})
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${avifLARGEClasses}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CLASSES]['LARGE']!['AVIF'] = {})
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${jpegLARGEClasses}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CLASSES]['LARGE']!['JPEG'] = {})
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${jpegSMALLClasses}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CLASSES]['SMALL']!['JPEG'] = {})
);

importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpSMALLCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.ACTIONS]['SMALL']!['WEBP'] = {})
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.ACTIONS]['MEDIUM']!['WEBP'] = {})
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpLARGECards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.ACTIONS]['LARGE']!['WEBP'] = {})
);

importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifSMALLCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.ACTIONS]['SMALL']!['AVIF'] = {})
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.ACTIONS]['MEDIUM']!['AVIF'] = {})
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifLARGECards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.ACTIONS]['LARGE']!['AVIF'] = {})
);

importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegSMALLCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.ACTIONS]['SMALL']!['JPEG'] = {})
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.ACTIONS]['MEDIUM']!['JPEG'] = {})
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegLARGECards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.ACTIONS]['LARGE']!['JPEG'] = {})
);

importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpSMALLCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CROPS]['SMALL']!['WEBP'] = {})
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CROPS]['MEDIUM']!['WEBP'] = {})
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpLARGECards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CROPS]['LARGE']!['WEBP'] = {})
);

importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifSMALLCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CROPS]['SMALL']!['AVIF'] = {})
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CROPS]['MEDIUM']!['AVIF'] = {})
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifLARGECards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CROPS]['LARGE']!['AVIF'] = {})
);

importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegSMALLCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CROPS]['SMALL']!['JPEG'] = {})
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegMEDIUMCards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CROPS]['MEDIUM']!['JPEG'] = {})
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegLARGECards}`, true, /\.png$/),
	(assetsDictionary[TAssetNamesDict.CROPS]['LARGE']!['JPEG'] = {})
);

fs.writeFileSync(path.resolve(ROOT_DIR, 'preBuild/assetDictionary.json'), JSON.stringify(assetsDictionary, null, 4));
