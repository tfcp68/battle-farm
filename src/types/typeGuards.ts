import {
	CropCardId,
	TCropCard,
	TCropId,
} from '~/src/types/serializables/crops';
import {
	ActionCardId,
	TActionCard,
	TActionId,
} from '~/src/types/serializables/actions';
import { TCard, TCardId, TCardType } from '~/src/types/serializables/cards';
import { TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { TTurnPhase, TTurnSubContext } from '~/src/types/fsm';

export const isCropCard = (card: TCard): card is TCropCard =>
	card?.type === TCardType.CROP;
export const isActionCard = (card: TCard): card is TActionCard =>
	card?.type === TCardType.ACTION;
export const isCropId = (id: TCardId): id is TCropId =>
	Object.keys(CropCardId).includes(id);
export const isActionId = (id: TCardId): id is TActionId =>
	Object.keys(ActionCardId).includes(id);
export const isFertilizeSubphase =
	<T extends TFertilizePhase>(targetSubphase: T) =>
	(currentSubphase: any): currentSubphase is T =>
		currentSubphase === targetSubphase;
export const isFertilizeContext =
	<T extends TFertilizePhase>(targetSubphase: T) =>
	(
		ctx: TTurnSubContext<TTurnPhase.FERTILIZE>
	): ctx is TTurnSubContext<TTurnPhase.FERTILIZE, T> =>
		ctx.subPhase === targetSubphase;

export const isCropCardId = (id: TCardId): id is TCardId<TCardType.CROP> =>
	Object.keys(CropCardId).includes(id);

export const isActionCardId = (id: TCardId): id is TCardId<TCardType.ACTION> =>
	Object.keys(ActionCardId).includes(id);
