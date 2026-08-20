import { useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/react';
import {
	CROP_COLORS,
	cropsOf,
	definitionOf,
	type EffectTarget,
	growingCrops,
	isCropDefinition,
	opponentsOf,
	plantTargetOf,
	selectionKindOf,
	type GameModel,
	type PlayerId,
	type TargetKind,
} from '~/entities/game';
import { useBuyCard } from '~/features/buy-card/useBuyCard';
import { useCardSelection } from '~/features/play-card/useCardSelection';
import { useTradeCards } from '~/features/trade-cards/useTradeCards';
import { useMatch, useViewerId } from '~/app/yantrix/useGameModel';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { MatchUiEvents } from '~/app/yantrix/matchUiEvents';
import { parseDragSource, parseDropZone, resolveDrop } from './dragModel';

/**
 * Picks the first valid target for a `TargetKind`, used when a drag commits in
 * one gesture. Returns `null` when no option exists — in that case the call site
 * skips the `play_target_picked` event and the overlay is allowed to show, so a
 * player can still rescue a drop onto a card with no legal pick.
 *
 * The rules of every kind live in `optionsFor()` in `TargetOverlay.tsx`; this
 * mirrors them so the two never disagree.
 */
function firstValidTarget(
	match: GameModel,
	viewerId: PlayerId,
	kind: TargetKind,
): EffectTarget | null {
	switch (kind) {
		case 'opponent': {
			const opp = opponentsOf(match, viewerId)[0];
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
			const c = cropsOf(match, viewerId)[0];
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
			const c = match.players[viewerId]?.hand[0];
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
 * Turns a finished drag into the same events a click would have produced.
 *
 * There is no drag-specific path into the game for the legs that don't need a
 * pick — Trade toggle and Shopping slot pick go through their feature hooks
 * unchanged. The two legs that *do* pick a target (`plant` for crops, `play`
 * for action cards) instead emit the full sequence synchronously and let a
 * helper pick the first legal target, so a drop commits in one gesture.
 *
 * Picking on the user's behalf is a deliberate UX trade: the click flow stays
 * available for a careful card-by-card pick, the drag flow is the "I just want
 * this resolved" path. A drop with no legal target (Mango with no opponents,
 * `Land Reclamation` with an empty discard) is left to the overlay.
 */
export function useCardDragDrop(): { onDragEnd: (event: DragEndEvent) => void } {
	const selection = useCardSelection();
	const trade = useTradeCards();
	const shopping = useBuyCard();
	const match = useMatch();
	const viewerId = useViewerId();

	const { offered } = trade;

	const onDragEnd = useCallback(
		(event: DragEndEvent) => {
			if (event.canceled) return;

			const { source, target } = event.operation;
			if (!source || !target) return;

			const from = parseDragSource(source.type, source.data);
			const to = parseDropZone(target.id);
			if (!from || !to) return;

			const intent = resolveDrop(from, to);
			if (!intent) return;

			switch (intent.kind) {
				case 'plant': {
					if (!match || !viewerId) {
						// Fallback: emit the two-step click equivalent so the
						// machine is reached even when the model/viewer aren't
						// mounted yet (early drop during HMR).
						selection.plantCard(intent.cardId, intent.bedIndex);
						return;
					}

					const card = definitionOf(match, intent.cardId);
					if (!isCropDefinition(card)) {
						selection.plantCard(intent.cardId, intent.bedIndex);
						return;
					}

					// Two events for the bed pick + a third for the target when the
					// ability asks for one. All three queued in the same tick —
					// the bus processes them together, so React sees the final
					// PLAYED state and the overlay never paints.
					emitDomainEvent(MatchUiEvents.play_card_picked, {
						cardId: intent.cardId,
						cardKind: card.kind,
						targetKind: selectionKindOf(card),
					});
					const targetKind = plantTargetOf(card);
					emitDomainEvent(MatchUiEvents.play_bed_picked, {
						cardId: intent.cardId,
						bedIndex: intent.bedIndex,
						targetKind,
					});
					if (targetKind !== 'none') {
						const target = firstValidTarget(match, viewerId, targetKind);
						if (target) {
							emitDomainEvent(MatchUiEvents.play_target_picked, {
								cardId: intent.cardId,
								bedIndex: intent.bedIndex,
								target,
							});
						}
					}
					return;
				}
				case 'play': {
					if (!match || !viewerId) {
						selection.pickCard(intent.cardId);
						return;
					}
					const card = definitionOf(match, intent.cardId);
					const targetKind = selectionKindOf(card);

					emitDomainEvent(MatchUiEvents.play_card_picked, {
						cardId: intent.cardId,
						cardKind: card.kind,
						targetKind,
					});
					if (targetKind !== 'none' && targetKind !== 'bed_empty') {
						const target = firstValidTarget(match, viewerId, targetKind);
						if (target) {
							emitDomainEvent(MatchUiEvents.play_target_picked, {
								cardId: intent.cardId,
								target,
							});
						}
					}
					return;
				}
				case 'offer':
					// Dropping means *add*. The toggle belongs to the click, where
					// hitting the same card twice is how a player changes their mind.
					if (!offered.includes(intent.cardId)) trade.toggleCard(intent.cardId);
					return;
				case 'pickSlot':
					shopping.pickSlot(intent.slotIndex);
					return;
			}
		},
		[match, viewerId, selection, trade, shopping, offered],
	);

	return { onDragEnd };
}
