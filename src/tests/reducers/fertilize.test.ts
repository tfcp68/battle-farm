import { describe, expect, test } from '@jest/globals';
import { TFertilizeAction, TFertilizePhase } from '~/src/types/fsm/slices/fertilize';
import { gameContainerFixture } from '~/src/tests/fixtures/gameFixtures';
import { reducer_Fertilize_IDLE, turnPhaseReducer_Fertilize } from '~/src/reducers/fertilize';
import { TTurnPhase, TTurnSubContext, TTurnSubPayload } from '~/src/types/fsm';


type testBody = {
    readonly msg:string,
    readonly dt: {
        action: TFertilizeAction,
        game: ReturnType<typeof gameContainerFixture>,
        context: ReturnType<typeof defaultContextFixture>,
        payload: ReturnType<typeof defaultPayloadFixture>
    }
    readonly res: {
        game: ReturnType<typeof gameContainerFixture>,
        context: Partial<TTurnSubContext<TTurnPhase.FERTILIZE, TFertilizePhase.IDLE | TFertilizePhase.CROP_CONFIRM | TFertilizePhase.FINISHED>>
    }
}

function defaultParams(){
    return {
        action: TFertilizeAction.HOVER,
        game: gameContainerFixture(),
        context: defaultContextFixture(),
        payload: defaultPayloadFixture()
    }
}

function defaultContextFixture(props:Partial<TTurnSubContext<TTurnPhase.FERTILIZE, TFertilizePhase.IDLE >> = {}){
    const defaults:TTurnSubContext<TTurnPhase.FERTILIZE,TFertilizePhase.IDLE> = {
        index:3,
        subPhase:TFertilizePhase.IDLE
    }
    return {...defaults, ...props}
}

function defaultPayloadFixture(props: Partial<TTurnSubPayload<any>> = {}){
    const defaults:TTurnSubPayload<any> = {
    index:9
    }
    return {...defaults, ...props}
}




describe("reducer_Fertilize_IDLE", () => {

    function makeTest(tests:testBody[]){
        for (let i = 0; i < tests.length; i++) {
            test(tests[i]?.msg, () => {
                expect(reducer_Fertilize_IDLE(tests[i].dt)).toMatchObject(tests[i].res);
            });
        }
    }

    const tests:testBody[] = [
        {
            msg: "with action HOVER should return index in context from payload",
            dt: {
                ...defaultParams(),
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                    index:9,
                },
                game: gameContainerFixture()
            }
        },
        {
            msg: "with action SKIP should return new context with another subPhase without index",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.SKIP
            },
            res:{
                context: {
                    subPhase: TFertilizePhase.FINISHED
                },
                game: gameContainerFixture()
            }
        },
        {
            msg: "with action CHOOSE_CROP should return new context with another subPhase",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.CHOOSE_CROP
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                    index:9,
                    subPhase: TFertilizePhase.CROP_CONFIRM
                },
                game: gameContainerFixture()
            }
        },
        {
            msg: "with action CROP_CONFIRM should return defaultContextFixture",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.FERTILIZE
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                },
                game: gameContainerFixture()
            }
        },
        {
            msg: "with action CANCEL_SELECTION should return defaultContextFixture",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.CANCEL_SELECTION
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                },
                game: gameContainerFixture()
            }
        },
        {
            msg: "with action RESET should return defaultContextFixture",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.RESET
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                },
                game: gameContainerFixture()
            }
        },
    ]
    makeTest(tests);


})

describe('turnPhaseReducer_Fertilize',()=>{

    function makeTest(tests:testBody[]){
        for (let i = 0; i < tests.length; i++) {
            test(tests[i]?.msg, () => {
                expect(turnPhaseReducer_Fertilize(tests[i].dt)).toMatchObject(tests[i].res);
            });
        }
    }
    const tests:testBody[] = [
        {
            msg: "with action SKIP should return new context with another subPhase",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.SKIP,
            },
            res:{
                context: {
                    subPhase: TFertilizePhase.FINISHED
                },
                game:gameContainerFixture()
            }
        },
        {
            msg: "with action RESET should return defaultContextFixture",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.RESET,
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                },
                game:gameContainerFixture()
            }
        },
        {
            msg: "with action FERTILIZE should return defaultContextFixture",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.FERTILIZE,
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                },
                game:gameContainerFixture()
            }
        },
        {
            msg: "with action CHOOSE_CROP should return new context with another subPhase & index",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.CHOOSE_CROP,
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                    subPhase: TFertilizePhase.CROP_CONFIRM,
                    index:9,
                },
                game:gameContainerFixture()
            }
        },
        {
            msg: "with action HOVER should return new context with another index",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.HOVER,
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                    index:9,
                },
                game:gameContainerFixture()
            }
        },
        {
            msg: "with action CANCEL_SELECTION should return defaultContextFixture",
            dt: {
                ...defaultParams(),
                action: TFertilizeAction.CANCEL_SELECTION,
            },
            res:{
                context: {
                    ...defaultContextFixture(),
                },
                game:gameContainerFixture()
            }
        },
    ]

    makeTest(tests);
})