export interface RoomPlayer {
	playerId: string;
	nickname: string;
	isHost: boolean;
	isReady: boolean;
}

export interface RoomJoinRequest {
	playerId: string;
	nickname: string;
}

/**
 * Everything a guest needs to render the lobby. The host owns the authoritative
 * copy; guests hold the last snapshot they received.
 */
export interface RoomState {
	version: number;
	code: string;
	hostPlayerId: string;
	status: 'open' | 'locked';
	maxPlayers: number;
	players: RoomPlayer[];
	requests: RoomJoinRequest[];
}

/** Message types on the wire. Values are short — they ride every packet. */
export const RoomMessageType = {
	hello: 'hello',
	joinRequest: 'join_request',
	setReady: 'set_ready',
	leave: 'leave',
	snapshot: 'snapshot',
	requestResult: 'request_result',
	error: 'error',
} as const;

export interface HelloPayload {
	playerId: string;
	nickname: string;
}

export interface JoinRequestPayload {
	playerId: string;
}

export interface SetReadyPayload {
	playerId: string;
	isReady: boolean;
}

export interface LeavePayload {
	playerId: string;
}

export interface SnapshotPayload {
	state: RoomState;
}

export interface RequestResultPayload {
	playerId: string;
	approved: boolean;
}

export interface RoomErrorPayload {
	code: 'room_full' | 'room_locked' | 'not_host' | 'unknown_player';
	message: string;
}

export const DEFAULT_MAX_PLAYERS = 7;

export function emptyRoomState(code: string, hostPlayerId: string, maxPlayers: number): RoomState {
	return {
		version: 0,
		code,
		hostPlayerId,
		status: 'open',
		maxPlayers,
		players: [],
		requests: [],
	};
}
