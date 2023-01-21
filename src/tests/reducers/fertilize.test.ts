import {describe, expect, test} from '@jest/globals';
import {TFertilizeAction, TFertilizePhase} from "~/src/types/fsm/slices/fertilize";
import {gameContainerFixture} from "~/src/tests/fixtures/gameFixtures";
import {reducer_Fertilize_IDLE} from "~/src/reducers/fertilize";

describe("fertilize.ts", () => {

    test("reducer_Fertilize_IDLE with action HOVER must return index in payload", () => {
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


    test("reducer_Fertilize_IDLE with action SKIP must return another subPhase", () => {
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

    test("reducer_Fertilize_IDLE with action CHOOSE_CROP must return another subPhase", () => {
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

    test("reducer_Fertilize_IDLE with action RESET should do nothing", () => {
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

    test("reducer_Fertilize_IDLE with action FERTILIZE should do nothing", () => {
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

    test("reducer_Fertilize_IDLE with action CANCEL_SELECTION should do nothing", () => {
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
