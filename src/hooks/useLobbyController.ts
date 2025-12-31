import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppQueryClient, useServices } from '~/providers/AppServicesProvider';
import { emitDomainEvent } from '~/yantrix/sources/uiBridgeSource';
import { WindowDomainEvents } from '~/yantrix/windowDomainEvents';

export function useLobbyController() {
	const services = useServices();
	const qc = useAppQueryClient();
	const navigate = useNavigate();

	return React.useMemo(() => {
		return {
			async toggleReady(lobbyId: string, playerId: string, isReady: boolean) {
				await services.controllers.lobbies.setPlayerReadyByLobbyId(lobbyId, playerId, isReady);
				await qc.invalidateQueries({ queryKey: ['lobbies', 'players', 'byLobby', lobbyId] });
			},

			async closeLobby(lobbyId: string) {
				await services.controllers.lobbies.closeByLobbyId(lobbyId);
				await qc.invalidateQueries({ queryKey: ['lobbies'] });
				emitDomainEvent(WindowDomainEvents.lobby_closed, null);
				navigate('/menu', { replace: true });
			},

			async leaveLobby(lobbyId: string, playerId: string) {
				await services.controllers.lobbies.removePlayerByLobbyId(lobbyId, playerId);
				await qc.invalidateQueries({ queryKey: ['lobbies'] });
				emitDomainEvent(WindowDomainEvents.player_exit, null);
				navigate('/menu', { replace: true });
			},

			startGame(lobbyId: string) {
				emitDomainEvent(WindowDomainEvents.game_start, { lobbyId: lobbyId });
			},
		};
	}, [services, qc, navigate]);
}