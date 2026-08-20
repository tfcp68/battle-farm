import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from '@jest/globals';
import {
	ACTION_DEFINITIONS,
	artBackground,
	artOf,
	type ArtSize,
	cardBackArt,
	CLASS_DEFINITIONS,
	CROP_DEFINITIONS,
} from '~/entities/game';
import * as assetsDictionary from '~/shared/assets/assetsDictionary.json';

/**
 * The dictionary, the card data and the disk, checked against each other.
 *
 * This is the check that was missing for years: the old dictionary claimed 546
 * files and 360 of them did not exist — AVIF and WEBP variants the pipeline
 * never produced. Nothing noticed, because the only accessor threw at runtime
 * and nothing called it. A card without art is a placeholder; a dictionary
 * lying about a card is a blank screen nobody sees until a player does.
 *
 * `pnpm assets:build --check` makes the same assertions from the build's side.
 * This one makes them from the app's, through the accessor the app calls.
 */

const PUBLIC_DIR = join(__dirname, '..', '..', 'public');
const raw = assetsDictionary as unknown as { default?: unknown };
const dictionary = (raw.default ?? assetsDictionary) as Record<
	string,
	Record<string, Record<string, Record<string, string>>>
>;

const CARDS = [
	...Object.values(CROP_DEFINITIONS).map((def) => ({ group: 'CROPS', def })),
	...Object.values(ACTION_DEFINITIONS).map((def) => ({ group: 'ACTIONS', def })),
	...Object.values(CLASS_DEFINITIONS).map((def) => ({ group: 'CLASSES', def })),
];

const SIZES: ArtSize[] = ['SMALL', 'MEDIUM', 'LARGE'];

describe('card art coverage', () => {
	it('covers all 62 cards and classes', () => {
		expect(CARDS).toHaveLength(62);
	});

	it('has a dictionary entry for every definition', () => {
		const missing = CARDS.filter(({ group, def }) => !dictionary[group]?.[def.id]);
		expect(missing.map(({ def }) => def.id)).toEqual([]);
	});

	it('has no entry without a definition', () => {
		const known = new Set([...CARDS.map(({ group, def }) => `${group}/${def.id}`), 'ELEMENTS/CARD_BACK']);
		const orphans = Object.entries(dictionary).flatMap(([group, entries]) =>
			Object.keys(entries)
				.map((id) => `${group}/${id}`)
				.filter((key) => !known.has(key)),
		);
		expect(orphans).toEqual([]);
	});

	it('points at files that exist under public/', () => {
		const dangling = Object.values(dictionary)
			.flatMap((entries) => Object.values(entries))
			.flatMap((sizes) => Object.values(sizes))
			.flatMap((formats) => Object.values(formats))
			.filter((relative) => !existsSync(join(PUBLIC_DIR, relative)));
		expect(dangling).toEqual([]);
	});

	/** Every group gets every size now — classes used to have no MEDIUM at all. */
	it('resolves both formats at every size, for every card', () => {
		const gaps = CARDS.flatMap(({ def }) =>
			SIZES.filter((size) => {
				const sources = artOf(def, size);
				return !sources?.avif || !sources.webp;
			}).map((size) => `${def.id}/${size}`),
		);
		expect(gaps).toEqual([]);
	});

	it('serves paths from the site root, so a nested route still finds them', () => {
		const paths = CARDS.flatMap(({ def }) => Object.values(artOf(def, 'SMALL') ?? {}));
		expect(paths).toHaveLength(CARDS.length * 2);
		expect(paths.every((path) => path.startsWith('/assets/'))).toBe(true);
	});

	it('has a back for the deck, which is not a card but renders like one', () => {
		for (const size of SIZES) {
			const back = cardBackArt(size);
			expect(back?.avif).toMatch(/^\/assets\/elements\//);
			expect(existsSync(join(PUBLIC_DIR, back!.webp.slice(1)))).toBe(true);
		}
	});

	/**
	 * The order matters: the browser takes the first candidate it can decode, so
	 * AVIF has to be offered before WebP or the smaller file is never used.
	 */
	it('offers AVIF before WebP, with the type hints that make it a negotiation', () => {
		const css = artBackground(artOf(CROP_DEFINITIONS.WHEAT, 'SMALL'));
		expect(css).toMatch(/^image-set\(/);
		expect(css!.indexOf('image/avif')).toBeLessThan(css!.indexOf('image/webp'));
		expect(css).toContain('.avif") type("image/avif")');
		expect(css).toContain('.webp") type("image/webp")');
	});

	it('renders nothing rather than a broken url when art is absent', () => {
		expect(artBackground(null)).toBeUndefined();
	});
});
