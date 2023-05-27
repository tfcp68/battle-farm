import React, { useEffect, useState } from 'react';
import { TPlayerClassKeys } from '~/src/types/serializables/players';
import { TActionId } from '~/src/types/serializables/actions';
import useImage from '~/frontend/hooks/useImage';
import { TBaseSizeKeys } from '~/src/types/build/assetBuilderTypes';
import { TCropId } from '~/src/types/serializables/crops';

interface LazyAsset<T extends TCropId | TPlayerClassKeys | TActionId> {
	id: T;
	size: TBaseSizeKeys<T>;
	alt?: string;
	assetClass?: string;
}

export const LazyAsset = <T extends TCropId | TPlayerClassKeys | TActionId>({
	alt,
	id,
	size,
	assetClass,
}: LazyAsset<T>) => {
	const { image } = useImage(id, size);
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState<string | Event>('');
	useEffect(() => {
		setLoading(true);
		const img = new Image();
		img.onload = () => {
			setLoading(false);
		};
		img.onerror = (e) => {
			setError(e);
		};
		img.src = image;
	}, [id, image]);
	return <>{isLoading ? <div>Loading...</div> : <img className={assetClass} src={image} alt={alt} />}</>;
};
