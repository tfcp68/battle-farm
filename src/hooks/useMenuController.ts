import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WindowDomainEvents } from '~/yantrix/windowDomainEvents';
import { emitDomainEvent } from '~/yantrix/sources/uiBridgeSource';
import { useAppQueryClient, useServices } from '~/providers/AppServicesProvider';

export function useMenuController() {
	const services = useServices();
	const qc = useAppQueryClient();
	const navigate = useNavigate();

	return React.useMemo(() => {
		return {
			async createLobby(playerId: string | null) {
				if (!playerId) throw new Error('null playerId');
				const lobby = await services.controllers.lobbies.create(playerId, { maxPlayers: 7 });
				await services.controllers.games.create({ lobbyId: lobby.lobbyId });

				emitDomainEvent(WindowDomainEvents.lobby_created, {
					lobbyId: lobby.lobbyId,
					gameId: null,
					playerId,
					isHost: 1,
				});

				await qc.invalidateQueries({ queryKey: ['games'] });
				await qc.invalidateQueries({ queryKey: ['lobbies', 'players', 'byLobby', lobby.lobbyId] });
				await qc.invalidateQueries({ queryKey: ['lobbies', 'requests', 'byLobby', lobby.lobbyId] });

				// Go to lobby immediately.
				navigate('/lobby', { replace: true });
			},

			async requestJoin(lobbyId: string, playerId: string) {
				// DB side-effect through DI
				await services.controllers.lobbies.requestJoinByLobbyId(lobbyId, playerId);

				// FSM/UI intent
				emitDomainEvent(WindowDomainEvents.join_game_request, { src: 'ui', lobbyId, playerId, gameId: null });

				await qc.invalidateQueries({ queryKey: ['lobbies', 'requests', 'byLobby', lobbyId] });
			},

			async acceptJoin(lobbyId: string, playerId: string, gameId: string | null) {
				// DB side-effect through DI
				const existingPlayers = await services.controllers.lobbies.listPlayersByLobbyId(lobbyId);
				if (!existingPlayers.some((p) => p.playerId === playerId)) {
					await services.controllers.lobbies.addPlayerByLobbyId(lobbyId, playerId, false);
				}

				// FSM/UI intent
				emitDomainEvent(WindowDomainEvents.request_accepted, { src: 'ui', lobbyId, playerId, gameId });

				await qc.invalidateQueries({ queryKey: ['lobbies', 'players', 'byLobby', lobbyId] });
				await qc.invalidateQueries({ queryKey: ['lobbies', 'lobby', 'byId', lobbyId] });
			},

			cancelJoin() {
				emitDomainEvent(WindowDomainEvents.cancel_game_request, null);
			},

			async logout() {
				await services.controllers.auth.signOut();
				qc.clear();
				navigate('/', { replace: true });
			},
		};
	}, [services, qc, navigate]);
}