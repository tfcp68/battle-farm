import { statesDictionary } from '~/shared/lib/fsm/window/WindowModeAutomata';
import type { TWindowModeContext } from '~/shared/types/types';

type ModeSnapshot = { state: number | null; context: TWindowModeContext } | null | undefined;
type AnyRequest = { playerId: string; status: string };

export function selectIsJoinRequest(modeState: number | null | undefined): boolean {
	return modeState === statesDictionary.JOIN_REQUEST;
}

export function selectJoinLobbyId(modeCtx: ModeSnapshot): string | null {
	return modeCtx?.context?.lobbyId ?? null;
}

export function selectMyJoinRequest(
	allRequests: AnyRequest[] | null | undefined,
	currentPlayerId: string | null | undefined,
): AnyRequest | null {
	if (!allRequests || !currentPlayerId) return null;
	return allRequests.find((r) => r.playerId === currentPlayerId) ?? null;
}
