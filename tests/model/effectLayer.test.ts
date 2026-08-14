import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CoreLoop, TimedCoreLoop } from '@yantrix/core';
import { attachEffectLayer, ModelStore, type TEffectMatrix, type TModelEffect } from '~/shared/lib/model';
import { AbstractWindowDataSource, type FollowUp } from '~/app/yantrix/data/shared/AbstractWindowDataSource';

/**
 * Drives the Effect Layer prototype through the real `CoreLoop`/`BasicEventBus`
 * from `@yantrix/core` — the same wiring `startYantrixCore` uses — to prove
 * event → effect → model → subscriber works against the published API.
 */

const EVENTS = {
	cropHarvested: 101,
	fertilizerSpent: 102,
	chatMessage: 103, // present on the bus, absent from the matrix
} as const;

interface MatchModel {
	coins: Record<string, number>;
	fertilizers: Record<string, number>;
	harvests: number;
}

const initialModel = (): MatchModel => ({
	coins: { alice: 3, bob: 3 },
	fertilizers: { alice: 3, bob: 3 },
	harvests: 0,
});

interface HarvestMeta {
	playerId: string;
	cropValue: number;
}

interface FertilizeMeta {
	playerId: string;
}

const addCoins: TModelEffect<MatchModel> = (event, model) => {
	const { playerId, cropValue } = event.meta as unknown as HarvestMeta;
	return {
		...model,
		coins: { ...model.coins, [playerId]: (model.coins[playerId] ?? 0) + cropValue },
	};
};

const countHarvest: TModelEffect<MatchModel> = (_event, model) => ({
	...model,
	harvests: model.harvests + 1,
});

const spendFertilizer: TModelEffect<MatchModel> = (event, model) => {
	const { playerId } = event.meta as unknown as FertilizeMeta;
	return {
		...model,
		fertilizers: { ...model.fertilizers, [playerId]: (model.fertilizers[playerId] ?? 0) - 1 },
	};
};

const matrix: TEffectMatrix<MatchModel> = {
	[EVENTS.cropHarvested]: [addCoins, countHarvest],
	[EVENTS.fertilizerSpent]: [spendFertilizer],
};

describe('attachEffectLayer over CoreLoop', () => {
	let loop: CoreLoop<number, Record<number, unknown>>;
	let store: ModelStore<MatchModel>;
	let detach: () => void;

	beforeEach(() => {
		loop = new CoreLoop();
		store = new ModelStore(initialModel());
		detach = attachEffectLayer({ bus: loop.getBus(), store, matrix });
		loop.start();
	});

	it('applies the effects of a dispatched event to the model', () => {
		loop.getBus().dispatch({ event: EVENTS.cropHarvested, meta: { playerId: 'alice', cropValue: 2 } });

		expect(store.get().coins).toEqual({ alice: 5, bob: 3 });
		expect(store.get().harvests).toBe(1);
	});

	it('runs multiple effects of one event in matrix order over the same snapshot', () => {
		loop.getBus().dispatch({ event: EVENTS.cropHarvested, meta: { playerId: 'bob', cropValue: 9 } });
		loop.getBus().dispatch({ event: EVENTS.fertilizerSpent, meta: { playerId: 'bob' } });

		expect(store.get()).toEqual({
			coins: { alice: 3, bob: 12 },
			fertilizers: { alice: 3, bob: 2 },
			harvests: 1,
		});
	});

	it('leaves the model untouched (same reference) for events outside the matrix', () => {
		const before = store.get();
		loop.getBus().dispatch({ event: EVENTS.chatMessage, meta: { text: 'gg' } });

		expect(store.get()).toBe(before);
	});

	it('notifies store subscribers once per model-changing event', () => {
		const listener = jest.fn();
		store.subscribe(listener);

		loop.getBus().dispatch({ event: EVENTS.cropHarvested, meta: { playerId: 'alice', cropValue: 1 } });
		loop.getBus().dispatch({ event: EVENTS.chatMessage, meta: { text: 'gg' } });

		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('detach unbinds every event', () => {
		detach();
		loop.getBus().dispatch({ event: EVENTS.cropHarvested, meta: { playerId: 'alice', cropValue: 2 } });

		expect(store.get()).toEqual(initialModel());
	});
});

/** A Data Source that pushes whatever it is handed, standing in for the UI bridge. */
class ProbeDataSource extends AbstractWindowDataSource<{ event: number; meta: unknown }> {
	constructor() {
		super({
			id: 'probe_source',
			responseMapper: (data): FollowUp[] => [data as FollowUp],
		});
	}

	push(event: number, meta: unknown): void {
		this.emit({ event, meta });
	}
}

/**
 * The seam the cases above skip: in production nothing dispatches on the bus by
 * hand — events arrive from a Data Source, which the loop drains on its own
 * clock. This is the path `emitDomainEvent` actually takes.
 */
describe('a Data Source event reaching the Effect Layer', () => {
	it('applies the effects on the loop tick', async () => {
		const loop = new TimedCoreLoop<number, Record<number, unknown>>();
		const store = new ModelStore(initialModel());
		attachEffectLayer({ bus: loop.getBus(), store, matrix });

		const source = new ProbeDataSource();
		loop.registerSource(source);
		loop.start();

		source.push(EVENTS.cropHarvested, { playerId: 'alice', cropValue: 4 });
		await new Promise((resolve) => setTimeout(resolve, 200));
		loop.stop();

		expect(store.get().coins.alice).toBe(7);
		expect(store.get().harvests).toBe(1);
	});
});
