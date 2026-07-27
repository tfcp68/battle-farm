import { statesDictionary } from '~/shared/lib/fsm/window/WindowModeAutomata';
import type { TWindowModeContext } from '~/shared/types/types';

type ModeSnapshot = { state: number | null; context: TWindowModeContext } | null | undefined;

export function selectHasProfile(modeState: number | null | undefined): boolean {
	if (!modeState) return false;
	return modeState !== statesDictionary.NO_PROFILE;
}

/** True while a room is being opened or entered — the UI shows a spinner. */
export function selectIsConnecting(modeState: number | null | undefined): boolean {
	return modeState === statesDictionary.CONNECTING;
}

/**
 * The last connection error, readable once the FSM is back in `MAIN_MENU`.
 * `authError` is the context slot the mode machine carries it in.
 */
export function selectConnectError(modeCtx: ModeSnapshot): string | null {
	const err = modeCtx?.context?.authError;
	if (!err || typeof err !== 'string') return null;
	return err;
}
