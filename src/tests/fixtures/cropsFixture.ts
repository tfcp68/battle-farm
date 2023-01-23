import { CropCardId, TBed, TCrop, TCropColor, TGardenBedType } from '~/src/types/serializables/crops';
import arraySample from '~/src/utils/arraySample';
import { randomIntFromInterval } from '~/src/utils/randomIntFromInterval';
import { getCardIDByType } from '~/src/helpers/cards';
import { TCardType } from '~/src/types/serializables/cards';

export function cropFixture(props: Partial<TCrop> = {}):TCrop{
	const id = arraySample(Object.values(CropCardId))[0]
	const namedID = getCardIDByType({type:TCardType.CROP, id})
	const group = arraySample(Object.values(TCropColor).filter((v) => typeof v === 'number'))[0]
	if (typeof group !== 'number')
		throw new Error('group is not a number')
	if (namedID === null)
		throw new Error("Card ID not found")
	const defaults: TCrop = {
		ripeTimer: randomIntFromInterval(),
		id: namedID,
		value: randomIntFromInterval(),
		fertilized: randomIntFromInterval(),
		group,
	}
	return {...defaults, ...props}
}

export function bedFixture(props: Partial<TBed> = {}):TBed{

	const type = arraySample(Object.values(TGardenBedType).filter((v)=>typeof v === 'number'))[0]
	const crop = cropFixture()
	const cropOrNull = arraySample([crop,null])[0]

	if (typeof type !== 'number')
		throw new Error('type is not a number')
	const defaults: TBed = {
		type,
		crop: cropOrNull,
	}
	return {...defaults, ...props}
}
