import { useEffect, useState } from 'react';
import { ExtKeysT, TAssetNamesDict, TBaseSizeKeys } from '~/src/types/build/assetBuilderTypes';
import { TActionId } from '~/src/types/serializables/actions';
import { getAssetPath } from '../utils/assetDictionary';

import { isUICardSizeKeys, isUIClassSizeKeys } from '~/frontend/constants/assetSizes';
import { isActionCardId, isCropCardId } from '~/src/types/guards/cards';
import { isPlayerClassKey } from '~/src/types/guards/player';
import { TCropId } from '~/src/types/serializables/crops';
import { TPlayerClassKeys } from '~/src/types/serializables/players';
import { getExt } from '../utils/imageBrowserCheck';
import packageJson from '../../package.json';

let ext: ExtKeysT;
let path: string;
const version = packageJson.version;
export const useAsset = <T extends TActionId | TCropId | TPlayerClassKeys>(assetKey: T, size: TBaseSizeKeys<T>) => {
	const [assetPath, setAssetPath] = useState('');
	useEffect(() => {
		ext = getExt();
		if (isUICardSizeKeys(size)) {
			if (isCropCardId(assetKey)) path = getAssetPath(TAssetNamesDict.CROPS, assetKey, size, ext);
			if (isActionCardId(assetKey)) path = getAssetPath(TAssetNamesDict.ACTIONS, assetKey, size, ext);
		}
		if (isUIClassSizeKeys(size) && isPlayerClassKey(assetKey))
			path = getAssetPath(TAssetNamesDict.CLASSES, assetKey, size, ext);
		setAssetPath(path.concat('?version=', version));
	}, [size, assetKey]);
	return [assetPath];
};
