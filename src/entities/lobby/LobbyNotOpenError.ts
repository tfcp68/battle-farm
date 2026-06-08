export class LobbyNotOpenError extends Error {
	readonly code = 'LOBBY_NOT_OPEN' as const;

	constructor(message: string) {
		super(message);
		this.name = 'LobbyNotOpenError';
	}
}
