import { TTurnPhase } from '~/src/types/fsm';
import { TPlayerIndex } from '~/src/types/fsm/shared';
import { TTargetContext } from '~/src/types/fsm/slices/target';
import { TActionCard } from '~/src/types/serializables/actions';
import { TCard } from '~/src/types/serializables/cards';
import { TCrop } from '~/src/types/serializables/crops';
import { IGame } from '~/src/types/serializables/game';
import { TPlayerClass, TPlayerTarget } from '~/src/types/serializables/players';

export enum TGameEvent {
	RESET,
	GAME_STARTED,
	TURN_STARTED,
	TURN_PHASE_STARTED,
	TURN_PHASE_ENDED,
	TURN_ENDED,
	GAME_ENDED,
	CROP_PLANTED,
	CROP_HARVESTED,
	CROP_DESTROYED,
	CROP_FERTILIZED,
	CARD_ACQUIRED,
	CARD_BOUGHT,
	CARD_DRAWN,
	CARD_PLAYED,
	CARD_DISCARDED,
	ACTION_PLAYED,
	PLAYER_GAINS_GOLD,
	PLAYER_DISCARDS_GOLD,
	PLAYER_GAINS_FERTILIZER,
	PLAYER_DISCARDS_FERTILIZER,
	PLAYER_TRADE_PERFORMED,
	PLAYER_TRADE_ACCEPTED,
}

export type TGameEventPayload<T extends TGameEvent> = T extends TGameEvent.TURN_STARTED
	? TPlayerTarget
	: T extends TGameEvent.TURN_PHASE_STARTED
	? TPlayerTarget & {
			phase: TTurnPhase;
	  }
	: T extends TGameEvent.TURN_PHASE_ENDED
	? TPlayerTarget & {
			phase: TTurnPhase;
	  }
	: T extends TGameEvent.TURN_ENDED
	? TPlayerTarget
	: T extends TGameEvent.GAME_ENDED
	? TPlayerTarget
	: T extends TGameEvent.CROP_PLANTED
	? TPlayerIndex & { crop: TCrop }
	: T extends TGameEvent.CROP_HARVESTED
	? TPlayerIndex & { crop: TCrop }
	: T extends TGameEvent.CROP_DESTROYED
	? TPlayerIndex & { crop: TCrop }
	: T extends TGameEvent.CROP_FERTILIZED
	? TPlayerIndex & { crop: TCrop }
	: T extends TGameEvent.CARD_ACQUIRED
	? TPlayerIndex & { card: TCard }
	: T extends TGameEvent.CARD_DRAWN
	? TPlayerIndex & { card: TCard }
	: T extends TGameEvent.CARD_BOUGHT
	? TPlayerIndex & { card: TCard }
	: T extends TGameEvent.CARD_DISCARDED
	? TPlayerIndex & {
			card: TCard;
	  }
	: T extends TGameEvent.CARD_PLAYED
	? TPlayerIndex & {
			card: TCard;
	  }
	: T extends TGameEvent.ACTION_PLAYED
	? TPlayerIndex & {
			card: TActionCard;
			target: TTargetContext<any>;
	  }
	: T extends TGameEvent.PLAYER_GAINS_GOLD
	? TPlayerIndex
	: T extends TGameEvent.PLAYER_GAINS_FERTILIZER
	? TPlayerIndex
	: T extends TGameEvent.PLAYER_DISCARDS_GOLD
	? TPlayerIndex
	: T extends TGameEvent.PLAYER_DISCARDS_FERTILIZER
	? TPlayerIndex
	: T extends TGameEvent.PLAYER_TRADE_PERFORMED
	? TPlayerIndex & {
			cards: TCard[];
	  }
	: T extends TGameEvent.PLAYER_TRADE_ACCEPTED
	? TPlayerIndex & {
			cards: TCard[];
	  }
	: never;

export type TMappedGameEventMeta = {
	[K in TGameEvent]: TGameEventPayload<K>;
};

export type TGameEventObject<T extends TGameEvent> = {
	event: T;
	payload: TGameEventPayload<T>;
	game: IGame | null;
	source: TPlayerClass | null;
};
