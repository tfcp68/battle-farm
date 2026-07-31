import { describe, expect, it } from '@jest/globals';
import { buildRoomLink, readRoomCodeFromUrl, ROOM_PARAM } from '~/shared/net/roomLink';

const CODE = 'K7QM2X';

describe('invite links', () => {
	it('builds a link to the app root carrying the code', () => {
		const link = buildRoomLink(CODE, 'https://farm.example.com/');

		expect(link).toBe(`https://farm.example.com/?${ROOM_PARAM}=${CODE}`);
	});

	it('drops the route the sharer happened to be on', () => {
		// The host copies from /lobby, but the invitee's app routes itself.
		const link = buildRoomLink(CODE, 'https://farm.example.com/lobby');

		expect(link).toBe(`https://farm.example.com/?${ROOM_PARAM}=${CODE}`);
	});

	it('normalises a typed-in code', () => {
		expect(buildRoomLink('k7qm-2x', 'https://farm.example.com/')).toContain(CODE);
	});

	it('reads the code back out of a link', () => {
		expect(readRoomCodeFromUrl(`https://farm.example.com/?${ROOM_PARAM}=${CODE}`)).toBe(CODE);
	});

	it('reads the code regardless of the route it landed on', () => {
		expect(readRoomCodeFromUrl(`https://farm.example.com/menu?${ROOM_PARAM}=${CODE}`)).toBe(CODE);
	});

	it('ignores a malformed code rather than starting a doomed connection', () => {
		expect(readRoomCodeFromUrl(`https://farm.example.com/?${ROOM_PARAM}=nope`)).toBeNull();
		expect(readRoomCodeFromUrl(`https://farm.example.com/?${ROOM_PARAM}=`)).toBeNull();
		// 0 and O are outside the alphabet on purpose.
		expect(readRoomCodeFromUrl(`https://farm.example.com/?${ROOM_PARAM}=K0QM2X`)).toBeNull();
	});

	it('returns null when there is no invite', () => {
		expect(readRoomCodeFromUrl('https://farm.example.com/menu')).toBeNull();
		expect(readRoomCodeFromUrl('not a url')).toBeNull();
	});
});
