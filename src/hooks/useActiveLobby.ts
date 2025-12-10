import React from 'react';

export function useActiveLobby(
	currentPlayerId: string | null | undefined,
	lobbies: Array<{ gameId: string; hostPlayerId: string; playerIds: string[]; createdAt: string; updatedAt?: string }> | undefined,
) {
	return React.useMemo(() => {
		if (!currentPlayerId) return undefined;
		const mine = (lobbies ?? []).filter(l => (l.playerIds ?? []).includes(currentPlayerId));
		if (mine.length === 0) return undefined;
		const byTime = (x: typeof mine[number]) => Date.parse(x.updatedAt ?? x.createdAt ?? 0);
		return mine.sort((a, b) => byTime(b) - byTime(a))[0];
	}, [currentPlayerId, lobbies]);
}