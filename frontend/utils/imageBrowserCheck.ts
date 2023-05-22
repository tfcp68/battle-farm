export const getExt = () => {
	return window.avifSupport ? 'AVIF' : window.webpSupport ? 'WEBP' : 'JPEG';
};

export const canUseAviF: () => Promise<boolean> = () => {
	return new Promise((resolve, reject) => {
		if (!window || 'avifSupport' in window) return resolve(window?.avifSupport ?? false);
		//@ts-ignore
		window.avifSupport = false;
		const AVIF = new Image();
		AVIF.onload = () => {
			window.avifSupport = true;
			resolve(true);
		};
		setTimeout(() => {
			if (!AVIF.complete) reject(false);
			else resolve(false);
		}, 100);
		AVIF.onerror = (e) => reject(e);
		AVIF.src =
			'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUEAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAF0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgS0AAAAAABNjb2xybmNseAACAAIAAIAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAGVtZGF0EgAKBzgAPtAgIAkyUBAAAPWc41TP///4gHBX9H8XVK7gGeDllq8TYARA+8Tfsv7L+zPE24eIoIzE0WhHbrqcrTK9VEgEG/hwgB5rdCbvP8g3KYPdV88CvPJnptgQ';
	});
};
export const canUseWebP = () => {
	const elem = document.createElement('canvas');

	if (elem.getContext && elem.getContext('2d')) {
		// was able or not to get WebP representation
		return (window.webpSupport = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0);
	}

	// very old browser like IE 8, canvas not supported
	return (window.webpSupport = false);
};
canUseAviF();
canUseWebP();
