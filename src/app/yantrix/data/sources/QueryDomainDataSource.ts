import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { lobbyKeys, NO_LOBBY } from '~/entities/lobby/keys';
import { isRecord } from '~/shared/helpers/typeGuards';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

type PlayerRow = { playerId: string; isReady?: boolean | null };

function isPlayerRow(x: unknown): x is PlayerRow {
	return isRecord(x) && typeof x['playerId'] === 'string';
}

function stableStringify(x: unknown): string {
	try {
		const obj = isRecord(x) ? x : {};
		return JSON.stringify(obj, Object.keys(obj).sort());
	} catch {
		return String(x);
	}
}

/** Packet emitted when the per-lobby ready-map diff changes. */
interface PlayerStateChangePacket {
	lobbyId: string;
	playerReadyMap: Record<string, 0 | 1>;
}

/**
 * Source that observes the TanStack Query cache and emits `player_state_change`
 * whenever the per-lobby `playerReadyMap` diff changes.
 *
 * Replaces the function-style `createQueryDomainEventSource`. The
 * re-entrancy guard is required because `domainCommandsDestination` invalidates
 * queries that would re-fire this source — without the guard, the loop would
 * stack-overflow.
 */
export class QueryDomainDataSource extends AbstractWindowDataSource<PlayerStateChangePacket> {
	readonly #queryClient: QueryClient;
	#unsub: (() => void) | null = null;
	#lastReadyMapByLobby: Record<string, string> = {};
	#isProcessing = false;

	constructor(opts: { queryClient: QueryClient; id?: string }) {
		super({
			id: opts.id ?? `query_domain_${uniqId(4)}`,
			responseMapper: (data: PlayerStateChangePacket): FollowUp[] => [
				{
					event: WindowDomainEvents.player_state_change,
					meta: { playerReadyMap: data.playerReadyMap, lobbyId: data.lobbyId },
				},
			],
		});
		this.#queryClient = opts.queryClient;
	}

	override start(): this {
		super.start();
		// Initial snapshot — covers anything already in the cache at boot.
		this.#onSnapshot();
		this.#unsub = this.#queryClient.getQueryCache().subscribe((cacheEvent) => {
			const queryKey = cacheEvent.query?.queryKey;
			if (!Array.isArray(queryKey) || queryKey[0] !== lobbyKeys.all[0]) return;
			this.#onSnapshot();
		});
		return this;
	}

	override stop(): this {
		this.#unsub?.();
		this.#unsub = null;
		this.#lastReadyMapByLobby = {};
		return super.stop();
	}

	#computeReadyMap(players: PlayerRow[] | null | undefined): Record<string, 0 | 1> {
		const map: Record<string, 0 | 1> = {};
		for (const p of players ?? []) {
			if (!p?.playerId) continue;
			map[p.playerId] = p.isReady ? 1 : 0;
		}
		return map;
	}

	#onSnapshot(): void {
		if (this.#isProcessing) return;
		this.#isProcessing = true;
		try {
			const playerQueries = this.#queryClient
				.getQueryCache()
				.findAll({ queryKey: lobbyKeys.playersPrefix() });
			for (const q of playerQueries) {
				const key = q.queryKey;
				const lobbyId = Array.isArray(key) ? key[key.length - 1] : null;
				// The placeholder key belongs to a disabled query — it holds no roster.
				if (!lobbyId || typeof lobbyId !== 'string' || lobbyId === NO_LOBBY) continue;

				const rawData: unknown = q.state.data;
				const players = Array.isArray(rawData) ? rawData.filter(isPlayerRow) : undefined;
				const readyMap = this.#computeReadyMap(players);
				const hash = stableStringify(readyMap);

				if (this.#lastReadyMapByLobby[lobbyId] === hash) continue;
				this.#lastReadyMapByLobby[lobbyId] = hash;

				this.emit({ lobbyId, playerReadyMap: readyMap });
			}
		} finally {
			this.#isProcessing = false;
		}
	}
}
