export type TLobbySettings = {
	playerId: string | null;
	gameId: string;
	playerReadyMap: Record<string, 0 | 1>;
	hostPlayerId: string;
	maxPlayers: number;
	readyState: 0 | 1;
};

export type TWindowModeContext = {
	playerId: string | null;
	lobbyId: string | null;
	gameId: string | null;
};


