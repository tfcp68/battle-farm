import type { QueryClient } from '@tanstack/react-query';
import { uniqId } from '@yantrix/core';
import WindowModeAutomata from '~/shared/lib/fsm/window/WindowModeAutomata';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { getPlayerId } from '~/app/yantrix/register-functions';
import { lobbyKeys } from '~/entities/lobby/queries';
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
 * Polls join-request status while the FSM is in `JOIN_REQUEST`. Combines a
 * cache subscription (for instant reaction) with a 1500ms refetch poll (for
 * the case where the host approves on another tab and our cache is stale).
 *
 * Replaces the function-style `createJoinRequestStatusSource`. The 1500ms
 * timer only triggers a refetch — the actual emit happens in the cache
 * subscription's diff handler, which keeps the emit path single-threaded.
 */
export class JoinRequestStatusDataSource extends AbstractWindowDataSource<StatusPacket> {
	readonly #queryClient: QueryClient;
	readonly #modeFSM: InstanceType<typeof WindowModeAutomata>;
	readonly #services: Services;
	readonly #joinRequestState: number | null;
	#unsub: (() => void) | null = null;
	#timer: ReturnType<typeof setInterval> | null = null;
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

		// Start/stop the 1500ms refetch poll as the FSM enters/leaves JOIN_REQUEST.
		this.#watcher = watchFsmState(this.#modeFSM, this.#joinRequestState, {
			onEnter: () => {
				const lobbyId = this.#getJoinLobbyId();
				if (lobbyId) this.#startPolling(lobbyId);
				this.#onSnapshot();
			},
			onExit: () => this.#stopPolling(),
		});

		return this;
	}

	override stop(): this {
		this.#stopPolling();
		this.#watcher?.stop();
		this.#watcher = null;
		this.#unsub?.();
		this.#unsub = null;
		this.#lastStatusByKey = {};
		return super.stop();
	}

	#isInJoinRequest(): boolean {
		return this.#modeFSM.state === this.#joinRequestState;
	}

	#getJoinLobbyId(): string | null {
		const ctx: unknown = this.#modeFSM.getContext()?.context;
		if (!isRecord(ctx)) return null;
		const lobbyId = ctx['lobbyId'];
		return typeof lobbyId === 'string' ? lobbyId : null;
	}

	#startPolling(lobbyId: string): void {
		if (this.#timer) return;
		this.#timer = setInterval(async () => {
			if (!this.#isInJoinRequest()) {
				this.#stopPolling();
				return;
			}
			try {
				await this.#queryClient.fetchQuery({
					queryKey: lobbyKeys.requestsByLobbyId(lobbyId),
					queryFn: () => this.#services.controllers.lobbies.listRequestsByLobbyId(lobbyId),
					staleTime: 0,
				});
			} catch {
				/* ignore */
			}
		}, 1500);
	}

	#stopPolling(): void {
		if (this.#timer) {
			clearInterval(this.#timer);
			this.#timer = null;
		}
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
					this.#stopPolling();
					this.emit({ kind: 'approved', playerId, lobbyId });
				} else if (myRequest.status === 'rejected') {
					this.#stopPolling();
					this.emit({ kind: 'rejected', playerId, lobbyId });
				}
			}
		} finally {
			this.#isProcessing = false;
		}
	}
}
