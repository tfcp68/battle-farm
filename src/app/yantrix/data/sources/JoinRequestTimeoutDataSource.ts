import { uniqId } from '@yantrix/core';
import WindowModeAutomata from '~/shared/lib/fsm/window/WindowModeAutomata';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { fsmLogger } from '~/shared/lib/fsm/devLogger';
import { isRecord } from '~/shared/helpers/typeGuards';
import { watchFsmState, type FsmStateWatcher } from '~/app/yantrix/shared/fsmStateWatcher';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

export const JOIN_REQUEST_TIMEOUT_MS = 30_000;

interface TimeoutPacket {
	lobbyId: string | undefined;
}

/**
 * Fires a single `request_timeout` event if the FSM has been in `JOIN_REQUEST`
 * for `timeoutMs` without leaving. Replaces the function-style
 * `createJoinRequestTimeoutSource`.
 *
 * **Lifecycle.** The timer is armed on FSM-enter `JOIN_REQUEST` and cleared
 * on FSM-exit (via {@link watchFsmState}) — it never leaks across transitions.
 */
export class JoinRequestTimeoutDataSource extends AbstractWindowDataSource<TimeoutPacket> {
	readonly #modeFSM: InstanceType<typeof WindowModeAutomata>;
	readonly #timeoutMs: number;
	readonly #joinRequestState: number | null;
	#timer: ReturnType<typeof setTimeout> | null = null;
	#watcher: FsmStateWatcher | null = null;

	constructor(opts: {
		modeFSM: InstanceType<typeof WindowModeAutomata>;
		timeoutMs?: number;
		id?: string;
	}) {
		super({
			id: opts.id ?? `join_request_timeout_${uniqId(4)}`,
			responseMapper: (data: TimeoutPacket): FollowUp[] => [
				{ event: WindowDomainEvents.request_timeout, meta: { lobbyId: data.lobbyId } },
			],
		});
		this.#modeFSM = opts.modeFSM;
		this.#timeoutMs = opts.timeoutMs ?? JOIN_REQUEST_TIMEOUT_MS;
		this.#joinRequestState = WindowModeAutomata.getState('JOIN_REQUEST');
	}

	override start(): this {
		super.start();
		this.#watcher = watchFsmState(this.#modeFSM, this.#joinRequestState, {
			onEnter: () => this.#startTimer(),
			onExit: () => this.#clearTimer(),
		});
		return this;
	}

	override stop(): this {
		this.#clearTimer();
		this.#watcher?.stop();
		this.#watcher = null;
		return super.stop();
	}

	#isInJoinRequest(): boolean {
		return this.#modeFSM.state === this.#joinRequestState;
	}

	#getLobbyIdFromContext(): string | undefined {
		const ctx: unknown = this.#modeFSM.getContext()?.context;
		if (!isRecord(ctx)) return undefined;
		const lobbyId = ctx['lobbyId'];
		return typeof lobbyId === 'string' ? lobbyId : undefined;
	}

	#clearTimer(): void {
		if (this.#timer) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
	}

	#startTimer(): void {
		this.#clearTimer();
		this.#timer = setTimeout(() => {
			if (!this.isActive() || !this.#isInJoinRequest()) return;
			const lobbyId = this.#getLobbyIdFromContext();
			fsmLogger()?.logSourceFire(
				'joinRequestTimeout',
				WindowDomainEvents.request_timeout,
				{ lobbyId },
				`no host action after ${this.#timeoutMs}ms`,
			);
			this.emit({ lobbyId });
		}, this.#timeoutMs);
	}
}
