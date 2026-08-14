import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ACTION_DEFINITIONS } from '../src/entities/game/data/actions.ts';
import { CLASS_DEFINITIONS } from '../src/entities/game/data/classes.ts';
import { CROP_DEFINITIONS } from '../src/entities/game/data/crops.ts';

/**
 * Renders the card art the app serves, and the dictionary it looks paths up in.
 *
 * Run with `pnpm assets:build` (add `--force` to ignore mtimes, `--check` to
 * verify without writing). Plain TypeScript on plain Node — no bundler, because
 * there is nothing to bundle: this reads files and writes files.
 *
 * ## What the previous pipeline got wrong
 *
 * It was a webpack build whose *output artifact* was a script
 * (`assets/thumbs/dictGenerate.js`) that you then had to run to get the
 * dictionary — a build step to produce a build step. It had not worked for a
 * long time: its imports pointed at `src/constants/` and `src/types/`, which
 * moved under `src/shared/` at some point, and `sharp@0.32` predates the Node
 * it was being run on. Nobody noticed, because nothing checked its output. It
 * also declared AVIF and WEBP variants in the dictionary that it never actually
 * produced — 360 entries pointing at files that did not exist.
 *
 * ## What this one does differently
 *
 * - **The card ids come from the game entity.** `CROP_DEFINITIONS` and friends
 *   are the source of truth for what a card *is*; the old pipeline read a
 *   parallel list under `src/shared/types/serializables/`, so a card added to
 *   the game silently got no art. A definition without a source file is a hard
 *   failure here, not a gap in a JSON file.
 * - **It writes what it declares.** The dictionary is generated from the files
 *   just written, so the two cannot drift. `tests/assets/artCoverage.test.ts`
 *   re-checks that against the disk.
 * - **It is incremental.** A source file older than its outputs is skipped, so
 *   a re-run after adding one card costs one card.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SOURCE_DIR = join(ROOT, 'assets');
const PUBLIC_DIR = join(ROOT, 'public');
/** Everything the dictionary names lives under here, and its paths are relative to `public/`. */
const OUT_DIR = join(PUBLIC_DIR, 'assets');
const DICTIONARY_PATH = join(ROOT, 'src', 'shared', 'assets', 'assetsDictionary.json');

/**
 * Widths. Height follows from the 2:3 card, so a size is one number: the source
 * art is 1024×1536 and every derived size keeps that ratio.
 *
 * SMALL is what the board renders and what gets preloaded; LARGE is the
 * hover/zoom; MEDIUM sits between for panels. Classes used to have no MEDIUM at
 * all — an accident of the old config that `artPathOf` still has to paper over.
 * Every group gets all three now.
 */
const SIZES = { SMALL: 160, MEDIUM: 550, LARGE: 750 } as const;
const ASPECT = 3 / 2;

/**
 * AVIF first, WebP second: that is the order `image-set()` offers them in, and
 * the browser takes the first it understands. No JPEG — the last engines that
 * needed it are long out of support, and it would be 186 files nobody fetches.
 */
const FORMATS = {
	AVIF: { ext: 'avif', encode: (p: sharp.Sharp) => p.avif({ quality: 55, effort: 5 }) },
	WEBP: { ext: 'webp', encode: (p: sharp.Sharp) => p.webp({ quality: 82 }) },
} as const;

type SizeName = keyof typeof SIZES;
type FormatName = keyof typeof FORMATS;

interface Source {
	/** Dictionary group: `CROPS`, `ACTIONS`, `CLASSES`, `ELEMENTS`. */
	group: string;
	/** Dictionary key — the card's id, exactly as the game entity spells it. */
	id: string;
	/** Absolute path of the original render. */
	file: string;
	/** Output basename, lower-snake to match the existing on-disk convention. */
	slug: string;
}

/** Art that is not a card but is rendered like one. The deck's back is the only one. */
const ELEMENTS = [{ id: 'CARD_BACK', slug: 'card_back' }];

function collectSources(): Source[] {
	const groups: Array<[string, string, string[]]> = [
		['CROPS', 'crops', Object.keys(CROP_DEFINITIONS)],
		['ACTIONS', 'actions', Object.keys(ACTION_DEFINITIONS)],
		['CLASSES', 'classes', Object.keys(CLASS_DEFINITIONS)],
	];

	const sources: Source[] = [];
	const missing: string[] = [];

	for (const [group, dir, ids] of groups) {
		for (const id of ids) {
			const slug = id.toLowerCase();
			const file = join(SOURCE_DIR, dir, `${slug}.png`);
			if (existsSync(file)) sources.push({ group, id, file, slug });
			else missing.push(`${group}/${id} → assets/${dir}/${slug}.png`);
		}
	}

	for (const { id, slug } of ELEMENTS) {
		const file = join(SOURCE_DIR, 'elements', `${slug}.png`);
		if (existsSync(file)) sources.push({ group: 'ELEMENTS', id, file, slug });
		else missing.push(`ELEMENTS/${id} → assets/elements/${slug}.png`);
	}

	if (missing.length > 0) {
		throw new Error(
			`No source art for ${missing.length} definition(s). A card in the game entity ` +
				`without a render is a gap the dictionary used to hide:\n  ${missing.join('\n  ')}`,
		);
	}

	return sources;
}

/** Everything one source produces: three sizes × two formats. */
function outputsOf(source: Source) {
	return Object.entries(SIZES).flatMap(([size, width]) =>
		Object.entries(FORMATS).map(([format, { ext }]) => ({
			size: size as SizeName,
			format: format as FormatName,
			width,
			ext,
			/** Relative to `public/`, which is exactly what the dictionary stores. */
			relative: `assets/${source.group.toLowerCase()}/${size}/${ext}/${source.slug}.${ext}`,
		})),
	);
}

async function isStale(sourceFile: string, outFile: string): Promise<boolean> {
	if (!existsSync(outFile)) return true;
	const [src, out] = await Promise.all([stat(sourceFile), stat(outFile)]);
	return src.mtimeMs > out.mtimeMs;
}

/** Bounded concurrency: encoding is CPU-bound and sharp already threads inside. */
async function pooled<T>(items: T[], limit: number, run: (item: T) => Promise<void>): Promise<void> {
	let cursor = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (cursor < items.length) {
			const item = items[cursor++];
			if (item !== undefined) await run(item);
		}
	});
	await Promise.all(workers);
}

type Dictionary = Record<string, Record<string, Record<string, Record<string, string>>>>;

async function main(): Promise<void> {
	const force = process.argv.includes('--force');
	const checkOnly = process.argv.includes('--check');

	const sources = collectSources();
	const dictionary: Dictionary = {};
	let written = 0;
	let skipped = 0;
	let bytes = 0;

	await pooled(sources, 4, async (source) => {
		for (const out of outputsOf(source)) {
			const target = join(PUBLIC_DIR, out.relative);

			((dictionary[source.group] ??= {})[source.id] ??= {})[out.size] ??= {};
			dictionary[source.group]![source.id]![out.size]![out.format] = out.relative;

			if (checkOnly) continue;

			if (!force && !(await isStale(source.file, target))) {
				// Read first, add after: `bytes += (await …).size` reads `bytes`
				// before the await settles, so four workers lose each other's writes.
				const { size } = await stat(target);
				skipped += 1;
				bytes += size;
				continue;
			}

			await mkdir(dirname(target), { recursive: true });
			const pipeline = sharp(source.file).resize(out.width, Math.round(out.width * ASPECT), {
				fit: 'cover',
				position: 'top',
			});
			const info = await FORMATS[out.format].encode(pipeline).toFile(target);
			written += 1;
			bytes += info.size;
		}
	});

	// Sorted keys so a re-run produces a byte-identical file and the diff is
	// about the art, not about object insertion order.
	const sorted: Dictionary = {};
	for (const group of Object.keys(dictionary).sort()) {
		sorted[group] = {};
		for (const id of Object.keys(dictionary[group]!).sort()) {
			sorted[group]![id] = dictionary[group]![id]!;
		}
	}

	if (checkOnly) {
		const stale = await findOrphans(sorted);
		if (stale.length > 0) {
			throw new Error(`public/assets holds ${stale.length} file(s) no definition claims:\n  ${stale.join('\n  ')}`);
		}
		console.log(`✓ ${sources.length} definitions, ${sources.length * 6} declared outputs, no orphans`);
		return;
	}

	await writeFile(DICTIONARY_PATH, `${JSON.stringify(sorted, null, 2)}\n`);

	const orphans = await findOrphans(sorted);
	console.log(
		`${sources.length} cards · ${written} written, ${skipped} up to date · ` +
			`${(bytes / 1024 / 1024).toFixed(1)} MB on disk`,
	);
	if (orphans.length > 0) {
		console.log(`⚠ ${orphans.length} orphan file(s) left over from an older build:`);
		for (const file of orphans) console.log(`    ${file}`);
		console.log('  Remove them, or re-run after deleting public/assets.');
	}
}

/** Files under `public/assets` that the dictionary no longer claims. */
async function findOrphans(dictionary: Dictionary): Promise<string[]> {
	const claimed = new Set(
		Object.values(dictionary)
			.flatMap((ids) => Object.values(ids))
			.flatMap((sizes) => Object.values(sizes))
			.flatMap((formats) => Object.values(formats)),
	);

	const found: string[] = [];
	async function walk(dir: string, prefix: string): Promise<void> {
		if (!existsSync(dir)) return;
		for (const entry of await readdir(dir, { withFileTypes: true })) {
			const relative = `${prefix}/${entry.name}`;
			if (entry.isDirectory()) await walk(join(dir, entry.name), relative);
			else if (!claimed.has(relative)) found.push(relative);
		}
	}
	await walk(OUT_DIR, 'assets');
	return found;
}

await main();
