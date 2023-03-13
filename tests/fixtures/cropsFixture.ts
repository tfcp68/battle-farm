import { getCardIDByType } from '~/src/helpers/cards';
import { TCardType } from '~/src/types/serializables/cards';
import { CropCardId, TBed, TCrop, TCropColor, TGardenBedType } from '~/src/types/serializables/crops';
import { sampleRange } from '~/src/utils/sampleRange';
import arraySample from '../../src/utils/arraySample';

export function cropFixture(props: Partial<TCrop> = {}) {
	const [id] = arraySample(Object.values(CropCardId));
	const namedID = getCardIDByType({ type: TCardType.CROP, id });
	const [group] = arraySample(Object.values(TCropColor).filter((v) => typeof v === 'number'));
	if (typeof group !== 'number') throw new Error('group is not a number');
	if (namedID === null) throw new Error('Card ID not found');
	const defaults: TCrop = {
		ripeTimer: sampleRange(),
		id: namedID,
		value: sampleRange(),
		fertilized: sampleRange(),
		group,
	};
	return Object.assign(defaults, props ?? {}) as TCrop;
}

export function bedFixture(props: Partial<TBed> = {}) {
	const [type] = arraySample(Object.values(TGardenBedType).filter((v) => typeof v === 'number'));
	const crop = cropFixture();
	const [cropOrNull] = arraySample([crop, null]);

	if (typeof type !== 'number') throw new Error('type is not a number');
	const defaults: TBed = {
		type,
		crop: cropOrNull,
	};
	return Object.assign(defaults, props ?? {}) as TBed;
}
