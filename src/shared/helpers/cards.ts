import { ActionCardId, TActionId } from '~/shared/types/serializables/actions';
import { TCardDescriptor, TCardId, TCardType } from '~/shared/types/serializables/cards';
import { CropCardId, TCropId } from '~/shared/types/serializables/crops';
import { isActionCardId, isCropCardId } from '~/shared/types/guards/cards';

function isActionId(k: string): k is TActionId {
	return Object.prototype.hasOwnProperty.call(ActionCardId, k);
}

function isCropId(k: string): k is TCropId {
	return Object.prototype.hasOwnProperty.call(CropCardId, k);
}

function _getCardIDByType(card: TCardDescriptor<TCardType.ACTION>): TActionId | null;
function _getCardIDByType(card: TCardDescriptor<TCardType.CROP>): TCropId | null;
function _getCardIDByType<T extends TCardType>({ type, id }: TCardDescriptor<T>) {
	if (type === TCardType.ACTION) {
		const keys = Object.keys(ActionCardId);
		const values = Object.values(ActionCardId);
		const index = values.indexOf(id);
		if (index < 0) return null;
		const key = keys[index];
		if (!key || !isActionId(key)) return null;
		return key;
	}
	if (type === TCardType.CROP) {
		const keys = Object.keys(CropCardId);
		const values = Object.values(CropCardId);
		const index = values.indexOf(id);
		if (index < 0) return null;
		const key = keys[index];
		if (!key || !isCropId(key)) return null;
		return key;
	}
	return null;
}

export const getCardIDByType = _getCardIDByType;
export const getCardTypeByID = (id: TCardId): TCardDescriptor<TCardType> | null => {
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
