import {
	type CardInstanceId,
	cropsOf,
	type EffectTarget,
	growingCrops,
	isCropDefinition,
	opponentsOf,
	plantTargetOf,
	type SelectionKind,
	selectionKindOf,
	type TargetKind,
} from '~/entities/game';
import { useFSM } from '@yantrix/react';
import { useMachines } from '~/app/providers/MachinesContext';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import { useMatch, useViewerId } from '~/app/yantrix/useGameModel';
import { statesDictionary as playStates } from '~/shared/lib/fsm/game/PlayingCardsAutomata';
import { definitionOf, CROP_COLORS } from '~/entities/game';

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
 * First legal target for a `TargetKind`, used so click + drag both commit in
 * one gesture. Mirrors `optionsFor` in `TargetOverlay.tsx` so the auto-pick
 * rule and the (now-defunct) overlay's option list never disagreed; the
 * overlay is gone in this iteration, but the rule is the same.
 */
function firstValidTarget(
	match: ReturnType<typeof useMatch>,
	viewerId: string,
	kind: TargetKind,
): EffectTarget | null {
	if (!match) return null;
	switch (kind) {
		case 'opponent': {
			const opp = opponentsOf(match, viewerId as never)[0];
			return opp ? { playerId: opp } : null;
		}
		case 'any_player': {
			const p = match.order[0];
			return p ? { playerId: p } : null;
		}
		case 'any_crop': {
			const c = growingCrops(match)[0];
			return c ? { playerId: c.playerId, bedIndex: c.bedIndex } : null;
		}
		case 'own_crop': {
			const c = cropsOf(match, viewerId as never)[0];
			return c ? { playerId: c.playerId, bedIndex: c.bedIndex } : null;
		}
		case 'any_bed': {
			for (const pid of match.order) {
				if (pid === viewerId) continue;
				if ((match.players[pid]?.beds ?? []).length > 0) {
					return { playerId: pid, bedIndex: 0 };
				}
			}
			return null;
		}
		case 'card_in_hand': {
			const c = match.players[viewerId as never]?.hand[0];
			return c ? { cardId: c } : null;
		}
		case 'card_in_discard': {
			const top = match.discard[match.discard.length - 1];
			return top ? { cardId: top } : null;
		}
		case 'crop_color':
			return { color: CROP_COLORS[0] };
		case 'none':
			return null;
	}
}

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
 *
 * **`pickBed` commits in one click.** A Crop whose `on_plant` ability asks for
 * a target used to land on the TargetOverlay after the bed click; now
 * `pickBed` follows `play_bed_picked` with an auto-picked `play_target_picked`
 * when the ability needs one. Both events are queued in the same tick — the
 * bus drains them together, React sees the final `PLAYED` state, and the
 * overlay never paints.
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
	const viewerId = useViewerId();
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
			if (!match || !cardId || !viewerId) return;
			const card = definitionOf(match, cardId);
			// pickBed is reachable only from PLANTING, which is crop-only — but
			// TypeScript can't see that, so guard explicitly.
			if (!isCropDefinition(card)) return;
			const targetKind = plantTargetOf(card);
			emitDomainEvent(MatchUiEvents.play_bed_picked, bedMeta(card, cardId, pickedBed));
			if (targetKind !== 'none') {
				const target = firstValidTarget(match, viewerId, targetKind);
				if (target) {
					emitDomainEvent(MatchUiEvents.play_target_picked, {
						cardId,
						bedIndex: pickedBed,
						target,
					});
				}
			}
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
