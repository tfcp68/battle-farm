import type { QueryClient } from '@tanstack/react-query';
import type { IEventSource, TAutomataEventMetaType } from '@yantrix/core';
import { uniqId } from '@yantrix/core';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

type EventId = number;
type MetaMap = Record<number, unknown>;
type Emit = (e: TAutomataEventMetaType<EventId, MetaMap>) => void;

function stableStringify(x: unknown): string {
	try {
		const obj = (x && typeof x === 'object') ? (x as Record<string, unknown>) : {};
		return JSON.stringify(obj, Object.keys(obj).sort());
	} catch {
		return String(x);
	}
}

export function createQueryDomainEventSource(opts: { queryClient: QueryClient }): IEventSource<EventId, MetaMap> {
	const id = `query_domain_${uniqId()}`;
	const qc = opts.queryClient;

	let emit: Emit | null = null;
	let unsub: (() => void) | null = null;
	let lastReadyMapByLobby: Record<string, string> = {};

	function computeReadyMap(players: Array<{ playerId: string; isReady?: boolean | null }> | null | undefined) {
		const map: Record<string, 0 | 1> = {};
		for (const p of players ?? []) {
			if (!p?.playerId) continue;
			map[p.playerId] = p.isReady ? 1 : 0;
		}
		return map;
	}

	function onSnapshot() {
		if (!emit) return;

		const playerQueries = qc.getQueryCache().findAll({ queryKey: ['lobbies', 'players', 'byLobby'] });
		for (const q of playerQueries) {
			const key = q.queryKey;
			const lobbyId = Array.isArray(key) ? key[key.length - 1] : null;
			if (!lobbyId) continue;

			const players = q.state.data as Array<{ playerId: string; isReady?: boolean | null }> | undefined;
			const readyMap = computeReadyMap(players);
			const hash = stableStringify(readyMap);

			if (lastReadyMapByLobby[lobbyId] === hash) continue;
			lastReadyMapByLobby[lobbyId] = hash;

			emit({
				event: WindowDomainEvents.player_state_change,
				meta: { playerReadyMap: readyMap, lobbyId } as unknown as MetaMap[EventId],
			});
		}
	}

	return {
		id,
		start(publish) {
			emit = publish;
			onSnapshot();
			unsub = qc.getQueryCache().subscribe(() => {
				onSnapshot();
			});
		},
		stop() {
			if (unsub) unsub();
			unsub = null;
			emit = null;
			lastReadyMapByLobby = {};
		},
	};
}

