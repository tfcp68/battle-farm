import {TGame, TGameContainer, TGamePhase, TTurnContainer} from "~/src/types/serializables/game";
import {TPlayerClass} from "~/src/types/serializables/players";
import { marketFixture } from '~/src/tests/fixtures/marketFixtures';
import {randomIntFromInterval } from '~/src/utils/randomIntFromInterval';
import arraySample from '~/src/utils/arraySample';

export function turnContainerFixture(props: Partial<TGameContainer> = {}) {
    const defaults: TTurnContainer = {
        turnsPlayed: randomIntFromInterval(),
        currentTurn: arraySample(Object.values(TPlayerClass))[0],
        state: {},
        turnOrder: null,
    }
    return {...defaults, ...props}
}

export function gameFixture(props: Partial<TGame> = {}):TGame{
    const defaults: TGame = {
        uuid: randomIntFromInterval(),
        phase: arraySample(Object.values(TGamePhase))[0],
        winLimit: randomIntFromInterval(),
        players:null,
        deck: [],
        market: marketFixture(),
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

