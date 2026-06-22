import { statesDictionary } from '~/shared/lib/fsm/window/WindowModeAutomata';
import type { TWindowModeContext } from '~/shared/types/types';

type ModeSnapshot = { state: number | null; context: TWindowModeContext } | null | undefined;

const AUTH_STATES = new Set([
	statesDictionary.UNAUTHENTICATED,
	statesDictionary.AUTHENTICATING,
	statesDictionary.AUTH_FAILED,
]);

export function selectIsAuthenticated(modeState: number | null | undefined): boolean {
	if (!modeState) return false;
	return !AUTH_STATES.has(modeState);
}

export function selectAuthPending(modeState: number | null | undefined): boolean {
	return modeState === statesDictionary.AUTHENTICATING;
}

export function selectAuthError(modeCtx: ModeSnapshot): string | null {
	if (modeCtx?.state !== statesDictionary.AUTH_FAILED) return null;
	const err = modeCtx?.context?.authError;
	if (!err) return null;
	return typeof err === 'string' ? err : null;
}
