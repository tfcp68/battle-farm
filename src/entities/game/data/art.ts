import * as assetsDictionaryModule from '~/shared/assets/assetsDictionary.json';
import type { CardDefinition } from './cards';
import type { ClassDefinition } from './classes';

/**
 * Where a card's picture lives.
 *
 * The artwork has been in the repository since long before this code and no
 * line of the running app pointed at it: the thumbnails sat outside `public/`,
 * so Vite never served them, and the only accessor threw on any miss — fine for
 * a build script, useless for a card face, where a missing picture should be a
 * placeholder and not a blank screen.
 *
 * Both the files and this dictionary are produced by `pnpm assets:build`
 * (`scripts/build-card-art.ts`) from the same `CROP_DEFINITIONS` /
 * `ACTION_DEFINITIONS` / `CLASS_DEFINITIONS` the game entity is built on, so
 * there is no id mapping to keep in step — a card without a render fails the
 * build. `tests/assets/artCoverage.test.ts` re-checks the result against disk.
 */

export type ArtSize = 'SMALL' | 'MEDIUM' | 'LARGE';

/**
 * One picture in the two formats the pipeline emits, best first.
 *
 * AVIF is roughly a third smaller than WebP at the same quality but is not
 * quite universal; WebP is. Rather than sniffing support at runtime — which
 * means a render before the answer arrives — both are handed to CSS, and the
 * browser picks the first it can decode.
 */
export interface ArtSources {
	avif: string;
	webp: string;
}

type FormatEntry = Partial<Record<string, string>>;
type SizeEntry = Partial<Record<string, FormatEntry>>;
type ArtGroup = Partial<Record<string, SizeEntry>>;

// Namespace import with a default unwrap: the app build runs with
// `esModuleInterop` and the CJS test build does not, and this shape is the one
// both agree on.
const raw = assetsDictionaryModule as unknown as { default?: unknown };
const DICTIONARY = (raw.default ?? assetsDictionaryModule) as Record<string, ArtGroup>;

/** Class Cards are Action Cards in the model but a group of their own on disk. */
function groupOf(definition: CardDefinition | ClassDefinition): string {
	if (!('kind' in definition)) return 'CLASSES';
	return definition.kind === 'crop' ? 'CROPS' : 'ACTIONS';
}

function lookup(group: string, id: string, size: ArtSize): ArtSources | null {
	const entry = DICTIONARY[group]?.[id]?.[size];
	return entry?.AVIF && entry.WEBP ? { avif: `/${entry.AVIF}`, webp: `/${entry.WEBP}` } : null;
}

/**
 * The card's picture at that size, or `null` when it has none. Never throws:
 * the caller renders a placeholder.
 */
export function artOf(definition: CardDefinition | ClassDefinition, size: ArtSize): ArtSources | null {
	return lookup(groupOf(definition), definition.id, size);
}

/** The deck's back, shown for face-down cards: the draw pile and other hands. */
export function cardBackArt(size: ArtSize): ArtSources | null {
	return lookup('ELEMENTS', 'CARD_BACK', size);
}

/**
 * A `background-image` value that lets the browser choose the format.
 *
 * `type()` is what makes this a negotiation rather than a guess — without it a
 * browser has to fetch a candidate to discover it cannot decode it. Returns
 * `undefined` for absent art so the property is simply not set.
 */
export function artBackground(sources: ArtSources | null): string | undefined {
	if (!sources) return undefined;
	return `image-set(url("${sources.avif}") type("image/avif"), url("${sources.webp}") type("image/webp"))`;
}
