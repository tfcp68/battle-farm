import { useEffect, useState } from 'react';
import { TAssetNamesDict, TBaseSizeKeys } from '~/src/types/build/assetBuilderTypes';
import { TActionId } from '~/src/types/serializables/actions';
import { getAssetPath } from '../utils/assetDictionary';

import { isUICardSizeKeys, isUIClassSizeKeys } from '~/frontend/constants/assetSIzes';
import { isActionCardId, isCropCardId } from '~/src/types/guards/cards';
import { isPlayerClassKey } from '~/src/types/guards/player';
import { TCropId } from '~/src/types/serializables/crops';
import { TPlayerClassKeys } from '~/src/types/serializables/players';
import { getExt } from '../utils/imageBrowserCheck';

export const useAsset = <T extends TActionId | TCropId | TPlayerClassKeys>(assetKey: T, size: TBaseSizeKeys<T>) => {
	const [path, setPath] = useState('');
	let ext: 'AVIF' | 'WEBP' | 'JPEG';

	useEffect(() => {
		ext = getExt();
		if (isUICardSizeKeys(size)) {
			if (isCropCardId(assetKey)) setPath(getAssetPath(TAssetNamesDict.CROPS, assetKey, size, ext));
			if (isActionCardId(assetKey)) setPath(getAssetPath(TAssetNamesDict.ACTIONS, assetKey, size, ext));
		}
		if (isUIClassSizeKeys(size) && isPlayerClassKey(assetKey))
			setPath(getAssetPath(TAssetNamesDict.CLASSES, assetKey, size, ext));
	}, [size, assetKey]);
	return [path];
};
