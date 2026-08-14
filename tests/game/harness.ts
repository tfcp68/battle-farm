import {
	asCardInstanceId,
	asMatchId,
	asPlayerId,
	type Bed,
	type BedTypeId,
	CARD_DEFINITIONS,
	type CardDefId,
	type CardInstance,
	type CardInstanceId,
	createRng,
	type GameModel,
	MARKET_SIZE,
	type MatchPhase,
	type PlayerClassId,
	type PlayerId,
	type TurnPhase,
} from '~/entities/game';

/**
 * Builds a hand-crafted match position. `createMatch` deals a random one; these
 * tests need boards where exactly the right cards sit in exactly the right
 * zones, so the harness assembles the model directly and hands back the ids it
 * minted along the way.
 */

export interface CropSpec {
	defId: CardDefId;
	reapTimer: number;
	/** Planted `Crop Value`; defaults to the definition's base value. */
	value?: number;
}

export interface BedSpec {
	type?: BedTypeId;
	crop?: CropSpec | null;
	emptiedOnTurn?: number | null;
}

export interface PlayerSpec {
	id: string;
	coins?: number;
	fertilizers?: number;
	hand?: CardDefId[];
	beds?: BedSpec[];
	classId?: PlayerClassId;
	classCardUsed?: boolean;
}

export interface MatchSpec {
	players: PlayerSpec[];
	deck?: CardDefId[];
	market?: Array<CardDefId | null>;
	discardPile?: CardDefId[];
	matchPhase?: MatchPhase;
	phase?: TurnPhase;
	/** The active player's id; defaults to the first player. */
	active?: string | null;
	allowance?: number | null;
	turnNumber?: number;
	seed?: number;
	winLimit?: number;
}

export interface TestMatch {
	model: GameModel;
	/** Instance ids of each player's hand, in spec order. */
	hands: Record<string, CardInstanceId[]>;
	/** Instance ids of each player's planted crops, `null` for empty beds. */
	crops: Record<string, Array<CardInstanceId | null>>;
	market: Array<CardInstanceId | null>;
	deck: CardInstanceId[];
	discardPile: CardInstanceId[];
}

export function testMatch(spec: MatchSpec): TestMatch {
	const cards: Record<CardInstanceId, CardInstance> = {};
	let counter = 0;

	const mint = (defId: CardDefId, value?: number): CardInstanceId => {
		const instanceId = asCardInstanceId(`${defId}#t${counter++}`);
		cards[instanceId] = { instanceId, defId, value: value ?? CARD_DEFINITIONS[defId].value };
		return instanceId;
	};

	const hands: TestMatch['hands'] = {};
	const crops: TestMatch['crops'] = {};
	const players: GameModel['players'] = {};
	const order: PlayerId[] = [];

	for (const player of spec.players) {
		const playerId = asPlayerId(player.id);
		order.push(playerId);

		const hand = (player.hand ?? []).map((defId) => mint(defId));
		hands[player.id] = hand;

		const beds: Bed[] = [];
		const planted: Array<CardInstanceId | null> = [];
		for (const bed of player.beds ?? [{ type: 'COMMON', crop: null }]) {
			const cropId = bed.crop ? mint(bed.crop.defId, bed.crop.value) : null;
			planted.push(cropId);
			beds.push({
				type: bed.type ?? 'COMMON',
				crop: cropId && bed.crop ? { cardId: cropId, reapTimer: bed.crop.reapTimer } : null,
				emptiedOnTurn: bed.emptiedOnTurn ?? null,
			});
		}
		crops[player.id] = planted;

		players[playerId] = {
			playerId,
			nickname: player.id,
			classId: player.classId ?? 'LAND_BARON',
			coins: player.coins ?? 10,
			fertilizers: player.fertilizers ?? 5,
			hand,
			beds,
			classCardUsed: player.classCardUsed ?? false,
		};
	}

	const deck = (spec.deck ?? []).map((defId) => mint(defId));
	const discardPile = (spec.discardPile ?? []).map((defId) => mint(defId));
	const market: Array<CardInstanceId | null> = Array.from({ length: MARKET_SIZE }, (_, slot) => {
		const defId = spec.market?.[slot] ?? null;
		return defId === null ? null : mint(defId);
	});

	const active = spec.active === undefined ? spec.players[0]?.id ?? null : spec.active;

	return {
		model: {
			version: 1,
			matchId: asMatchId('test-match'),
			phase: spec.matchPhase ?? 'IN_PROGRESS',
			winLimit: spec.winLimit ?? 250,
			order,
			players,
			cards,
			deck,
			market,
			discard: discardPile,
			turn: {
				number: spec.turnNumber ?? 1,
				activePlayerId: active === null ? null : asPlayerId(active),
				phase: spec.phase ?? 'WAITING',
				allowance: spec.allowance ?? null,
				trade: null,
			},
			rng: createRng(spec.seed ?? 42),
			lastTurnTriggeredBy: null,
		},
		hands,
		crops,
		market,
		deck,
		discardPile,
	};
}

export const pid = asPlayerId;
