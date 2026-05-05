import { ActionCardId, TActionCard } from '~/shared/types/serializables/actions';
import { TCard, TCardId, TCardType } from '~/shared/types/serializables/cards';
import { CropCardId, TCropCard } from '~/shared/types/serializables/crops';

export const isCropCard = (card: TCard): card is TCropCard => card?.type === TCardType.CROP;
export const isActionCard = (card: TCard): card is TActionCard => card?.type === TCardType.ACTION;
export const isCropCardId = (id: any): id is TCardId<TCardType.CROP> => Object.keys(CropCardId).includes(id);
export const isActionCardId = (id: any): id is TCardId<TCardType.ACTION> => Object.keys(ActionCardId).includes(id);
