import { TCard, TCardType, TDeck } from '~/src/types/serializables/cards';
import { ActionCardId, TActionCard } from '~/src/types/serializables/actions';
import { getCardIDByType } from '~/src/helpers/cards';
import {
	CropCardId,
	TCropCard,
	TCropColor,
} from '~/src/types/serializables/crops';
import { sampleRange } from '~/src/utils/sampleRange';
import arraySample from '../../src/utils/arraySample';
import { lengthArray } from '~/src/utils/lengthArray';

export function actionCardFixture(props: Partial<TActionCard> = {}) {
	const [CardIdName] = arraySample(Object.values(ActionCardId));
	const id = getCardIDByType({ type: TCardType.ACTION, id: CardIdName });
	if (id === null) throw new Error('Card ID not found');
	const defaults: TActionCard = {
		uuid: sampleRange(0, 100),
		type: TCardType.ACTION,
		id,
		value: sampleRange(0, 100),
	};
	return Object.assign(defaults, props ?? {}) as TActionCard;
}

export function cropCardFixture(props: Partial<TCropCard> = {}) {
	const [cardIdName] = arraySample(Object.values(CropCardId));
	const [group] = arraySample(
		Object.values(TCropColor).filter((v) => typeof v === 'number')
	);
	const id = getCardIDByType({ type: TCardType.CROP, id: cardIdName });
	if (typeof group !== 'number') throw new Error('group is not a number');
	if (id === null) throw new Error('Card ID not found');
	const defaults: TCropCard = {
		fertilized: sampleRange(0, 100),
		group,
		ripeTimer: sampleRange(0, 100),
		uuid: sampleRange(0, 100),
		type: TCardType.CROP,
		id,
		value: sampleRange(0, 100),
	};
	return Object.assign(defaults, props ?? {}) as TCropCard;
}

export function cardFixture(): TCard {
	return arraySample([cropCardFixture, actionCardFixture])[0]();
}

export function deckFixture(deckSize?: number): TDeck {
	return lengthArray(cardFixture, deckSize || sampleRange(0, 10));
}
