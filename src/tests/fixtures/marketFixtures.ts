import { ActionOrCropCardFixture } from '~/src/tests/fixtures/cardsFixtures';
import { LengthArray } from '~/src/types/shared';
import { TCard } from '~/src/types/serializables/cards';
import { MARKET_SIZE } from '~/src/types/serializables/game';
import { lengthArray } from '~/src/utils/lengthArray';

export function marketFixture(){

	return lengthArray(()=>ActionOrCropCardFixture(), MARKET_SIZE) as LengthArray<TCard, typeof MARKET_SIZE>
}