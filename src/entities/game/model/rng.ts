import type { RngState } from './types';

/**
 * Deterministic randomness for the match (`docs/rules.md` → Dices).
 *
 * Every draw is a pure function returning the value *and* the next state, so the
 * generator lives in the Data Model rather than in a closure. That buys three
 * things the game needs: a match replays identically from its seed, effects stay
 * pure functions of `(event, model)`, and a savegame restores mid-match without
 * the dice repeating themselves.
 *
 * The algorithm is mulberry32 — 32 bits of state, good enough for dice and
 * shuffles, and cheap to serialize as one number.
 */

export const D4 = 4;
export const D6 = 6;
export const D20 = 20;

export function createRng(seed: number): RngState {
	return { seed: seed | 0, cursor: seed | 0 };
}

/** Draws the next float in `[0, 1)`. */
export function nextRandom(rng: RngState): [number, RngState] {
	const cursor = (rng.cursor + 0x6D2B79F5) | 0;
	let t = Math.imul(cursor ^ (cursor >>> 15), 1 | cursor);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	return [value, { seed: rng.seed, cursor }];
}

/** Rolls one die, returning a whole number in `[1, sides]`. */
export function rollDie(rng: RngState, sides: number): [number, RngState] {
	if (!Number.isInteger(sides) || sides < 1) throw new RangeError(`Die must have a positive integer of sides: ${sides}`);
	const [value, next] = nextRandom(rng);
	return [Math.floor(value * sides) + 1, next];
}

/** Rolls `count` dice and sums them — the rulebook's `{N}d{R}`. */
export function rollDice(rng: RngState, count: number, sides: number): [number, RngState] {
	if (!Number.isInteger(count) || count < 0) throw new RangeError(`Dice count must be a non-negative integer: ${count}`);
	let total = 0;
	let state = rng;
	for (let i = 0; i < count; i++) {
		const [value, next] = rollDie(state, sides);
		total += value;
		state = next;
	}
	return [total, state];
}

/** Picks a valid index of an array of `length` items. Throws on an empty range. */
export function pickIndex(rng: RngState, length: number): [number, RngState] {
	if (!Number.isInteger(length) || length < 1) throw new RangeError(`Cannot pick from ${length} items`);
	const [value, next] = nextRandom(rng);
	return [Math.floor(value * length), next];
}

/** Fisher-Yates over a copy — the input array is never touched. */
export function shuffle<T>(items: readonly T[], rng: RngState): [T[], RngState] {
	const result = items.slice();
	let state = rng;
	for (let i = result.length - 1; i > 0; i--) {
		const [value, next] = nextRandom(state);
		state = next;
		const j = Math.floor(value * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return [result, state];
}
