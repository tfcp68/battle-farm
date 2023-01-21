import {describe, expect, test} from '@jest/globals';
import {TFertilizeAction, TFertilizePhase} from "~/src/types/fsm/slices/fertilize";
import {gameContainerFixture} from "~/src/tests/fixtures/gameFixtures";
import {reducer_Fertilize_IDLE, turnPhaseReducer_Fertilize} from "~/src/reducers/fertilize";

describe("reducer_Fertilize_IDLE", () => {

    test("with action HOVER should return index in context from payload", () => {
        expect(reducer_Fertilize_IDLE({
            action:TFertilizeAction.HOVER,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
        })
    });


    test("with action SKIP should return new context with another subPhase", () => {
        expect(reducer_Fertilize_IDLE({
            action:TFertilizeAction.SKIP,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{subPhase:TFertilizePhase.FINISHED},
        })
    });

    test("with action CHOOSE_CROP should return new context with another subPhase", () => {
        expect(reducer_Fertilize_IDLE({
            action:TFertilizeAction.CHOOSE_CROP,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{subPhase:TFertilizePhase.CROP_CONFIRM},
        })
    });

    test("with action RESET should return received {game, context}", () => {
        expect(reducer_Fertilize_IDLE({
            action:TFertilizeAction.RESET,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
        })
    });

    test("with action CROP_CONFIRM should return received {game, context}", () => {
        expect(reducer_Fertilize_IDLE({
            action:TFertilizeAction.RESET,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
        })
    });

    test("with action FERTILIZE should return received {game, context}", () => {
        expect(reducer_Fertilize_IDLE({
            action:TFertilizeAction.FERTILIZE,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
        })
    });

    test("with action CANCEL_SELECTION should return received {game, context}", () => {
        expect(reducer_Fertilize_IDLE({
            action:TFertilizeAction.CANCEL_SELECTION,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
        })
    });
})

describe('turnPhaseReducer_Fertilize',()=>{

    test('with action SKIP should return new context with another subPhase',()=>{
        expect(turnPhaseReducer_Fertilize({
            action:TFertilizeAction.SKIP,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{subPhase:TFertilizePhase.FINISHED},
        })
    })
    test('with action HOVER should return index in context from payload',()=>{
        expect(turnPhaseReducer_Fertilize({
            action:TFertilizeAction.HOVER,
            game:gameContainerFixture(),
            context:{index:5,subPhase:TFertilizePhase.IDLE},
            payload:{index:7},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:7,subPhase:TFertilizePhase.IDLE},
        })
    })
    test('with action CHOOSE_CROP should return new context with another subPhase',()=>{
        expect(turnPhaseReducer_Fertilize({
            action:TFertilizeAction.CHOOSE_CROP,
            game:gameContainerFixture(),
            context:{index:5,subPhase:TFertilizePhase.IDLE},
            payload:{index:7},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:7,subPhase:TFertilizePhase.CROP_CONFIRM},
        })
    })

    test("with action RESET should return received {game, context}", () => {
        expect(turnPhaseReducer_Fertilize({
            action:TFertilizeAction.RESET,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
        })
    });

    test("with action CROP_CONFIRM should return received {game, context}", () => {
        expect(turnPhaseReducer_Fertilize({
            action:TFertilizeAction.RESET,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
        })
    });

    test("with action FERTILIZE should return received {game, context}", () => {
        expect(turnPhaseReducer_Fertilize({
            action:TFertilizeAction.FERTILIZE,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
        })
    });

    test("with action CANCEL_SELECTION should return received {game, context}", () => {
        expect(turnPhaseReducer_Fertilize({
            action:TFertilizeAction.CANCEL_SELECTION,
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
            payload:{index:3},
        })).toMatchObject({
            game:gameContainerFixture(),
            context:{index:3,subPhase:TFertilizePhase.IDLE},
        })
    });

})