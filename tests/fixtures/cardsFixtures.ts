import { getCardIDByType } from '~/src/helpers/cards';
import { isCropColor } from '~/src/types/guards/crops';
import { ActionCardId, TActionCard } from '~/src/types/serializables/actions';
import { TCard, TCardType, TDeck } from '~/src/types/serializables/cards';
import { CropCardId, TCropCard, TCropColor } from '~/src/types/serializables/crops';
import { sampleRange, pickFromArray, sampleArray } from '@yantrix/utils';

export function actionCardFixture(props: Partial<TActionCard> = {}) {
	const [CardIdName] = pickFromArray(Object.values(ActionCardId));
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
	const [cardIdName] = pickFromArray(Object.values(CropCardId));
	const [group] = pickFromArray(Object.values(TCropColor).filter((v) => typeof v === 'number'));
	const id = getCardIDByType({ type: TCardType.CROP, id: cardIdName });
	if (!isCropColor(group)) throw new Error('Group is invalid');
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
	return pickFromArray([cropCardFixture, actionCardFixture])[0]();
}

export function deckFixture(deckSize?: number): TDeck {
	return sampleArray(cardFixture, deckSize || sampleRange(0, 10));
}
