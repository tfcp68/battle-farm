import { cardFixture } from './cardsFixtures';
import { MARKET_SIZE } from '~/src/types/serializables/game';
import { lengthArray } from '~/src/utils/lengthArray';

export function marketFixture() {
	return lengthArray(cardFixture, MARKET_SIZE);
}
