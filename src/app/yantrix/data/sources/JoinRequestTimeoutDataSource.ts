import { uniqId } from '@yantrix/core';
import WindowModeAutomata from '~/shared/lib/fsm/window/WindowModeAutomata';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { isRecord } from '~/shared/helpers/typeGuards';
import { AbstractWindowDataSource, type FollowUp } from '../shared/AbstractWindowDataSource';

export const JOIN_REQUEST_TIMEOUT_MS = 30_000;

interface TimeoutPacket {
	lobbyId: string | undefined;
}

/**
 * Fires a single `request_timeout` event if the FSM has been in `JOIN_REQUEST` for `timeoutMs`
 * without leaving. The elapsed time is checked per CoreLoop tick (see `pollTick`) — no own timer.
 */
export class JoinRequestTimeoutDataSource extends AbstractWindowDataSource<TimeoutPacket> {
	readonly #modeFSM: InstanceType<typeof WindowModeAutomata>;
	readonly #timeoutMs: number;
	readonly #joinRequestState: number | null;
	#enterTs: number | null = null;
	#fired = false;

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

	override stop(): this {
		this.#enterTs = null;
		this.#fired = false;
		return super.stop();
	}

	#getLobbyIdFromContext(): string | undefined {
		const ctx: unknown = this.#modeFSM.getContext()?.context;
		if (!isRecord(ctx)) return undefined;
		const lobbyId = ctx['lobbyId'];
		return typeof lobbyId === 'string' ? lobbyId : undefined;
	}

	/** Per-tick: arm on enter, fire once when `timeoutMs` elapsed, reset on exit. */
	protected override pollTick(): void {
		if (this.#modeFSM.state !== this.#joinRequestState) {
			this.#enterTs = null;
			this.#fired = false;
			return;
		}
		if (this.#enterTs === null) {
			this.#enterTs = Date.now();
			this.#fired = false;
		}
		if (!this.#fired && Date.now() - this.#enterTs >= this.#timeoutMs) {
			this.#fired = true;
			this.emit({ lobbyId: this.#getLobbyIdFromContext() });
		}
	}
}
