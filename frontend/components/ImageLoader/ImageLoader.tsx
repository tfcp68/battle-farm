import React, { useEffect, useState } from 'react';
import { Loader } from '../Loader/Loader';

interface ImageLoader {
	src: string;
	alt: string;
	classWrapper?: string;
}

export const ImageLoader: React.FC<ImageLoader> = ({ alt, src, classWrapper }) => {
	const [error, setError] = useState<string | Event>('');
	const [isLoading, setLoading] = useState(true);
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
	if (error)
		return (
			<div className={classWrapper}>
				<img
					alt=""
					src="data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic3ZnLWljb24iIHN0eWxlPSJ3aWR0aDogMWVtOyBoZWlnaHQ6IDFlbTt2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO2ZpbGw6IGN1cnJlbnRDb2xvcjtvdmVyZmxvdzogaGlkZGVuOyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik05NTcuMzM3NiA4ODMuMDk3NiA1ODYuMjQgNTEybDM3MS4wOTc2LTM3MS4wOTc2YzIwLjE3MjgtMjAuMTcyOCAyMC40OC01My43NiAwLTc0LjI0LTIwLjY4NDgtMjAuNjg0OC01My43Ni0yMC40OC03NC4yNCAwTDUxMiA0MzcuNzYgMTQwLjkwMjQgNjYuNjYyNGMtMjAuMTcyOC0yMC4xNzI4LTUzLjc2LTIwLjQ4LTc0LjI0IDAtMjAuNTgyNCAyMC42ODQ4LTIwLjQ4IDUzLjc2IDAgNzQuMjRMNDM3Ljc2IDUxMiA2Ni42NjI0IDg4My4wOTc2Yy0yMC4xNzI4IDIwLjE3MjgtMjAuNDggNTMuNzYgMCA3NC4yNCAyMC42ODQ4IDIwLjY4NDggNTMuNzYgMjAuNDggNzQuMjQgMEw1MTIgNTg2LjI0bDM3MS4wOTc2IDM3MS4wOTc2YzIwLjE3MjggMjAuMTcyOCA1My43NiAyMC40OCA3NC4yNCAwQzk3OC4wMjI0IDkzNi43NTUyIDk3Ny44MTc2IDkwMy42OCA5NTcuMzM3NiA4ODMuMDk3NnoiICAvPjwvc3ZnPg=="
				/>
			</div>
		);
	if (isLoading) return <Loader classWraper={classWrapper} />;
	return (
		<div className={classWrapper}>
			<img src={src} alt={alt} />
		</div>
	);
};
