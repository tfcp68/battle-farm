import { isActionCardId, isCropCardId } from '~/src/types/guards/cards';
import { ActionCardId, TActionId } from '~/src/types/serializables/actions';
import { TCardDescriptor, TCardId, TCardType } from '~/src/types/serializables/cards';
import { CropCardId, TCropId } from '~/src/types/serializables/crops';

function _getCardIDByType(card: TCardDescriptor<TCardType.ACTION>): TActionId | null;
function _getCardIDByType(card: TCardDescriptor<TCardType.CROP>): TCropId | null;
function _getCardIDByType<T extends TCardType>({ type, id }: TCardDescriptor<T>) {
	if (type === TCardType.ACTION)
		return Object.keys(ActionCardId)[Object.values(ActionCardId).indexOf(id)] as TCardId<TCardType.ACTION>;
	if (type === TCardType.CROP) return Object.keys(CropCardId)[Object.values(CropCardId).indexOf(id)] as TCropId;
	return null;
}

export const getCardIDByType = _getCardIDByType;
export const getCardTypeByID = (id: TCardId): TCardDescriptor<any> | null => {
	if (isCropCardId(id))
		return {
			id: CropCardId[id],
			type: TCardType.CROP,
		};
	if (isActionCardId(id))
		return {
			id: ActionCardId[id],
			type: TCardType.CROP,
		};
	return null;
};
