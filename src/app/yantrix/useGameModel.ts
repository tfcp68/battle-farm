import { asPlayerId, type AppModel, type GameModel, type PlayerId } from '~/entities/game';
import { useCurrentProfile } from '~/entities/profile/queries';
import { useModel } from '~/shared/lib/model';
import { getAppModelStore } from './gameModel';

/**
 * The match as React sees it.
 *
 * There is one model per session and every peer holds the same one — the guest's
 * copy is rebuilt from the event stream by the very same Effect Matrix, so there
 * is no separate "guest projection" to read from. What differs between peers is
 * only *who is looking*, which is `useViewerId`.
 *
 * Selectors here project, never construct — see `useModel` for why that matters.
 */

const selectMatch = (model: AppModel): GameModel | null => model.match;

export function useMatch(): GameModel | null {
	return useModel(getAppModelStore(), selectMatch);
}

/** The local player's id, or `null` before a profile exists. */
export function useViewerId(): PlayerId | null {
	const { data: profile } = useCurrentProfile();
	return profile ? asPlayerId(profile.playerId) : null;
}

/** Whether the viewer is the player whose turn it is — the gate on every intent button. */
export function isViewersTurn(match: GameModel | null, viewerId: PlayerId | null): boolean {
	return !!match && !!viewerId && match.turn.activePlayerId === viewerId;
}
