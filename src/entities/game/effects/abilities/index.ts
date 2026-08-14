import type { CardDefId, EffectTrigger } from '../../data';
import { getCardDefinition, isCropDefinition } from '../../data';
import type { GameModel } from '../../model';
import type { AbilityContext, CardAbility } from '../types';
import { ACTION_ABILITIES } from './actions';
import { CROP_ABILITIES } from './crops';

export { collectAllCropsOf } from './crops';

/**
 * Every card whose rules text does something, keyed by definition id.
 *
 * `Partial` on purpose: a card without an entry is still a perfectly good card —
 * it is bought, planted and harvested like any other, its text simply does not
 * fire. `tests/game/abilities.test.ts` pins down exactly which cards those are,
 * so the gap stays visible instead of quietly growing.
 */
export const CARD_ABILITIES: Partial<Record<CardDefId, CardAbility>> = {
	...CROP_ABILITIES,
	...ACTION_ABILITIES,
};

/** Cards whose text is handled outside the registry, with where to find it. */
export const ABILITIES_HANDLED_ELSEWHERE: Partial<Record<CardDefId, string>> = {
	TOMATO: 'passiveCropValueBonus — always-on, applied to the payout rather than fired by a trigger',
};

/** Does this card's ability fire on that trigger? */
export function firesOn(defId: CardDefId, trigger: EffectTrigger): boolean {
	const definition = getCardDefinition(defId);
	if (isCropDefinition(definition)) return definition.ability.triggers.includes(trigger);
	return trigger === 'on_play';
}

/**
 * Runs a card's ability if it has one and the trigger matches.
 *
 * Unknown cards and mismatched triggers are not errors — most cards do nothing
 * on most triggers.
 */
export function applyCardAbility(model: GameModel, context: AbilityContext): GameModel {
	const defId = model.cards[context.cardId]?.defId;
	if (!defId || !firesOn(defId, context.trigger)) return model;

	const ability = CARD_ABILITIES[defId];
	return ability ? ability(model, context) : model;
}
