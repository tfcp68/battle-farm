import {
	adjustFertilizers,
	adjustReapTimer,
	type GameModel,
	growingCrops,
	type PlayerId,
} from '../model';
import { applyCardAbility } from './abilities';
import { harvestCrop } from './harvest';

/**
 * FERTILIZE (`docs/rules.md` → Using Fertilizers): the active player rolls 1d4
 * and may spend up to that many fertilizers, each taking a turn off one crop's
 * Reap Timer. A crop driven to zero is harvested on the spot — and its bed
 * cannot be replanted this turn, which `clearBed` records.
 */
export function useFertilizer(model: GameModel, intent: { playerId: PlayerId; bedIndex: number }): GameModel {
	const { playerId, bedIndex } = intent;
	if (model.turn.phase !== 'FERTILIZE' || model.turn.activePlayerId !== playerId) return model;
	if ((model.turn.allowance ?? 0) <= 0) return model;
	if ((model.players[playerId]?.fertilizers ?? 0) <= 0) return model;

	const crop = growingCrops(model).find(
		(candidate) => candidate.playerId === playerId && candidate.bedIndex === bedIndex,
	);
	if (!crop) return model;

	let next = adjustFertilizers(model, playerId, -1);
	next = adjustReapTimer(next, playerId, bedIndex, -1);
	next = { ...next, turn: { ...next.turn, allowance: (next.turn.allowance ?? 1) - 1 } };

	// `Bake it Up` raises the crop's value, so it has to land before the payout.
	next = applyCardAbility(next, { playerId, cardId: crop.cardId, bedIndex, trigger: 'on_fertilize' });

	const ripened = growingCrops(next).find(
		(candidate) => candidate.playerId === playerId && candidate.bedIndex === bedIndex,
	);
	return ripened && ripened.reapTimer <= 0 ? harvestCrop(next, ripened) : next;
}
