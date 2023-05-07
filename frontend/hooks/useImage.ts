import { useEffect, useState } from 'react';
import { TCardType } from '~/src/types/serializables/cards';

const useImage = (fileName: string, typeCard: TCardType) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [image, setImage] = useState('');

	useEffect(() => {
		const fetchImage = async () => {
			try {
				const response = await import(
					`~/assets/${
						typeCard === TCardType.ACTION
							? 'actions'
							: typeCard === TCardType.CROP
							? 'crops'
							: typeCard === TCardType.CLASS_HERO
							? 'classes'
							: ''
					}/${fileName.toLowerCase()}.png`
				);
				setImage(response.default);
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
