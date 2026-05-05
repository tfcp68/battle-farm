/**
 * Shared event-bus types for all Yantrix sources and destinations.
 * Centralised here to avoid duplication across uiBridgeSource / queryDomainEventSource / domainCommandsDestination.
 */
export type WindowEventId = number;
export type WindowEventMetaMap = Record<WindowEventId, unknown>;

