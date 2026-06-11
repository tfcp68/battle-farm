import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import WindowModeAutomata from '~/shared/lib/fsm/window/WindowModeAutomata';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { getPlayerId } from '~/app/yantrix/register-functions';
import { lobbyKeys } from '~/entities/lobby/queries';
import supabase from '~/shared/api/connect';
import type { Services } from '~/shared/services/createServices';
import { isRecord } from '~/shared/helpers/typeGuards';
import { type FsmStateWatcher, watchFsmState } from '~/app/yantrix/shared/fsmStateWatcher';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

type RequestRow = { id: string; playerId: string; status: string };

function isRequestRow(x: unknown): x is RequestRow {
	return (
		isRecord(x) &&
		typeof x['id'] === 'string' &&
		typeof x['playerId'] === 'string' &&
		typeof x['status'] === 'string'
	);
}

/** Per-status discriminated packet so the responseMapper can fan out. */
type StatusPacket =
	| { kind: 'approved'; playerId: string; lobbyId: string }
	| { kind: 'rejected'; playerId: string; lobbyId: string };

/**
 * Tracks the requester's join-request status while the FSM is in `JOIN_REQUEST`.
 * A Supabase Realtime channel on `lobby_requests` (opened on enter, closed on exit)
 * forces a refetch on every change; the actual emit happens in the cache diff handler.
 * Prerequisite: Realtime must be enabled for `lobby_requests`.
 */
export class JoinRequestStatusDataSource extends AbstractWindowDataSource<StatusPacket> {
	readonly #queryClient: QueryClient;
	readonly #modeFSM: InstanceType<typeof WindowModeAutomata>;
	readonly #services: Services;
	readonly #joinRequestState: number | null;
	#unsub: (() => void) | null = null;
	#channel: ReturnType<typeof supabase.channel> | null = null;
	#watcher: FsmStateWatcher | null = null;
	#lastStatusByKey: Record<string, string> = {};
	#isProcessing = false;

	constructor(opts: {
		queryClient: QueryClient;
		modeFSM: InstanceType<typeof WindowModeAutomata>;
		services: Services;
		id?: string;
	}) {
		super({
			id: opts.id ?? `join_request_status_${uniqId(4)}`,
			responseMapper: (data: StatusPacket): FollowUp[] => {
				const event =
					data.kind === 'approved'
						? WindowDomainEvents.mode_join_accepted
						: WindowDomainEvents.request_rejected;
				return [{ event, meta: { playerId: data.playerId, lobbyId: data.lobbyId } }];
			},
		});
		this.#queryClient = opts.queryClient;
		this.#modeFSM = opts.modeFSM;
		this.#services = opts.services;
		this.#joinRequestState = WindowModeAutomata.getState('JOIN_REQUEST');
	}

	override start(): this {
		super.start();

		// React immediately when the request cache changes (e.g. approval lands).
		this.#unsub = this.#queryClient.getQueryCache().subscribe((event) => {
			const key = event.query?.queryKey;
			if (!Array.isArray(key) || key[0] !== 'lobbies' || key[1] !== 'requests') return;
			this.#onSnapshot();
		});

		// Open/close the realtime channel as the FSM enters/leaves JOIN_REQUEST.
		this.#watcher = watchFsmState(this.#modeFSM, this.#joinRequestState, {
			onEnter: () => {
				const lobbyId = this.#getJoinLobbyId();
				if (lobbyId) {
					this.#openRealtime(lobbyId);
					this.#refetch(lobbyId);
				}
				this.#onSnapshot();
			},
			onExit: () => this.#closeRealtime(),
		});

		return this;
	}

	override stop(): this {
		this.#closeRealtime();
		this.#watcher?.stop();
		this.#watcher = null;
		this.#unsub?.();
		this.#unsub = null;
		this.#lastStatusByKey = {};
		return super.stop();
	}

	#getJoinLobbyId(): string | null {
		const ctx: unknown = this.#modeFSM.getContext()?.context;
		if (!isRecord(ctx)) return null;
		const lobbyId = ctx['lobbyId'];
		return typeof lobbyId === 'string' ? lobbyId : null;
	}

	#openRealtime(lobbyId: string): void {
		if (this.#channel) return;
		this.#channel = supabase
			.channel(`join_request_status:${lobbyId}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'lobby_requests', filter: `lobby_id=eq.${lobbyId}` },
				() => this.#refetch(lobbyId),
			)
			.subscribe();
	}

	#closeRealtime(): void {
		if (this.#channel) {
			supabase.removeChannel(this.#channel);
			this.#channel = null;
		}
	}

	#refetch(lobbyId: string): void {
		this.#queryClient
			.fetchQuery({
				queryKey: lobbyKeys.requestsByLobbyId(lobbyId),
				queryFn: () => this.#services.controllers.lobbies.listRequestsByLobbyId(lobbyId),
				staleTime: 0,
			})
			.catch(() => {});
	}

	#onSnapshot(): void {
		if (this.#isProcessing) return;
		this.#isProcessing = true;
		try {
			const lobbyId = this.#getJoinLobbyId();
			const playerId = getPlayerId();
			if (!lobbyId || !playerId) return;

			const cacheKey = lobbyKeys.requestsByLobbyId(lobbyId);
			const queries = this.#queryClient.getQueryCache().findAll({ queryKey: cacheKey });

			for (const q of queries) {
				const rawData: unknown = q.state.data;
				const requests = Array.isArray(rawData) ? rawData.filter(isRequestRow) : undefined;
				const myRequest = requests?.find((r) => r.playerId === playerId);
				if (!myRequest) continue;

				const trackKey = `${lobbyId}:${playerId}`;
				const prev = this.#lastStatusByKey[trackKey];
				if (prev === myRequest.status) continue;
				this.#lastStatusByKey[trackKey] = myRequest.status;

				if (myRequest.status === 'approved') {
					this.emit({ kind: 'approved', playerId, lobbyId });
				} else if (myRequest.status === 'rejected') {
					this.emit({ kind: 'rejected', playerId, lobbyId });
				}
			}
		} finally {
			this.#isProcessing = false;
		}
	}
}
