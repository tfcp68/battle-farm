import { describe, expect, it } from '@jest/globals';
import { createRng, D4, D6, D20, nextRandom, pickIndex, rollDice, rollDie, shuffle } from '~/entities/game';

/**
 * The generator's contract is that it is a *pure function of its state*: the
 * match replays from its seed, and effects stay pure. Everything below is a
 * consequence of that.
 */
describe('deterministic RNG', () => {
	const drawMany = (seed: number, count: number): number[] => {
		let state = createRng(seed);
		return Array.from({ length: count }, () => {
			const [value, next] = nextRandom(state);
			state = next;
			return value;
		});
	};

	it('replays the same sequence from the same seed', () => {
		expect(drawMany(1234, 20)).toEqual(drawMany(1234, 20));
	});

	it('produces different sequences for different seeds', () => {
		expect(drawMany(1234, 20)).not.toEqual(drawMany(1235, 20));
	});

	it('never mutates the state it was given', () => {
		const state = createRng(7);
		const snapshot = { ...state };
		nextRandom(state);
		rollDie(state, D6);
		shuffle([1, 2, 3, 4], state);
		expect(state).toEqual(snapshot);
	});

	it('draws floats within [0, 1)', () => {
		for (const value of drawMany(99, 500)) {
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});
});

describe('dice', () => {
	const rollMany = (seed: number, sides: number, count: number): number[] => {
		let state = createRng(seed);
		return Array.from({ length: count }, () => {
			const [value, next] = rollDie(state, sides);
			state = next;
			return value;
		});
	};

	it.each([
		['d4', D4],
		['d6', D6],
		['d20', D20],
	])('keeps %s within its range and reaches both ends', (_name, sides) => {
		const rolls = rollMany(2024, sides, 2000);
		expect(Math.min(...rolls)).toBe(1);
		expect(Math.max(...rolls)).toBe(sides);
	});

	it('sums NdR within the possible range', () => {
		const [total] = rollDice(createRng(5), 3, D6);
		expect(total).toBeGreaterThanOrEqual(3);
		expect(total).toBeLessThanOrEqual(18);
	});

	it('rolls nothing for a count of zero, leaving the state untouched', () => {
		const state = createRng(5);
		expect(rollDice(state, 0, D6)).toEqual([0, state]);
	});

	it('rejects a die that cannot be rolled', () => {
		expect(() => rollDie(createRng(1), 0)).toThrow(RangeError);
		expect(() => rollDice(createRng(1), -1, D6)).toThrow(RangeError);
		expect(() => pickIndex(createRng(1), 0)).toThrow(RangeError);
	});
});

describe('shuffle', () => {
	const items = Array.from({ length: 52 }, (_, index) => index);

	it('returns a permutation without touching the input', () => {
		const [shuffled] = shuffle(items, createRng(42));
		expect(shuffled).toHaveLength(items.length);
		expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
		expect(items).toEqual(Array.from({ length: 52 }, (_, index) => index));
	});

	it('actually reorders', () => {
		const [shuffled] = shuffle(items, createRng(42));
		expect(shuffled).not.toEqual(items);
	});

	it('is deterministic per seed', () => {
		expect(shuffle(items, createRng(42))[0]).toEqual(shuffle(items, createRng(42))[0]);
		expect(shuffle(items, createRng(42))[0]).not.toEqual(shuffle(items, createRng(43))[0]);
	});

	it('advances the state, so two shuffles in a row differ', () => {
		const [first, afterFirst] = shuffle(items, createRng(42));
		const [second] = shuffle(items, afterFirst);
		expect(second).not.toEqual(first);
	});

	it('handles empty and single-item inputs', () => {
		const state = createRng(1);
		expect(shuffle([], state)).toEqual([[], state]);
		expect(shuffle(['only'], state)).toEqual([['only'], state]);
	});
});
