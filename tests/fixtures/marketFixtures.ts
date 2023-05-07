import { MARKET_SIZE } from '~/src/types/serializables/game';
import { cardFixture } from './cardsFixtures';
import { sampleArray } from '~/src/automata/utils/fixtures';

export function marketFixture() {
	return sampleArray(cardFixture, MARKET_SIZE);
}
