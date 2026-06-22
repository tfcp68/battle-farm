import { isRecord } from '~/shared/helpers/typeGuards';

type StatesDict = Record<string, number>;
type EventsDict = Record<string, number>;
type AutomataLike = {
	state: number | null;
	getContext: () => unknown;
};

type MachineEntry = {
	name: string;
	instance: AutomataLike;
	states: StatesDict;
};

type SnapshotRow = {
	Machine: string;
	State: string;
	StateId: number | null;
	Changed: string;
	Context: string;
};

const TAG = {
	emit:    'background:#3b82f6;color:white;padding:2px 8px;border-radius:4px;font-weight:bold',
	bus:     'background:#0ea5e9;color:white;padding:2px 8px;border-radius:4px',
	src:     'background:#06b6d4;color:white;padding:2px 8px;border-radius:4px',
	dest:    'background:#f97316;color:white;padding:2px 8px;border-radius:4px;font-weight:bold',
	fsm:     'background:#10b981;color:white;padding:2px 8px;border-radius:4px;font-weight:bold',
	nav:     'background:#a855f7;color:white;padding:2px 8px;border-radius:4px;font-weight:bold',
	snap:    'background:#eab308;color:black;padding:2px 8px;border-radius:4px;font-weight:bold',
	warn:    'background:#ef4444;color:white;padding:2px 8px;border-radius:4px;font-weight:bold',
	muted:   'color:#9ca3af',
	reset:   '',
} as const;

declare global {
	interface Window {
		fsmLogger?: FsmDevLogger;
	}
}

export class FsmDevLogger {
	private machines: MachineEntry[];
	private eventNames: Map<number, string>;
	private lastStateById: Map<string, number | null>;
	private seqCounter = 0;
	private lastRoute: string | null = null;

	constructor(machines: MachineEntry[], eventNames: Map<number, string>) {
		this.machines = machines;
		this.eventNames = eventNames;
		this.lastStateById = new Map();
		for (const m of machines) this.lastStateById.set(m.name, m.instance.state ?? null);
	}

	private getStateName(states: StatesDict, id: number | null): string {
		if (id == null) return '<null>';
		for (const [k, v] of Object.entries(states)) if (v === id) return k;
		return `<unknown:${id}>`;
	}

	getEventName(eventId: number | null | undefined): string {
		if (eventId == null) return '<null>';
		return this.eventNames.get(eventId) ?? `<unknown:${eventId}>`;
	}

	private nextSeq(): string {
		return `#${(++this.seqCounter).toString().padStart(4, '0')}`;
	}

	logEmit(source: string, eventId: number, meta: unknown) {
		const seq = this.nextSeq();
		const name = this.getEventName(eventId);
		console.log(
			`%c${seq}%c %cEMIT%c %csrc=${source}%c → %c${name}%c (id=${eventId})`,
			TAG.muted, TAG.reset,
			TAG.emit, TAG.reset,
			TAG.muted, TAG.reset,
			'color:#3b82f6;font-weight:bold', TAG.reset,
			meta,
		);
	}

	logSourceFire(source: string, eventId: number | null, meta: unknown, reason?: string) {
		const name = this.getEventName(eventId);
		console.log(
			`%cSRC/${source}%c fires %c${name}%c${reason ? ` (${reason})` : ''}`,
			TAG.src, TAG.reset,
			'color:#3b82f6;font-weight:bold', TAG.reset,
			meta ?? '',
		);
	}

	logDestStart(destName: string, eventId: number | null, meta?: unknown) {
		const name = this.getEventName(eventId);
		console.log(
			`%cDEST/${destName}%c ▶ start %c${name}%c`,
			TAG.dest, TAG.reset,
			'color:#f97316;font-weight:bold', TAG.reset,
			meta ?? '',
		);
	}

	logDestEnd(destName: string, eventId: number | null, info?: { followups?: string[]; durationMs?: number }) {
		const name = this.getEventName(eventId);
		const fu = info?.followups?.length ? ` ⇒ [${info.followups.join(', ')}]` : '';
		const dur = info?.durationMs != null ? ` (${info.durationMs.toFixed(1)}ms)` : '';
		console.log(
			`%cDEST/${destName}%c ■ end   %c${name}%c${fu}${dur}`,
			TAG.dest, TAG.reset,
			'color:#f97316', TAG.reset,
		);
	}

	logDestError(destName: string, eventId: number | null, err: unknown) {
		const name = this.getEventName(eventId);
		console.log(
			`%cDEST/${destName}%c %cERROR%c on %c${name}%c`,
			TAG.dest, TAG.reset,
			TAG.warn, TAG.reset,
			'color:#ef4444;font-weight:bold', TAG.reset,
			err,
		);
	}

	logNavigation(to: string, reason: string) {
		const from = this.lastRoute ?? '<init>';
		const equal = from === to;
		console.log(
			`%cNAV%c ${from} %c→%c ${to}%c ${equal ? '(noop, same route)' : ''} via ${reason}`,
			TAG.nav, TAG.reset,
			'color:#a855f7;font-weight:bold', TAG.reset,
			TAG.muted,
		);
		this.lastRoute = to;
	}

	logNavigationSkipped(reason: string) {
		console.log(`%cNAV%c skipped: %c${reason}`, TAG.nav, TAG.reset, TAG.muted);
	}

	warn(msg: string, ...args: unknown[]) {
		console.warn(`%cWARN%c ${msg}`, TAG.warn, TAG.reset, ...args);
	}

	snapshot(label: string) {
		const rows: SnapshotRow[] = this.machines.map((m) => {
			const stateId = m.instance.state ?? null;
			const ctxRaw: unknown = (() => {
				try { return m.instance.getContext(); } catch { return null; }
			})();
			const ctx: unknown = isRecord(ctxRaw) ? ctxRaw['context'] ?? ctxRaw : ctxRaw ?? {};
			const prev = this.lastStateById.get(m.name) ?? null;
			const changed = prev !== stateId
				? `${this.getStateName(m.states, prev)} → ${this.getStateName(m.states, stateId)}`
				: '';
			this.lastStateById.set(m.name, stateId);
			return {
				Machine: m.name,
				State: this.getStateName(m.states, stateId),
				StateId: stateId,
				Changed: changed,
				Context: this.safeStringify(ctx),
			};
		});
		const anyChange = rows.some(r => r.Changed !== '');
		console.groupCollapsed(
			`%cSNAPSHOT%c ${label} %c${anyChange ? '⚡ STATE CHANGED' : '(no change)'}`,
			TAG.snap, TAG.reset,
			anyChange ? 'color:#10b981;font-weight:bold' : TAG.muted,
		);
		console.table(rows);
		console.groupEnd();
	}

	scheduleSnapshot(label: string) {
		queueMicrotask(() => this.snapshot(`${label} ⏱micro`));
		setTimeout(() => this.snapshot(`${label} ⏱macro`), 0);
	}

	private safeStringify(value: unknown): string {
		try {
			return JSON.stringify(value, (_k, v) => {
				if (typeof v === 'function') return '[fn]';
				return v;
			});
		} catch { return String(value); }
	}
}

let _logger: FsmDevLogger | null = null;

export function setFsmDevLogger(logger: FsmDevLogger) {
	_logger = logger;
	if (typeof window !== 'undefined') {
		window.fsmLogger = logger;
		console.log(
			`%cFSM-LOGGER%c ready — call %cwindow.fsmLogger.snapshot('manual')%c for on-demand snapshot`,
			TAG.snap, TAG.reset,
			'color:#0ea5e9;font-weight:bold', TAG.reset,
		);
	}
}

export function fsmLogger(): FsmDevLogger | null {
	return _logger;
}
