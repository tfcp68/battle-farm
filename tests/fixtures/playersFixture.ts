import { TTurnPhase } from '~/src/types/fsm';
import { TTurnContext } from '~/src/types/serializables/game';
import { TPlayer, TPlayerClass } from '~/src/types/serializables/players';
import { TPlayerRecord } from '~/src/types/shared';
import { isPlayerClass } from '~/src/types/typeGuards';
import { cardFixture } from './cardsFixtures';
import { bedFixture } from './cropsFixture';
import { sampleRange, pickFromArray, sampleArray } from '@yantrix/utils';

export function randomPlayerClass() {
	return pickFromArray(Object.values(TPlayerClass).filter((v) => typeof v === 'number'))[0] as TPlayerClass;
}

export function playerRecordFixture<T>(iterator: (props?: Partial<TPlayer>) => T): TPlayerRecord<T> {
	return Object.values(TPlayerClass).reduce(
		(obj, playerClass) =>
			isPlayerClass(playerClass)
				? Object.assign(obj, {
						[playerClass]: iterator({
							class: playerClass,
						}),
				  })
				: obj,
		{}
	);
}

export function playerFixture(props: Partial<TPlayer> = {}): TPlayer {
	const playerClass = randomPlayerClass();
	const handLength = sampleRange(0, 8);
	const hand = sampleArray(cardFixture, handLength);
	const discardedCardsLength = sampleRange(0, 8);
	const discardedCards = sampleArray(cardFixture, discardedCardsLength);
	const bedsLength = sampleRange(0, 8);
	const beds = sampleArray(bedFixture(), bedsLength);
	if (!isPlayerClass(props?.class)) throw new Error('invalid Player Class');
	const defaults: TPlayer = {
		hand,
		fertilizers: sampleRange(),
		class: playerClass,
		beds,
		discardedCards,
		coins: sampleRange(),
		id: sampleRange().toString(),
	};
	return Object.assign(defaults, props ?? {});
}

export function playerRecordFixturePlayer(props: TPlayerRecord<TPlayer> = {}) {
	return Object.assign(playerRecordFixture(playerFixture), props ?? {});
}

export function playerRecordFixtureTurnContext(props: TPlayerRecord<TTurnContext> = {}) {
	const getRandomCurrentTurnPhase = () => {
		const [phase] = pickFromArray(Object.values(TTurnPhase).filter((v) => typeof v === 'number'));
		if (typeof phase !== 'number') throw new Error('invalid Turn Phase');
		return phase;
	};

	return Object.assign(
		playerRecordFixture(
			() =>
				({
					currentTurnPhase: getRandomCurrentTurnPhase(),
				} as TTurnContext)
		),
		props ?? {}
	);
}
