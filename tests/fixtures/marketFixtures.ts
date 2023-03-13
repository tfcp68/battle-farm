import { MARKET_SIZE } from '~/src/types/serializables/game';
import { lengthArray } from '~/src/utils/lengthArray';
import { cardFixture } from './cardsFixtures';

export function marketFixture() {
	return lengthArray(cardFixture, MARKET_SIZE);
}
