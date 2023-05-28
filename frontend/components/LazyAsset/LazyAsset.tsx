import React, { useEffect, useState } from 'react';
import { Loader } from '../Loader/Loader';

interface ImageLoader {
	src: string;
	alt: string;
	classWrapper?: string;
}

export const ImageLoader: React.FC<ImageLoader> = ({ alt, src, classWrapper }) => {
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState<string | Event>('');
	useEffect(() => {
		const img = new Image();
		img.onload = () => {
			setLoading(false);
		};
		img.onerror = (e) => {
			setError(e);
		};
		img.src = src;
	}, [src]);

	if (isLoading) return <Loader classWraper={classWrapper} />;
	return (
		<div className={classWrapper}>
			<img src={src} alt={alt} />
		</div>
	);
};
