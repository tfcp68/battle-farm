import { useEffect, useState } from 'react';
import { TAssetNamesDict, TBaseSizeKeys } from '~/src/types/build/assetBuilderTypes';
import { TActionId } from '~/src/types/serializables/actions';
import { getAssetPath } from '../utils/assetDictionary';

import { getExt } from '../utils/imageBrowserCheck';
import { isActionCardId, isCropCardId } from '~/src/types/guards/cards';
import { isPlayerClassKey } from '~/src/types/guards/player';
import { TCropId } from '~/src/types/serializables/crops';
import { TPlayerClassKeys } from '~/src/types/serializables/players';
import { isUIClassSizeKeys } from '~/frontend/constants/assetSIzes';

export const useImage = <T extends TActionId | TCropId | TPlayerClassKeys>(fileName: T, size: TBaseSizeKeys<T>) => {
	const [image, setImage] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let imgPath = '';
		const ext = getExt();
		if (isCropCardId(fileName)) imgPath = getAssetPath(TAssetNamesDict.CROPS, fileName, size, ext);
		if (isActionCardId(fileName)) imgPath = getAssetPath(TAssetNamesDict.ACTIONS, fileName, size, ext);
		if (isPlayerClassKey(fileName) && isUIClassSizeKeys(size)) {
			imgPath = getAssetPath(TAssetNamesDict.CLASSES, fileName, size, ext);
		}
		const fetchImage = async () => {
			try {
				const response = await import(
					/* webpackMode: "lazy-once" */
					// 1 async chunk for all  assets
					`~/assets/thumbs/${imgPath}?version=3`
				);

				setImage(response.default + '?version=3');
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchImage();
	}, [fileName]);
	return {
		loading,
		error,
		image,
	};
};

export default useImage;
