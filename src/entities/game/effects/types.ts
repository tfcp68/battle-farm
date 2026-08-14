import type { CropColor, EffectTrigger } from '../data';
import type { CardInstanceId, GameModel, PlayerId } from '../model';

/**
 * What the acting player pointed a card at. Which field matters follows from the
 * card's `TargetKind` (`../data/effects.ts`); an ability whose target is missing
 * or of the wrong shape must leave the model alone rather than guess.
 */
export interface EffectTarget {
	playerId?: PlayerId;
	bedIndex?: number;
	cardId?: CardInstanceId;
	color?: CropColor;
	marketSlot?: number;
}

/** Everything a card ability knows about the moment it fires. */
export interface AbilityContext {
	/** The player resolving it — the owner of the crop, or whoever played the card. */
	playerId: PlayerId;
	/** The card the ability belongs to. */
	cardId: CardInstanceId;
	/** Which of the card's triggers fired. `Sweet and Sour` fires on two. */
	trigger: EffectTrigger;
	/** Where the crop grows (or grew, for an on-harvest ability). */
	bedIndex?: number;
	target?: EffectTarget;
}

/**
 * One card's rules text as code: pure, total, and free to decline.
 *
 * Returning the model unchanged is a normal outcome — an ability whose
 * condition is unmet (`Radish Rally` without a second Wasabi) or whose target is
 * missing simply does nothing.
 */
export type CardAbility = (model: GameModel, context: AbilityContext) => GameModel;
