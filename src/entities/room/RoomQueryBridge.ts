import type { QueryClient } from '@tanstack/react-query';
import { lobbyKeys } from '~/entities/lobby/keys';
import type { RoomService } from './RoomService';

/**
 * Pushes room snapshots into the TanStack Query cache — the seam that lets the
 * rest of the app stay unchanged. The cache is still the read model everything
 * renders from and `QueryDomainDataSource` still diffs it into domain events;
 * only what fills it changed, from a database round-trip to a P2P snapshot.
 */
export function connectRoomToQueryCache(rooms: RoomService, queryClient: QueryClient): () => void {
	return rooms.subscribe((state) => {
		if (!state) {
			void queryClient.invalidateQueries({ queryKey: lobbyKeys.all });
			return;
		}
		void queryClient.invalidateQueries({ queryKey: lobbyKeys.byLobbyId(state.code) });
		void queryClient.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(state.code) });
		void queryClient.invalidateQueries({ queryKey: lobbyKeys.requestsByLobbyId(state.code) });
	});
}
