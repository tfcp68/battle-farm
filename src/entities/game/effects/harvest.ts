import { adjustReapTimer, cropsOf, type GameModel, type GrowingCrop, growingCrops, type PlayerId, ripeCropsOf } from '../model';
import { applyCardAbility } from './abilities';
import { collectCrop } from './helpers';

/**
 * HARVEST (`docs/rules.md` → Turn Sequence, step 1): every crop in the active
 * player's beds loses a turn off its Reap Timer, and the ones that reach zero
 * are collected.
 */

/** Pays a crop out and fires its on-harvest ability. */
export function harvestCrop(model: GameModel, crop: GrowingCrop): GameModel {
	const collected = collectCrop(model, crop);
	return applyCardAbility(collected, {
		playerId: crop.playerId,
		cardId: crop.cardId,
		bedIndex: crop.bedIndex,
		trigger: 'on_harvest',
	});
}

/**
 * The whole phase for one player.
 *
 * Abilities that need a target (`Pineapple Punch`, `Ripe for the Picking`) get
 * none here and so decline: the harvest is automatic, and there is no
 * interactive targeting step until phase 5.
 */
export function runHarvest(model: GameModel, playerId: PlayerId): GameModel {
	let next = cropsOf(model, playerId).reduce(
		(acc, crop) => adjustReapTimer(acc, crop.playerId, crop.bedIndex, -1),
		model,
	);

	// Each payout can move the field around, so the ripe crops are re-read by
	// position rather than carried over from before the tick.
	for (const ripe of ripeCropsOf(next, playerId)) {
		const current = growingCrops(next).find(
			(crop) => crop.playerId === ripe.playerId && crop.bedIndex === ripe.bedIndex,
		);
		if (current && current.reapTimer <= 0) next = harvestCrop(next, current);
	}
	return next;
}
