
type NavigateOptions = { replace?: boolean; state?: unknown };
type NavigateFn = (path: string, opts?: NavigateOptions) => void;

let navigateFn: NavigateFn | null = null;

export function registerNavigate(fn: NavigateFn) {
	navigateFn = fn;
}

export function navigateTo(path: string, opts?: NavigateOptions) {
	if (navigateFn) {
		navigateFn(path, opts);
	} else {
		console.warn(`[navigationRef] navigateTo called before navigate was registered (path=${path})`);
	}
}

