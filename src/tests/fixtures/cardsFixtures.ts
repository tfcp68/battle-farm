import {TCardType} from "~/src/types/serializables/cards";
import {ActionCardId, TActionCard} from "~/src/types/serializables/actions";
import {getCardIDByType} from "~/src/helpers/cards";

export function cardActionFixture(props: Partial<TActionCard> = {}): TActionCard {
    const defaults: TActionCard = {
        uuid: 0,
        type: TCardType.ACTION,
        id: getCardIDByType({type: TCardType.ACTION, id: ActionCardId.CLONE})!,
        value: 0,
    }
    return {...defaults, ...props}
}
