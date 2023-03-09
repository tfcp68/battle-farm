import { TCardId } from '~/src/types/serializables/cards';
import {
	CropCardId,
	TCropColor,
	TCropId,
} from '~/src/types/serializables/crops';

export const isCropId = (id: TCardId): id is TCropId =>
	Object.keys(CropCardId).includes(id);
export const isCropColor = (cropColor: any): cropColor is TCropColor =>
	Number.isFinite(cropColor) &&
	Object.values(TCropColor).includes(cropColor) &&
	cropColor !== 0;
