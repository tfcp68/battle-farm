import { z } from 'zod';
import { BED_DEFINITIONS, CARD_DEFINITIONS, CLASS_DEFINITIONS, MARKET_SIZE } from '../data';
import type { BedTypeId, CardDefId, PlayerClassId } from '../data';
import {
	asCardInstanceId,
	asMatchId,
	asPlayerId,
	type CardInstanceId,
	type GameModel,
	MATCH_PHASES,
	type MatchId,
	type PlayerId,
	TURN_PHASES,
} from './types';

/**
 * Runtime validation of a `GameModel` crossing a trust boundary — a snapshot off
 * the WebRTC transport or a savegame out of `StoragePort`. Neither is trusted:
 * a peer can send anything, and stored data can be stale or hand-edited.
 *
 * Beyond field shapes the schema checks *referential integrity*, because that is
 * where a malformed snapshot actually hurts: a hand holding a card id absent
 * from `cards` would crash the renderer somewhere far from the boundary.
 */

/** A key of one of the static registries — rejects ids the build does not know. */
function registryKey<T extends string>(registry: Record<string, unknown>, label: string) {
	return z.custom<T>(
		(value) => typeof value === 'string' && Object.prototype.hasOwnProperty.call(registry, value),
		{ message: `Unknown ${label}` },
	);
}

const PlayerIdSchema = z.string().min(1).transform((value): PlayerId => asPlayerId(value));
const CardInstanceIdSchema = z.string().min(1).transform((value): CardInstanceId => asCardInstanceId(value));
const MatchIdSchema = z.string().min(1).transform((value): MatchId => asMatchId(value));

const CardDefIdSchema = registryKey<CardDefId>(CARD_DEFINITIONS, 'card definition id');
const BedTypeIdSchema = registryKey<BedTypeId>(BED_DEFINITIONS, 'bed type');
const PlayerClassIdSchema = registryKey<PlayerClassId>(CLASS_DEFINITIONS, 'player class');

const CardInstanceSchema = z.object({
	instanceId: CardInstanceIdSchema,
	defId: CardDefIdSchema,
	value: z.number().int(),
});

const PlantedCropSchema = z.object({
	cardId: CardInstanceIdSchema,
	reapTimer: z.number().int().min(0),
});

const BedSchema = z.object({
	type: BedTypeIdSchema,
	crop: PlantedCropSchema.nullable(),
	emptiedOnTurn: z.number().int().min(0).nullable(),
});

const PlayerStateSchema = z.object({
	playerId: PlayerIdSchema,
	nickname: z.string(),
	classId: PlayerClassIdSchema,
	coins: z.number().int().min(0),
	fertilizers: z.number().int().min(0),
	hand: z.array(CardInstanceIdSchema),
	beds: z.array(BedSchema),
	classCardUsed: z.boolean(),
});

const TradeStateSchema = z.object({
	sellerId: PlayerIdSchema,
	cardIds: z.array(CardInstanceIdSchema),
	bids: z.record(z.string(), z.number().int().min(0)),
});

const TurnStateSchema = z.object({
	number: z.number().int().min(0),
	activePlayerId: PlayerIdSchema.nullable(),
	phase: z.enum(TURN_PHASES),
	allowance: z.number().int().min(0).nullable(),
	trade: TradeStateSchema.nullable(),
});

const RngStateSchema = z.object({
	seed: z.number().int(),
	cursor: z.number().int(),
});

export const GameModelSchema = z
	.object({
		version: z.number().int().min(0),
		matchId: MatchIdSchema,
		phase: z.enum(MATCH_PHASES),
		winLimit: z.number().int().min(0),
		order: z.array(PlayerIdSchema),
		players: z.record(z.string(), PlayerStateSchema),
		cards: z.record(z.string(), CardInstanceSchema),
		deck: z.array(CardInstanceIdSchema),
		market: z.array(CardInstanceIdSchema.nullable()).length(MARKET_SIZE),
		discard: z.array(CardInstanceIdSchema),
		turn: TurnStateSchema,
		rng: RngStateSchema,
		lastTurnTriggeredBy: PlayerIdSchema.nullable(),
	})
	.superRefine((model, ctx) => {
		const knownCard = (id: string) => Object.prototype.hasOwnProperty.call(model.cards, id);
		const knownPlayer = (id: string) => Object.prototype.hasOwnProperty.call(model.players, id);

		const reportCard = (id: string, path: (string | number)[]) => {
			if (!knownCard(id)) {
				ctx.addIssue({ code: 'custom', path, message: `Card ${id} is not in the card registry` });
			}
		};

		model.deck.forEach((id, index) => reportCard(id, ['deck', index]));
		model.discard.forEach((id, index) => reportCard(id, ['discard', index]));
		model.market.forEach((id, index) => {
			if (id !== null) reportCard(id, ['market', index]);
		});

		for (const [playerId, player] of Object.entries(model.players)) {
			player.hand.forEach((id, index) => reportCard(id, ['players', playerId, 'hand', index]));
			player.beds.forEach((bed, index) => {
				if (bed.crop) reportCard(bed.crop.cardId, ['players', playerId, 'beds', index, 'crop']);
			});
		}

		model.order.forEach((id, index) => {
			if (!knownPlayer(id)) {
				ctx.addIssue({ code: 'custom', path: ['order', index], message: `Player ${id} is not in the match` });
			}
		});

		if (model.turn.activePlayerId !== null && !knownPlayer(model.turn.activePlayerId)) {
			ctx.addIssue({
				code: 'custom',
				path: ['turn', 'activePlayerId'],
				message: 'Active player is not in the match',
			});
		}
	});

/** Parses an untrusted snapshot, returning `null` when it is not a valid model. */
export function parseGameModel(value: unknown): GameModel | null {
	const result = GameModelSchema.safeParse(value);
	return result.success ? result.data : null;
}
