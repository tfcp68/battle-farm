/**
 * Vocabulary shared by every card ability: *when* it fires and *what the player
 * must pick* before it can resolve.
 *
 * Phase 1 only records these — the functions that read them live in the Effect
 * Matrix (`src/shared/lib/model`), which is phase 3. Keeping the vocabulary next
 * to the card data means the effect layer never re-reads `docs/rules.md`.
 */

export const EFFECT_TRIGGERS = [
	/** An Action Card was played, or a Class Card was activated. */
	'on_play',
	/** A Crop Card was planted into a bed. */
	'on_plant',
	/** A Crop was harvested (by the reap timer, a fertilizer or another card). */
	'on_harvest',
	/** A fertilizer was spent on this Crop. */
	'on_fertilize',
	/** Always in force while the Crop grows; not an event. */
	'passive',
] as const;

export type EffectTrigger = (typeof EFFECT_TRIGGERS)[number];

/**
 * What the acting player selects to resolve the card. Drives the target-mode
 * FSM (`src/shared/lib/fsm/diagrams/targetMode.mermaid`) and the UI overlay.
 *
 * `none` also covers cards that make a choice *while resolving* rather than
 * before (`Pollen Paradise` picks one of two drawn cards) — those are the
 * effect's business, not the targeting step's.
 */
export const TARGET_KINDS = [
	'none',
	/** Any growing Crop on the field, including your own. */
	'any_crop',
	/** A growing Crop in one of your own beds. */
	'own_crop',
	/** Any Garden Bed on the field. */
	'any_bed',
	/** Any Player, including yourself. */
	'any_player',
	/** Any Player except yourself. */
	'opponent',
	/** A Card in your own Hand. */
	'card_in_hand',
	/** A Card you previously discarded. */
	'card_in_discard',
	/** One of the three Crop colors. */
	'crop_color',
] as const;

export type TargetKind = (typeof TARGET_KINDS)[number];

/**
 * What the player is picking right now — every {@link TargetKind} plus the one
 * pick that belongs to the interaction rather than to a card.
 *
 * `bed_empty` is planting: no ability asks for it, but the target-mode FSM has
 * to name it like any other, since choosing a bed for a Crop Card is the same
 * step of the same flow as choosing a victim for an Action Card.
 */
export const SELECTION_KINDS = [...TARGET_KINDS, 'bed_empty'] as const;

export type SelectionKind = (typeof SELECTION_KINDS)[number];
