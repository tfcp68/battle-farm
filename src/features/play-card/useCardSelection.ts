import {
	type CardInstanceId,
	type EffectTarget,
	definitionOf,
	isCropDefinition,
	plantTargetOf,
	type SelectionKind,
	selectionKindOf,
} from '~/entities/game';
import { useFSM } from '@yantrix/react';
import { useMachines } from '~/app/providers/MachinesContext';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import { useMatch } from '~/app/yantrix/useGameModel';
import { statesDictionary as playStates } from '~/shared/lib/fsm/game/PlayingCardsAutomata';

/** What the page renders: which step of the play flow the local player is on. */
export type PlayStep = 'idle' | 'choosing' | 'planting' | 'targeting';

export interface PlaySelection {
	step: PlayStep;
	/** The card being played, if one is picked. */
	cardId: CardInstanceId | null;
	cardName: string | null;
	/** What is being picked right now, straight off the target-mode machine. */
	kind: SelectionKind | null;
	/** The bed a crop is going into, while its `on_plant` target is still open. */
	bedIndex: number | null;
}

interface PlayContext {
	cardId?: CardInstanceId | null;
	bedIndex?: number | null;
}

const STEP_BY_STATE: Record<number, PlayStep> = {
	[playStates.IDLE]: 'idle',
	[playStates.PLAYING]: 'choosing',
	// A card just landed and the next one may be picked from here: PLAYED is a
	// resting state, not a terminal one.
	[playStates.PLAYED]: 'choosing',
	[playStates.PLANTING]: 'planting',
	[playStates.TARGETING]: 'targeting',
};

/**
 * The PLAYING phase's selection, read from the two automata and driven by four
 * events.
 *
 * There is no local component state left: what used to be `useState<Selection>`
 * in `GamePage` is `PlayingCardsAutomata`'s state, and what used to be the
 * `targetKind` prop is `TargetModeAutomata`'s. The page renders the pair and
 * emits clicks; nothing else here decides anything.
 *
 * The card's *kind* travels in the event because the machine branches on it
 * (`isCropCard`) — the alternative, sending a precomputed verdict, would leave
 * the diagram describing a decision it no longer makes.
 */
export function useCardSelection(): PlaySelection & {
	pickCard: (cardId: CardInstanceId) => void;
	pickBed: (bedIndex: number) => void;
	/**
	 * Card and bed in one gesture, for a drag.
	 *
	 * Separate from `pickCard` + `pickBed` because those two cannot be called in
	 * the same tick: `pickBed` reads the card back out of the machine's context,
	 * and the machine has not seen the first event yet. A drag knows both halves
	 * up front, so it names them both.
	 */
	plantCard: (cardId: CardInstanceId, bedIndex: number) => void;
	pickTarget: (target: EffectTarget) => void;
	cancel: () => void;
} {
	const match = useMatch();
	const { play, target } = useMachines();
	const { state: playState, getContext } = useFSM<PlayContext>(play.instance);
	const { getContext: getTargetContext } = useFSM<{ targetKind?: string }>(target.instance);

	const context: PlayContext = getContext()?.context ?? {};
	const cardId = context.cardId ?? null;
	const bedIndex = typeof context.bedIndex === 'number' && context.bedIndex >= 0 ? context.bedIndex : null;

	// The kind arrives as a string and stays one: `TargetModeAutomata` holds it
	// in context rather than spending a state per kind. `'none'` is the
	// rulebook's way of saying "nothing to choose", and the machine's default —
	// the page wants `null` for that.
	const rawKind = getTargetContext()?.context?.targetKind;
	const kind = rawKind && rawKind !== 'none' ? (rawKind as SelectionKind) : null;

	/** A crop that fires as it lands must name its target in the same intent. */
	const bedMeta = (card: ReturnType<typeof definitionOf>, id: CardInstanceId, bed: number) => ({
		cardId: id,
		bedIndex: bed,
		targetKind: isCropDefinition(card) ? plantTargetOf(card) : ('none' as const),
	});

	return {
		step: STEP_BY_STATE[playState ?? -1] ?? 'idle',
		cardId,
		cardName: cardId && match ? definitionOf(match, cardId).name : null,
		kind,
		bedIndex,

		pickCard(pickedId: CardInstanceId) {
			if (!match) return;
			const card = definitionOf(match, pickedId);
			emitDomainEvent(MatchUiEvents.play_card_picked, {
				cardId: pickedId,
				// The machine branches on the discriminant alone; sending the whole
				// definition put a card's rules text through the bus and into a
				// machine's context, where nothing ever read it.
				cardKind: card.kind,
				targetKind: selectionKindOf(card),
			});
		},

		pickBed(pickedBed: number) {
			if (!match || !cardId) return;
			emitDomainEvent(MatchUiEvents.play_bed_picked, bedMeta(definitionOf(match, cardId), cardId, pickedBed));
		},

		plantCard(pickedId: CardInstanceId, pickedBed: number) {
			if (!match) return;
			const card = definitionOf(match, pickedId);
			// Two events, in order, exactly as two clicks would arrive. The bus
			// preserves the order it was given, so the machine still walks
			// PLAYING → PLANTING → PLAYED and no step is skipped.
			emitDomainEvent(MatchUiEvents.play_card_picked, {
				cardId: pickedId,
				cardKind: card.kind,
				targetKind: selectionKindOf(card),
			});
			emitDomainEvent(MatchUiEvents.play_bed_picked, bedMeta(card, pickedId, pickedBed));
		},

		pickTarget(picked: EffectTarget) {
			if (!cardId) return;
			emitDomainEvent(MatchUiEvents.play_target_picked, {
				cardId,
				...(bedIndex === null ? {} : { bedIndex }),
				target: picked,
			});
		},

		cancel() {
			emitDomainEvent(MatchUiEvents.selection_cancelled, null);
		},
	};
}
