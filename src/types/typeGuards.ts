import { CropCardId, TCropId } from '~/src/types/crops';
import { ActionCardId, TActionId } from '~/src/types/actions';
import {
	TActionCard,
	TCard,
	TCardId,
	TCardType,
	TCropCard,
} from '~/src/types/cards';

export const isCropCard = (card: TCard): card is TCropCard =>
	card?.type === TCardType.CROP;
export const isActionCard = (card: TCard): card is TActionCard =>
	card?.type === TCardType.ACTION;
export const isCropId = (id: TCardId): id is TCropId =>
	Object.keys(CropCardId).includes(id);
export const isActionId = (id: TCardId): id is TActionId =>
	Object.keys(ActionCardId).includes(id);
