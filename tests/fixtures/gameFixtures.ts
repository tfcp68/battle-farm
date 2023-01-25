import {
	TGame,
	TGameContainer,
	TGamePhase,
	TTurnContainer,
} from '~/src/types/serializables/game';
import { TPlayerClass } from '~/src/types/serializables/players';
import { marketFixture } from './marketFixtures';
import { sampleRange } from '~/src/utils/sampleRange';
import arraySample from '../../src/utils/arraySample';
import { deckFixture } from './cardsFixtures';
import {
	playerRecordFixturePlayer,
	playerRecordFixtureTurnContext,
} from './playersFixture';

export function turnContainerFixture(
	props: Partial<TTurnContainer> = {}
): TTurnContainer {
	const currentTurn = arraySample(
		Object.values(TPlayerClass).filter((v) => typeof v === 'number')
	)[0];
	if (typeof currentTurn !== 'number')
		throw new Error('currentTurn is not a number');
	const defaults: TTurnContainer = {
		turnsPlayed: sampleRange(),
		currentTurn,
		state: playerRecordFixtureTurnContext(),
		turnOrder: null,
	};
	return { ...defaults, ...props };
}

export function gameFixture(props: Partial<TGame> = {}): TGame {
	const phase = arraySample(
		Object.values(TGamePhase).filter((v) => typeof v === 'number')
	)[0];

	if (typeof phase !== 'number') throw new Error('phase is not a number');

	const defaults: TGame = {
		uuid: sampleRange(),
		phase,
		winLimit: sampleRange(),
		players: playerRecordFixturePlayer(),
		deck: deckFixture(),
		market: marketFixture(),
	};
	return { ...defaults, ...props };
}

export function gameContainerFixture(
	props: Partial<TGameContainer> = {}
): TGameContainer {
	const defaults: TGameContainer = {
		...gameFixture(),
		turns: turnContainerFixture(),
	};
	return { ...defaults, ...props };
}
