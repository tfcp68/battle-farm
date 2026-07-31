import { ROUTE_SEGMENTS } from '~/app/routes';
import { isValidRoomCode, normalizeRoomCode } from './RoomTransport';

const ROUTE_SUFFIX = new RegExp(`/(${ROUTE_SEGMENTS.join('|')})/?$`);

/** Query parameter carrying an invite. Short, because the link is pasted around. */
export const ROOM_PARAM = 'room';

/**
 * Invite links are plain app URLs with `?room=CODE`. A query parameter rather
 * than a route, so it survives whatever path the FSM navigates to during boot.
 */
export function buildRoomLink(code: string, base?: string): string {
	const origin = base ?? (typeof document !== 'undefined' ? document.baseURI : '');
	const url = new URL(origin || 'http://localhost/');
	// Drop whatever route the sharer happened to be on; the app routes itself.
	url.pathname = url.pathname.replace(ROUTE_SUFFIX, '/');
	url.hash = '';
	url.search = '';
	url.searchParams.set(ROOM_PARAM, normalizeRoomCode(code));
	return url.toString();
}

/** Reads a valid invite code out of a URL, or null when there isn't one. */
export function readRoomCodeFromUrl(href?: string): string | null {
	const source = href ?? (typeof window === 'undefined' ? null : window.location.href);
	if (!source) return null;

	let url: URL;
	try {
		url = new URL(source);
	} catch {
		return null;
	}

	const raw = url.searchParams.get(ROOM_PARAM);
	if (!raw) return null;

	const code = normalizeRoomCode(raw);
	return isValidRoomCode(code) ? code : null;
}

/** Consumes the invite, so a later refresh doesn't silently rejoin the room. */
export function clearRoomCodeFromUrl(): void {
	if (typeof window === 'undefined' || !window.history?.replaceState) return;

	const url = new URL(window.location.href);
	if (!url.searchParams.has(ROOM_PARAM)) return;
	url.searchParams.delete(ROOM_PARAM);
	window.history.replaceState(window.history.state, '', url.toString());
}
