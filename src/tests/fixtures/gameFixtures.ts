import {TGame, TGameContainer, TGamePhase, TTurnContainer} from "~/src/types/serializables/game";
import {cardActionFixture} from "~/src/tests/fixtures/cardsFixtures";
import {TPlayerClass} from "~/src/types/serializables/players";

export function turnContainerFixture(props: Partial<TGameContainer> = {}) {
    const defaults: TTurnContainer = {
        turnsPlayed: 12,
        currentTurn: TPlayerClass.EMPTY,
        state: {},
        turnOrder: null,
    }
    return {...defaults, ...props}
}

export function gameFixture(props: Partial<TGame> = {}):TGame{
    const defaults: TGame = {
        uuid: 22,
        phase: TGamePhase.IN_PROGRESS,
        winLimit: 10,
        players:null,
        deck: [],
        market: [cardActionFixture(),cardActionFixture(),cardActionFixture(),cardActionFixture(),cardActionFixture(),cardActionFixture()],
    }
    return {...defaults, ...props}
}

export function gameContainerFixture(props: Partial<TGameContainer> = {}) {
    const defaults:TGameContainer = {
        ...gameFixture(),
        turns: turnContainerFixture(),
    }
    return {...defaults, ...props}
}

