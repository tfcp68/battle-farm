import { uniqId } from '@yantrix/core';
import { toast } from 'sonner';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { parseEventMeta } from '~/app/yantrix/eventSchemas';
import { AbstractWindowDataDestination, type DomainEvent } from '../shared/AbstractWindowDataDestination';

const REJECTION_MESSAGE: Record<string, string> = {
	lobby_not_open: 'This lobby is no longer open.',
};

/** Discriminated packet — one shape per kind of toast. */
type NotificationPacket =
	| { kind: 'auth_failed'; error: string | undefined }
	| { kind: 'request_rejected'; reason: string | undefined }
	| { kind: 'request_timeout' };

/**
 * Surfaces error/notice domain events as shadcn (sonner) toasts. Fire-and-forget.
 *
 * Class-based replacement for the `defineDestination`-style
 * `createNotificationsDestination`. The discriminated `NotificationPacket`
 * keeps the resolver a single `switch` over kinds, which is easier to extend
 * than a `b.on(...)` chain.
 */
export class NotificationsDataDestination extends AbstractWindowDataDestination<NotificationPacket> {
	constructor(opts: { id?: string } = {}) {
		super({
			id: opts.id ?? `notifications_${uniqId()}`,
			triggers: {
				[WindowDomainEvents.auth_failed]: (event: DomainEvent): NotificationPacket | null => ({
					kind: 'auth_failed',
					error: parseEventMeta(event.meta).error,
				}),
				[WindowDomainEvents.request_rejected]: (event: DomainEvent): NotificationPacket | null => ({
					kind: 'request_rejected',
					reason: parseEventMeta(event.meta).reason,
				}),
				[WindowDomainEvents.request_timeout]: (): NotificationPacket | null => ({
					kind: 'request_timeout',
				}),
			},
		});
	}

	protected resolve(packet: NotificationPacket): null {
		switch (packet.kind) {
			case 'auth_failed':
				toast.error(packet.error ?? 'Authentication failed. Please try again.');
				break;
			case 'request_rejected':
				toast.error(
					(packet.reason && REJECTION_MESSAGE[packet.reason]) ?? 'Your join request was rejected.',
				);
				break;
			case 'request_timeout':
				toast.warning('Join request timed out — no response from the host.');
				break;
		}
		return null;
	}
}
