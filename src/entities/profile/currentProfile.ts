import type { Profile } from './model';

/**
 * Synchronous mirror of the persisted profile, filled at boot and on every
 * profile change.
 *
 * Yantrix calls the injected `getPlayerId()` while computing a transition, so it
 * cannot await storage — synchronous paths read this instead.
 */
let current: Profile | null = null;

export function setCurrentProfile(profile: Profile | null): void {
	current = profile;
}

export function getCurrentProfile(): Profile | null {
	return current;
}

export function getCurrentPlayerId(): string | null {
	return current?.playerId ?? null;
}
