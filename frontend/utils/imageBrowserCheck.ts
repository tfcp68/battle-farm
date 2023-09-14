const storageKey = 'supportedImageFormat'

export const canUseAviF: () => Promise<boolean> = () => {
	debugger
	return new Promise((resolve, reject) => {
		const AVIF = new Image();
		AVIF.onload = () => {
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
	let webpSupport = false;
	if (elem.getContext && elem.getContext('2d')) {
		// was able or not to get WebP representation
		webpSupport = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
		return webpSupport;
		// very old browser like IE 8, canvas not supported
	}
	return webpSupport;
};

export const setSupportedExt = (resArr:  [PromiseSettledResult<boolean>, PromiseSettledResult<boolean>])=>{
	console.log(resArr)
	if (resArr[1]) return localStorage.setItem(storageKey,'AVIF')
	if(resArr[0]) return localStorage.setItem(storageKey, 'WEBP')
	else return localStorage.setItem(storageKey, 'JPEG')
}
export const getExt = () => {
	return localStorage.getItem(storageKey)
};
