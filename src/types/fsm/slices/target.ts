import { TTurnBasedDispatch } from '~/src/types/fsm';
import { TPlayerIndex, TTargetIndex } from '~/src/types/fsm/shared';
import { TCard } from '~/src/types/serializables/cards';
import { TBed, TCrop, TCropColor, TWithCropColor } from '~/src/types/serializables/crops';
import { TPlayer, TPlayerTarget } from '~/src/types/serializables/players';
import { TGame } from '../../serializables/game';

export enum TTargetMode {
	INIT,
	FOE,
	PLAYER,
	BED_FOE,
	BED_OWN,
	BED_EMPTY,
	BED_ANY,
	CROP_FOE,
	CROP_OWN,
	CROP_ANY,
	CARD_OWN,
	CARD_MARKET,
	CARD_DISCARDED,
	CROP_COLOR,
}

export enum TTargetAction {
	INIT,
	HOVER,
	CHOOSE_CARD,
	CHOOSE_PLAYER,
	CHOOSE_BED,
	CHOOSE_CROP,
	CHOOSE_MARKET_SLOT,
	CHOOSE_COLOR,
	QUIT,
}

export type TWithTargetMode<T extends TTargetMode = TTargetMode> = {
	targetMode: T | null;
};

export type TWithTargetOptions<T extends TTargetMode = TTargetMode> = TWithTargetMode<T> & {
	targetLimit?: number; // amount of targets to be set
	skipDispatch?: TTurnBasedDispatch<any>; // if set, the target mode can be quit voluntarily
	confirmDispatch?: TTurnBasedDispatch<any>; // action creator to call when the target is chosen
	cancelDispatch?: TTurnBasedDispatch<any>; // if set, the target choice must be confirmed, and failing to do so triggers this action creator
	effects?: Array<TTargetReducer<T>>; // a set of side effects that are applied on the chosen target
};

export type TTargetRelatedDict = {
	[TTargetMode.INIT]: never;
	[TTargetMode.FOE]: TPlayer;
	[TTargetMode.PLAYER]: TPlayer;
	[TTargetMode.BED_ANY]: TBed;
	[TTargetMode.BED_OWN]: TBed;
	[TTargetMode.BED_EMPTY]: TBed;
	[TTargetMode.BED_FOE]: TBed;
	[TTargetMode.CARD_DISCARDED]: TCard;
	[TTargetMode.CARD_OWN]: TCard;
	[TTargetMode.CARD_MARKET]: TCard;
	[TTargetMode.CROP_ANY]: TCrop;
	[TTargetMode.CROP_FOE]: TCrop;
	[TTargetMode.CROP_OWN]: TCrop;
	[TTargetMode.CROP_COLOR]: TCropColor;
};

export type TRelatedTarget<T extends TTargetMode> = TTargetRelatedDict[T];

export type TTargetTypedContext<T extends TTargetMode> = T extends TTargetMode.FOE
	? TPlayerTarget
	: T extends TTargetMode.PLAYER
	? TPlayerTarget
	: T extends TTargetMode.BED_ANY
	? TPlayerIndex
	: T extends TTargetMode.BED_EMPTY
	? TPlayerIndex
	: T extends TTargetMode.BED_OWN
	? TPlayerIndex
	: T extends TTargetMode.BED_FOE
	? TPlayerIndex
	: T extends TTargetMode.CROP_ANY
	? TPlayerIndex
	: T extends TTargetMode.CROP_FOE
	? TPlayerIndex
	: T extends TTargetMode.CROP_OWN
	? TPlayerTarget & TTargetIndex
	: T extends TTargetMode.CARD_DISCARDED
	? TTargetIndex
	: T extends TTargetMode.CARD_OWN
	? TTargetIndex
	: T extends TTargetMode.CARD_MARKET
	? TTargetIndex
	: T extends TTargetMode.CROP_COLOR
	? TWithCropColor
	: never;

export type TTargetModeContext<T extends TTargetMode> = TWithTargetOptions<T> & TTargetTypedContext<T>;

export type TTargetContext<T extends TTargetMode> = TWithTargetMode<T> & TTargetTypedContext<T>;

export type TTargetPayload<T extends TTargetAction, M extends TTargetMode> = T extends TTargetAction.HOVER
	? TTargetPayload<TTargetRelatedAction<M>, M>
	: T extends TTargetAction.CHOOSE_CARD
	? TTargetIndex
	: T extends TTargetAction.CHOOSE_COLOR
	? TWithCropColor
	: T extends TTargetAction.CHOOSE_BED
	? TPlayerTarget & TTargetIndex
	: T extends TTargetAction.CHOOSE_CROP
	? TPlayerTarget & TTargetIndex
	: T extends TTargetAction.CHOOSE_PLAYER
	? TPlayerTarget
	: T extends TTargetAction.CHOOSE_MARKET_SLOT
	? TPlayerTarget & TTargetIndex
	: never;

export type TTargetRelatedActionDict = {
	[TTargetMode.INIT]: never;
	[TTargetMode.FOE]: TTargetAction.CHOOSE_PLAYER;
	[TTargetMode.PLAYER]: TTargetAction.CHOOSE_PLAYER;
	[TTargetMode.CROP_FOE]: TTargetAction.CHOOSE_CROP;
	[TTargetMode.CROP_ANY]: TTargetAction.CHOOSE_CROP;
	[TTargetMode.CROP_OWN]: TTargetAction.CHOOSE_CROP;
	[TTargetMode.BED_FOE]: TTargetAction.CHOOSE_BED;
	[TTargetMode.BED_OWN]: TTargetAction.CHOOSE_BED;
	[TTargetMode.BED_EMPTY]: TTargetAction.CHOOSE_BED;
	[TTargetMode.BED_ANY]: TTargetAction.CHOOSE_BED;
	[TTargetMode.CARD_MARKET]: TTargetAction.CHOOSE_MARKET_SLOT;
	[TTargetMode.CARD_OWN]: TTargetAction.CHOOSE_CARD;
	[TTargetMode.CARD_DISCARDED]: TTargetAction.CHOOSE_CARD;
	[TTargetMode.CROP_COLOR]: TTargetAction.CHOOSE_COLOR;
};

export type TTargetRelatedAction<T extends TTargetMode> = TTargetRelatedActionDict[T];

export type TTargetReducer<
	M extends TTargetMode,
	A extends TTargetRelatedAction<M> = TTargetRelatedAction<M>,
	P extends TTargetPayload<A, M> = TTargetPayload<A, M>,
	C extends TTargetModeContext<M> = TTargetModeContext<M>,
	T extends TRelatedTarget<M> = TRelatedTarget<M>
> = (params: { game: TGame; context: C; payload: P; target: T }) => {
	game: TGame;
	context: C;
};
