import {
	ExtKeysT,
	extTypes,
	TAssetNamesDict,
	TAssetsDictionary,
	TBaseAsset,
	TBaseAssetSize,
} from '../../../src/types/build/assetBuilderTypes';
import * as path from 'path';
import { TPlayerClass, TPlayerClassKeys } from '../../../src/types/serializables/players';
import { ActionCardId, TActionId } from '../../../src/types/serializables/actions';
import { CropCardId, TCropId } from '../../..//src/types/serializables/crops';
import { UICardSize, UIClassSize } from '../../../frontend/constants/assetSIzes';
import * as fs from 'fs';
import { ROOT_DIR } from '../../paths';

export const assetsDictionary: TAssetsDictionary = {
	[TAssetNamesDict.CLASSES]: {},
	[TAssetNamesDict.CROPS]: {},
	[TAssetNamesDict.ACTIONS]: {},
};
Object.keys(TPlayerClass).forEach((c) => {
	if (isNaN(Number(c))) {
		const classKey = c as TPlayerClassKeys;
		assetsDictionary[TAssetNamesDict.CLASSES][classKey] = {};
		Object.keys(UIClassSize).forEach((size) => {
			const sizeKey = size as keyof typeof UIClassSize;
			assetsDictionary[TAssetNamesDict.CLASSES][classKey]![sizeKey] = {};
			Object.keys(extTypes).forEach((ext) => {
				assetsDictionary[TAssetNamesDict.CLASSES][classKey]![sizeKey]![ext as ExtKeysT] = '';
			});
		});
	}
});
Object.keys(ActionCardId).forEach((c) => {
	if (isNaN(Number(c))) {
		const cardKey = c as TActionId;
		assetsDictionary[TAssetNamesDict.ACTIONS][cardKey] = {};
		Object.keys(UICardSize).forEach((size) => {
			const sizeKey = size as keyof typeof UICardSize;
			assetsDictionary[TAssetNamesDict.ACTIONS][cardKey]![sizeKey] = {};
			Object.keys(extTypes).forEach((ext) => {
				assetsDictionary[TAssetNamesDict.ACTIONS][cardKey]![sizeKey]![ext as ExtKeysT] = '';
			});
		});
	}
});
Object.keys(CropCardId).forEach((c) => {
	if (isNaN(Number(c))) {
		const cardKey = c as TCropId;
		assetsDictionary[TAssetNamesDict.CROPS][cardKey] = {};
		Object.keys(UICardSize).forEach((size) => {
			const sizeKey = size as keyof typeof UICardSize;
			assetsDictionary[TAssetNamesDict.CROPS][cardKey]![sizeKey] = {};
			Object.keys(extTypes).forEach((ext) => {
				assetsDictionary[TAssetNamesDict.CROPS][cardKey]![sizeKey]![ext as ExtKeysT] = '';
			});
		});
	}
});

export function importAll<K extends TAssetNamesDict>(
	f: ReturnType<typeof require.context>,
	dict: Partial<Record<TBaseAsset<K>, Partial<Record<TBaseAssetSize<K>, Partial<Record<ExtKeysT, string>>>>>>
) {
	f.keys().forEach((key) => {
		const parsedPath = path.parse(f(key));
		const pathArray = parsedPath.dir.split(path.posix.sep);
		const fullPathToAsset = f(key);
		const assetName = path.basename(key, '.png').toUpperCase() as TBaseAsset<K>;
		dict[assetName]![pathArray[2] as TBaseAssetSize<K>]![pathArray[3].toUpperCase() as ExtKeysT] = fullPathToAsset;
	});
}

importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${webpSMALLClasses}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CLASSES]
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${webpLARGEClasses}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CLASSES]
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${webpLARGEClasses}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CLASSES]
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${avifSMALLClasses}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CLASSES]
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${avifLARGEClasses}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CLASSES]
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${jpegLARGEClasses}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CLASSES]
);
importAll<TAssetNamesDict.CLASSES>(
	// @ts-ignore
	require.context(`~/assets/classes?as=${jpegSMALLClasses}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CLASSES]
);

importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpSMALLCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.ACTIONS]
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpMEDIUMCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.ACTIONS]
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${webpLARGECards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.ACTIONS]
);

importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifSMALLCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.ACTIONS]
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifMEDIUMCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.ACTIONS]
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${avifLARGECards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.ACTIONS]
);

importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegSMALLCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.ACTIONS]
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegMEDIUMCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.ACTIONS]
);
importAll<TAssetNamesDict.ACTIONS>(
	// @ts-ignore
	require.context(`~/assets/actions?as=${jpegLARGECards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.ACTIONS]
);

importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpSMALLCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CROPS]
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpMEDIUMCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CROPS]
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${webpLARGECards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CROPS]
);

importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifSMALLCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CROPS]
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifMEDIUMCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CROPS]
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${avifLARGECards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CROPS]
);

importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegSMALLCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CROPS]
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegMEDIUMCards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CROPS]
);
importAll<TAssetNamesDict.CROPS>(
	// @ts-ignore
	require.context(`~/assets/crops?as=${jpegLARGECards}`, true, /\.png$/),
	assetsDictionary[TAssetNamesDict.CROPS]
);

fs.writeFileSync(
	path.resolve(ROOT_DIR, '../frontend/hooks/assetsDictionary.json'),
	JSON.stringify(assetsDictionary, null, 4)
);
