/**
 * Allows non-React code (e.g. domain command destination) to trigger navigation.
 * Register the navigate function from within a React component tree via `registerNavigate`.
 */

type NavigateOptions = { replace?: boolean; state?: unknown };
type NavigateFn = (path: string, opts?: NavigateOptions) => void;

let navigateFn: NavigateFn | null = null;

export function registerNavigate(fn: NavigateFn) {
	navigateFn = fn;
}

export function unregisterNavigate() {
	navigateFn = null;
}

export function navigateTo(path: string, opts?: NavigateOptions) {
	if (navigateFn) {
		navigateFn(path, opts);
	} else {
		console.warn(`[navigationRef] navigateTo called before navigate was registered (path=${path})`);
	}
}

