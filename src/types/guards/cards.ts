import { ActionCardId, TActionCard } from '~/src/types/serializables/actions';
import { TCard, TCardId, TCardType } from '~/src/types/serializables/cards';
import { CropCardId, TCropCard } from '~/src/types/serializables/crops';

export const isCropCard = (card: TCard): card is TCropCard => card?.type === TCardType.CROP;
export const isActionCard = (card: TCard): card is TActionCard => card?.type === TCardType.ACTION;
export const isCropCardId = (id: TCardId): id is TCardId<TCardType.CROP> => Object.keys(CropCardId).includes(id);
export const isActionCardId = (id: TCardId): id is TCardId<TCardType.ACTION> => Object.keys(ActionCardId).includes(id);
