/** Envelope every room message travels in. Versioned so game messages can be added later. */
export interface RoomMessage {
	v: 1;
	type: string;
	payload: unknown;
}

export type MessageListener = (message: RoomMessage, peerId: string) => void;
export type PeerListener = (peerId: string) => void;

/**
 * Transport-agnostic view of a P2P room. Deliberately narrow so the room logic
 * can be tested over an in-memory fake without a WebRTC stack.
 */
export interface RoomTransport {
	/** Own peer id, stable for the lifetime of the transport. */
	readonly selfId: string;
	/** Peer ids currently connected, excluding self. */
	readonly peers: readonly string[];

	join(code: string): Promise<void>;
	leave(): Promise<void>;

	/** Send to one peer, or broadcast when `peerId` is omitted. */
	send(type: string, payload: unknown, peerId?: string): void;

	/** Subscribe to inbound messages. Returns an unsubscribe function. */
	onMessage(listener: MessageListener): () => void;
	onPeerJoin(listener: PeerListener): () => void;
	onPeerLeave(listener: PeerListener): () => void;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

/** No `0/O` or `1/I/L`: players read these out loud and retype them. */
export function generateRoomCode(): string {
	const bytes = new Uint8Array(CODE_LENGTH);
	crypto.getRandomValues(bytes);
	let code = '';
	for (const byte of bytes) code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
	return code;
}

/** Uppercases and strips separators players tend to type (`abc-123` → `ABC123`). */
export function normalizeRoomCode(input: string): string {
	return String(input ?? '')
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '');
}

export function isValidRoomCode(input: string): boolean {
	const code = normalizeRoomCode(input);
	if (code.length !== CODE_LENGTH) return false;
	return [...code].every((char) => CODE_ALPHABET.includes(char));
}
