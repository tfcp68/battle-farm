import type { RoomTransport } from './RoomTransport';
import { TrysteroRoomTransport } from './TrysteroRoomTransport';

function readIceServers(): RTCIceServer[] {
	const raw = import.meta.env?.VITE_ICE_SERVERS;
	if (!raw) return [];
	try {
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as RTCIceServer[]) : [];
	} catch {
		console.warn('VITE_ICE_SERVERS is not valid JSON — falling back to the default STUN servers');
		return [];
	}
}

/**
 * Trystero's default pool includes relays that are frequently unreachable, and
 * every failed socket shows up as a console error even though the connection
 * still succeeds through the others. These are long-running public Nostr relays;
 * override with `VITE_P2P_RELAYS` if they start misbehaving.
 */
const DEFAULT_RELAY_URLS = [
	'wss://relay.damus.io',
	'wss://nos.lol',
	'wss://relay.nostr.band',
	'wss://relay.primal.net',
];

/** Comma-separated relay list from the environment, if provided. */
function readRelayUrls(): string[] {
	const raw = import.meta.env?.VITE_P2P_RELAYS;
	if (!raw) return DEFAULT_RELAY_URLS;
	const urls = raw
		.split(',')
		.map((url: string) => url.trim())
		.filter(Boolean);
	return urls.length ? urls : DEFAULT_RELAY_URLS;
}

export function createRoomTransport(): RoomTransport {
	return new TrysteroRoomTransport({
		appId: import.meta.env?.VITE_P2P_APP_ID || 'battle-farm',
		iceServers: readIceServers(),
		relayUrls: readRelayUrls(),
	});
}
