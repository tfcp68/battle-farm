import { TTurnPhase } from '~/src/types/fsm';
import { TTurnContext } from '~/src/types/serializables/game';
import { TPlayer, TPlayerClass } from '~/src/types/serializables/players';
import { TPlayerRecord } from '~/src/types/shared';
import { isPlayerClass } from '~/src/types/typeGuards';
import arraySample from '~/src/utils/arraySample';
import { lengthArray } from '~/src/utils/lengthArray';
import { sampleRange } from '~/src/utils/sampleRange';
import { cardFixture } from './cardsFixtures';
import { bedFixture } from './cropsFixture';

export function randomPlayerClass() {
	return arraySample(Object.values(TPlayerClass).filter((v) => typeof v === 'number'))[0] as TPlayerClass;
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
	const hand = lengthArray(cardFixture, handLength);
	const discardedCardsLength = sampleRange(0, 8);
	const discardedCards = lengthArray(cardFixture, discardedCardsLength);
	const bedsLength = sampleRange(0, 8);
	const beds = lengthArray(bedFixture(), bedsLength);
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
		const [phase] = arraySample(Object.values(TTurnPhase).filter((v) => typeof v === 'number'));
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
