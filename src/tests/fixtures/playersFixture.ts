import { TPlayerRecord } from '~/src/types/shared';
import { TPlayer, TPlayerClass } from '~/src/types/serializables/players';
import { randomIntFromInterval } from '~/src/utils/randomIntFromInterval';
import arraySample from '~/src/utils/arraySample';
import { ActionOrCropCardFixture } from '~/src/tests/fixtures/cardsFixtures';
import { lengthArray } from '~/src/utils/lengthArray';

export function playerFixture(props:Partial<TPlayer> = {}) {

	const playerClass = arraySample(Object.values(TPlayerClass))[0]
	const handSize = randomIntFromInterval(0, 4)

	const hand = lengthArray(ActionOrCropCardFixture, handSize)

	const defaults:TPlayer = {
		hand,
		fertilizers:randomIntFromInterval(),
		class: playerClass,
		beds: [],
		discardedCards: [],
		coins: randomIntFromInterval(),
		id: randomIntFromInterval().toString(),
	}
	return {...defaults, ...props}
}

export function playersFixture(props: Partial<TPlayerRecord<TPlayer>> = {}) {
	const defaults: TPlayerRecord<TPlayer> = {
		0:{
			hand: [],
			fertilizers:0,
			class: 0,
			beds: [],
			discardedCards: [],
			coins: 0,
			id: "123",
		}
	}
	return {...defaults, ...props}
}

