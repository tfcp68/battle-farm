import { TCardType } from '~/src/types/serializables/cards';
import { ActionCardId, TActionCard } from '~/src/types/serializables/actions';
import { getCardIDByType } from '~/src/helpers/cards';
import { CropCardId, TCropCard, TCropColor } from '~/src/types/serializables/crops';
import {randomIntFromInterval } from '~/src/utils/randomIntFromInterval';
import arraySample from '~/src/utils/arraySample';

export function actionCardFixture(props: Partial<TActionCard> = {}): TActionCard {

    const CardIdName = arraySample(Object.values(ActionCardId))[0]

    const id = getCardIDByType({type: TCardType.ACTION, id: CardIdName})

    if (id === null)
        throw new Error("Card ID not found")

    const defaults: TActionCard = {
        uuid: randomIntFromInterval(0,100),
        type: TCardType.ACTION,
        id,
        value: randomIntFromInterval(0,100),
    }
    return {...defaults, ...props}
}

export function cropCardFixture(props: Partial<TCropCard> = {}): TCropCard {

    const CardIdName = arraySample(Object.values(CropCardId))[0]
    const group = arraySample(Object.values(TCropColor))[0]

    const id = getCardIDByType({type: TCardType.CROP, id: CardIdName})

    if (id === null)
        throw new Error("Card ID not found")

    const defaults: TCropCard = {
        fertilized: randomIntFromInterval(0,100),
        group,
        ripeTimer: randomIntFromInterval(0,100),
        uuid: randomIntFromInterval(0,100),
        type: TCardType.CROP,
        id,
        value: randomIntFromInterval(0,100),
    }
    return {...defaults, ...props}
}

export function ActionOrCropCardFixture(){
    return arraySample([cropCardFixture, actionCardFixture])[0]() as TCropCard | TActionCard
}

