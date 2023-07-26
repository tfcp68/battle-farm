import { TGame, TGameContainer, TGamePhase, TTurnContainer } from '~/src/types/serializables/game';
import { deckFixture } from './cardsFixtures';
import { marketFixture } from './marketFixtures';
import { playerRecordFixturePlayer, playerRecordFixtureTurnContext, randomPlayerClass } from './playersFixture';
import { sampleRange, pickFromArray } from '@yantrix/utils';

export function turnContainerFixture(props: Partial<TTurnContainer> = {}) {
	const currentTurn = randomPlayerClass();
	if (typeof currentTurn !== 'number') throw new Error('currentTurn is not a number');
	const defaults: TTurnContainer = {
		turnsPlayed: sampleRange(),
		currentTurn,
		state: playerRecordFixtureTurnContext(),
		turnOrder: null,
	};
	return Object.assign(defaults, props ?? {}) as TTurnContainer;
}

export function gameFixture(props: Partial<TGame> = {}) {
	const [phase] = pickFromArray(Object.values(TGamePhase).filter((v) => typeof v === 'number'));

	if (typeof phase !== 'number') throw new Error('phase is not a number');

	const defaults: TGame = {
		uuid: sampleRange(),
		phase,
		winLimit: sampleRange(),
		players: playerRecordFixturePlayer(),
		deck: deckFixture(),
		market: marketFixture(),
	};
	return Object.assign(defaults, props ?? {});
}

export function gameContainerFixture(props: Partial<TGameContainer> = {}) {
	const defaults: TGameContainer = {
		...gameFixture(),
		turns: turnContainerFixture(),
	};
	return Object.assign(defaults, props ?? {});
}
