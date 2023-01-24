import { TPlayerRecord } from '~/src/types/shared';
import { TPlayer, TPlayerClass } from '~/src/types/serializables/players';
import { randomIntFromInterval } from '~/src/utils/randomIntFromInterval';
import arraySample from '~/src/utils/arraySample';
import { ActionOrCropCardFixture } from '~/src/tests/fixtures/cardsFixtures';
import { lengthArray } from '~/src/utils/lengthArray';
import { bedFixture } from '~/src/tests/fixtures/cropsFixture';
import { TTurnContext } from '~/src/types/serializables/game';
import { TTurnPhase } from '~/src/types/fsm';

export function playerFixture(props:Partial<TPlayer> = {}):TPlayer {
	const playerClass = arraySample(Object.values(TPlayerClass).filter((v) => typeof v === 'number'))[0]
	const handLength = randomIntFromInterval(0, 8)
	const hand = lengthArray(ActionOrCropCardFixture, handLength)
	const discardedCardsLength = randomIntFromInterval(0, 8)
	const discardedCards = lengthArray(ActionOrCropCardFixture, discardedCardsLength)
	const bedsLength = randomIntFromInterval(0, 8)
	const beds = lengthArray(bedFixture, bedsLength)
	if (typeof playerClass !== 'number')
		throw new Error('playerClass is not a number')
	const defaults:TPlayer = {
		hand,
		fertilizers:randomIntFromInterval(),
		class: playerClass,
		beds,
		discardedCards,
		coins: randomIntFromInterval(),
		id: randomIntFromInterval().toString(),
	}
	return {...defaults, ...props}
}

export function playerRecordFixturePlayer(props: Partial<TPlayerRecord<TPlayer>> = {}):TPlayerRecord<TPlayer> {
	const defaults:TPlayerRecord<TPlayer> = {
		0: playerFixture(),
		1: playerFixture(),
		2: playerFixture(),
		3: playerFixture(),
		4: playerFixture(),
		5: playerFixture(),
		6: playerFixture(),
	}
	return {...defaults, ...props}
}

export function playerRecordFixtureTurnContext(props: Partial<TPlayerRecord<TTurnContext>> = {}):TPlayerRecord<TTurnContext> {
	const getRandomCurrentTurnPhase = () => {
		let phase = arraySample(Object.values(TTurnPhase).filter((v) => typeof v === 'number'))[0];
		if (typeof phase !== 'number')
			throw new Error('phase is not a number')
		return phase
	}

	const defaults:TPlayerRecord<TTurnContext> = {
		0:{
			currentTurnPhase: getRandomCurrentTurnPhase(),
		},
		1:{
			currentTurnPhase: getRandomCurrentTurnPhase(),
		},
		2:{
			currentTurnPhase: getRandomCurrentTurnPhase(),
		},
		3:{
			currentTurnPhase: getRandomCurrentTurnPhase(),
		},
		4:{
			currentTurnPhase: getRandomCurrentTurnPhase(),
		},
		5:{
			currentTurnPhase: getRandomCurrentTurnPhase(),
		},
		6:{
			currentTurnPhase: getRandomCurrentTurnPhase(),
		}
	}
	return {...defaults, ...props}
}



