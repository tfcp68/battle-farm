import { describe, expect, it, jest } from '@jest/globals';
import { ModelStore } from '~/shared/lib/model';

interface TestModel {
	coins: number;
}

describe('ModelStore', () => {
	it('returns the initial snapshot', () => {
		const store = new ModelStore<TestModel>({ coins: 3 });
		expect(store.get()).toEqual({ coins: 3 });
	});

	it('commit replaces the snapshot and notifies with (next, prev)', () => {
		const store = new ModelStore<TestModel>({ coins: 3 });
		const listener = jest.fn();
		store.subscribe(listener);

		store.commit({ coins: 5 });

		expect(store.get()).toEqual({ coins: 5 });
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith({ coins: 5 }, { coins: 3 });
	});

	it('commit with the same reference is a no-op', () => {
		const initial: TestModel = { coins: 3 };
		const store = new ModelStore<TestModel>(initial);
		const listener = jest.fn();
		store.subscribe(listener);

		store.commit(initial);

		expect(listener).not.toHaveBeenCalled();
	});

	it('unsubscribe stops notifications', () => {
		const store = new ModelStore<TestModel>({ coins: 3 });
		const listener = jest.fn();
		const unsubscribe = store.subscribe(listener);

		unsubscribe();
		store.commit({ coins: 5 });

		expect(listener).not.toHaveBeenCalled();
	});
});
