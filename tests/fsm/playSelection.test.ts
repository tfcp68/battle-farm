import { describe, expect, it } from '@jest/globals';
import {
	asCardInstanceId,
	CARD_DEFINITIONS,
	type CardDefinition,
	type CropDefinition,
	isCropDefinition,
	plantTargetOf,
	selectionKindOf,
} from '~/entities/game';
import PlayingCardsAutomata, {
	eventDictionary as playEvents,
	statesDictionary as playStates,
} from '~/shared/lib/fsm/game/PlayingCardsAutomata';
import TargetModeAutomata, {
	statesDictionary as targetStates,
} from '~/shared/lib/fsm/game/TargetModeAutomata';

/**
 * The PLAYING phase's two machines, driven exactly as the CoreLoop drives them:
 * both subscribe to the same five events and answer with different actions.
 *
 * The claim under test is that the *machine* decides how many picks a card
 * takes — one for a plain Action Card, two for a Crop, three for a Crop whose
 * ability fires on planting — and that `buildPlayIntent` ships the card at that
 * moment and no earlier.
 */

const CARD = asCardInstanceId('card-1');
const definition = (id: keyof typeof CARD_DEFINITIONS): CardDefinition => CARD_DEFINITIONS[id];

/** Narrowed at the call site so `plantTargetOf` gets what it asks for. */
function cropDefinition(id: keyof typeof CARD_DEFINITIONS): CropDefinition {
	const def = definition(id);
	if (!isCropDefinition(def)) throw new Error(`${String(id)} is not a Crop Card`);
	return def;
}

type Machine = PlayingCardsAutomata | TargetModeAutomata;

function dispatch(machines: Machine[], event: number, meta: Record<string, unknown> | null) {
	for (const machine of machines) {
		const actions = machine.eventAdapter?.handleEvent({ event, meta }) ?? [];
		for (const action of actions) machine.dispatch(action);
	}
}

/** A table where the viewer is mid-turn with a card in hand. */
function openPhase() {
	const play = new PlayingCardsAutomata();
	const target = new TargetModeAutomata();
	const both: Machine[] = [play, target];

	dispatch(both, playEvents.play_phase_started, { hand: [CARD] });
	return { play, target, both };
}

describe('the play-phase machines', () => {
	it('opens on the phase and closes with it', () => {
		const { play, target, both } = openPhase();
		expect(play.state).toBe(playStates.PLAYING);

		dispatch(both, playEvents.turn_phase_ended, null);
		expect(play.state).toBe(playStates.IDLE);
		expect(target.state).toBe(targetStates.IDLE);
	});

	it('stays shut when there is nothing to play', () => {
		const play = new PlayingCardsAutomata();
		dispatch([play], playEvents.play_phase_started, { hand: [] });
		expect(play.state).toBe(playStates.IDLE);
	});

	it('plays a no-target Action Card on the first click', () => {
		const { play, both } = openPhase();
		const card = definition('LUCKY_FIND');
		const meta = { cardId: CARD, cardKind: card.kind, targetKind: selectionKindOf(card) };

		dispatch(both, playEvents.play_card_picked, meta);

		expect(play.state).toBe(playStates.PLAYED);
	});

	it('holds an Action Card until its target is picked', () => {
		const { play, target, both } = openPhase();
		const card = definition('GARDEN_GOURMET');
		const picked = { cardId: CARD, cardKind: card.kind, targetKind: selectionKindOf(card) };

		dispatch(both, playEvents.play_card_picked, picked);

		expect(play.state).toBe(playStates.TARGETING);
		expect(target.state).toBe(targetStates.TARGETING);

		const targetMeta = { cardId: CARD, target: { playerId: 'p-2', bedIndex: 1 } };
		dispatch(both, playEvents.play_target_picked, targetMeta);

		expect(play.state).toBe(playStates.PLAYED);
		expect(target.state).toBe(targetStates.IDLE);
	});

	it('plants a Crop Card on the second click', () => {
		const { play, target, both } = openPhase();
		const card = cropDefinition('WHEAT');
		const picked = { cardId: CARD, cardKind: card.kind, targetKind: selectionKindOf(card) };

		dispatch(both, playEvents.play_card_picked, picked);

		expect(play.state).toBe(playStates.PLANTING);
		// Choosing a bed is a pick like any other, so the target machine names it.
		expect(target.state).toBe(targetStates.TARGETING);

		const bedMeta = { cardId: CARD, bedIndex: 2, targetKind: plantTargetOf(card) };
		dispatch(both, playEvents.play_bed_picked, bedMeta);

		expect(play.state).toBe(playStates.PLAYED);
		expect(target.state).toBe(targetStates.IDLE);
	});

	it('asks a Crop that fires on planting for its target too', () => {
		const { play, target, both } = openPhase();
		const card = cropDefinition('MANGO');
		dispatch(both, playEvents.play_card_picked, {
			cardId: CARD,
			cardKind: card.kind,
			targetKind: selectionKindOf(card),
		});

		const bedMeta = { cardId: CARD, bedIndex: 0, targetKind: plantTargetOf(card) };
		dispatch(both, playEvents.play_bed_picked, bedMeta);

		// The ability resolves inside the same intent, so the bed alone is not enough.
		expect(play.state).toBe(playStates.TARGETING);
		expect(target.state).toBe(targetStates.TARGETING);

		const targetMeta = { cardId: CARD, bedIndex: 0, target: { playerId: 'p-2' } };
		dispatch(both, playEvents.play_target_picked, targetMeta);

		expect(play.state).toBe(playStates.PLAYED);
	});

	/**
	 * The bed of the crop played a moment ago must not follow the next card: a
	 * stray `bedIndex` on an Action Card is a different move than the one asked
	 * for, and the host would resolve it.
	 */
	it('does not carry a bed from one card to the next', () => {
		const { play, both } = openPhase();
		const crop = cropDefinition('WHEAT');
		dispatch(both, playEvents.play_card_picked, {
			cardId: CARD,
			cardKind: crop.kind,
			targetKind: selectionKindOf(crop),
		});
		dispatch(both, playEvents.play_bed_picked, { cardId: CARD, bedIndex: 2, targetKind: 'none' });

		const action = definition('GARDEN_GOURMET');
		const second = asCardInstanceId('card-2');
		dispatch(both, playEvents.play_card_picked, {
			cardId: second,
			cardKind: action.kind,
			targetKind: selectionKindOf(action),
		});
		expect(play.state).toBe(playStates.TARGETING);

		const context = play.getContext()?.context as { bedIndex?: number };
		expect(context.bedIndex).toBe(-1);
	});

	it('drops the selection on cancel without playing anything', () => {
		const { play, target, both } = openPhase();
		const card = definition('GARDEN_GOURMET');
		dispatch(both, playEvents.play_card_picked, {
			cardId: CARD,
			cardKind: card.kind,
			targetKind: selectionKindOf(card),
		});
		expect(play.state).toBe(playStates.TARGETING);

		dispatch(both, playEvents.selection_cancelled, null);

		expect(play.state).toBe(playStates.PLAYING);
		expect(target.state).toBe(targetStates.IDLE);
	});
});

describe('target mode', () => {
	const enter = (targetKind: string) => {
		const target = new TargetModeAutomata();
		dispatch([target], playEvents.play_card_picked, { targetKind });
		return target;
	};

	const kindOf = (target: TargetModeAutomata) =>
		(target.getContext()?.context as { targetKind?: string } | null)?.targetKind ?? null;

	/**
	 * The kind is a string in the payload, so it is a string in the context. The
	 * diagram used to spend a state per kind, which meant a new entry in
	 * `SELECTION_KINDS` needed a state, a `define/`, an `ENABLE` edge and a
	 * `QUIT` edge before a card could even ask for it.
	 */
	it('holds every kind a card can ask for', () => {
		const kinds = [
			'any_crop',
			'own_crop',
			'any_bed',
			'any_player',
			'opponent',
			'card_in_hand',
			'card_in_discard',
			'crop_color',
			'bed_empty',
		];

		for (const kind of kinds) {
			const target = enter(kind);
			expect(target.state).toBe(targetStates.TARGETING);
			expect(kindOf(target)).toBe(kind);
		}
	});

	it('stays idle for a card that asks for nothing', () => {
		expect(enter('none').state).toBe(targetStates.IDLE);
	});

	it('switches kinds without passing through idle', () => {
		const target = enter('any_crop');
		dispatch([target], playEvents.play_bed_picked, { targetKind: 'opponent' });
		expect(target.state).toBe(targetStates.TARGETING);
		expect(kindOf(target)).toBe('opponent');
	});

	it('drops the kind when the pick is over', () => {
		const target = enter('any_crop');
		dispatch([target], playEvents.play_target_picked, null);
		expect(target.state).toBe(targetStates.IDLE);
	});
});
