import type { TLobbySettings } from '~/shared/types/types';

type AnyPlayer = { playerId?: string | null; nickname?: string | null };
type AnyLobbyPlayer = { playerId?: string | null };
type AnyRequest = { id: string; playerId: string; status: string };

export function selectIsHost(
	hostPlayerId: string | null | undefined,
	currentPlayerId: string | null | undefined,
): boolean {
	return !!(hostPlayerId && currentPlayerId && hostPlayerId === currentPlayerId);
}

export function selectPlayerIds(
	readyMap: Record<string, 0 | 1>,
	lobbyPlayers: AnyLobbyPlayer[],
): string[] {
	const ids = new Set<string>();
	Object.keys(readyMap).forEach((id) => ids.add(id));
	lobbyPlayers.forEach((p) => p.playerId && ids.add(p.playerId));
	return Array.from(ids);
}

export function selectNicknameById(
	allPlayers: AnyPlayer[],
): Record<string, string> {
	const map: Record<string, string> = {};
	for (const p of allPlayers) {
		if (p.playerId && p.nickname) map[p.playerId] = p.nickname;
	}
	return map;
}

export function selectReadyMap(
	lobbyCtx: { state: number | null; context: TLobbySettings } | null | undefined,
): Record<string, 0 | 1> {
	return lobbyCtx?.context?.playerReadyMap ?? {};
}

export function selectPendingRequests(requests: AnyRequest[]): AnyRequest[] {
	return requests.filter((r) => r.status === 'pending');
}
