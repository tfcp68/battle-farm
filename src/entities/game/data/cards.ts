import { ACTION_DEFINITIONS, type ActionDefinition, type ActionId } from './actions';
import { CROP_DEFINITIONS, type CropDefinition, type CropId } from './crops';
import type { SelectionKind, TargetKind } from './effects';

/**
 * The single card registry: every Crop and Action definition under one lookup,
 * plus the composition of the standard Deck.
 *
 * A card is a discriminated union on `kind`, so code that needs crop-only fields
 * (color, ability) narrows once and TypeScript keeps it honest.
 */

export type CardDefId = CropId | ActionId;

export type CardDefinition = CropDefinition | ActionDefinition;

export const CARD_DEFINITIONS: Record<CardDefId, CardDefinition> = {
	...CROP_DEFINITIONS,
	...ACTION_DEFINITIONS,
};

export const CARD_DEF_IDS = Object.keys(CARD_DEFINITIONS) as CardDefId[];

export function isCropId(id: CardDefId): id is CropId {
	return Object.prototype.hasOwnProperty.call(CROP_DEFINITIONS, id);
}

export function isActionId(id: CardDefId): id is ActionId {
	return Object.prototype.hasOwnProperty.call(ACTION_DEFINITIONS, id);
}

export function isCropDefinition(def: CardDefinition): def is CropDefinition {
	return def.kind === 'crop';
}

export function isActionDefinition(def: CardDefinition): def is ActionDefinition {
	return def.kind === 'action';
}

/**
 * What the player must pick before this card can be played at all.
 *
 * A Crop Card always asks for a bed; an Action Card asks for whatever its rules
 * text names, which is often nothing. Two callers depend on this being one
 * function: the play-phase FSM, which branches on it, and the UI, which renders
 * the pick — and a disagreement between them would strand the selection.
 */
export function selectionKindOf(def: CardDefinition): SelectionKind {
	return isCropDefinition(def) ? 'bed_empty' : def.target;
}

/**
 * What a Crop asks for the moment it lands in a bed, if anything.
 *
 * An ability that fires `on_plant` resolves inside the same intent as the
 * planting, so its target has to be picked in the same breath — there is no
 * later moment to ask.
 */
export function plantTargetOf(def: CropDefinition): TargetKind {
	const { ability } = def;
	return ability.triggers.includes('on_plant') ? ability.target : 'none';
}

/**
 * Looks a definition up, throwing on an unknown id. Ids only enter the model
 * through this module or a validated snapshot, so an unknown one is a bug
 * rather than bad input — hence a throw and not a `null`.
 */
export function getCardDefinition(id: CardDefId): CardDefinition {
	const def = CARD_DEFINITIONS[id];
	if (!def) throw new Error(`Unknown card definition: ${String(id)}`);
	return def;
}

/** Market slots, refilled from the Deck as soon as a card is taken. */
export const MARKET_SIZE = 6;

/** Which cards the standard Deck holds, and how many of each. Class Cards are excluded. */
export const DECK_COMPOSITION: ReadonlyArray<{ defId: CardDefId; count: number }> = CARD_DEF_IDS
	.map((defId) => ({ defId, count: CARD_DEFINITIONS[defId].deckCount }))
	.filter((entry) => entry.count > 0);

/** Every card of the standard Deck, one entry per physical card, in definition order. */
export const DECK_CARD_IDS: readonly CardDefId[] = DECK_COMPOSITION.flatMap(({ defId, count }) =>
	Array.from({ length: count }, () => defId),
);

export const DECK_SIZE = DECK_CARD_IDS.length;

/**
 * Sum of `Card Value` over every Crop Card in the standard Deck — the term the
 * Win Limit formula calls "Total sum of Crop Card values in Deck".
 */
export const DECK_TOTAL_CROP_VALUE = DECK_COMPOSITION.reduce((total, { defId, count }) => {
	const def = CARD_DEFINITIONS[defId];
	return isCropDefinition(def) ? total + def.value * count : total;
}, 0);
