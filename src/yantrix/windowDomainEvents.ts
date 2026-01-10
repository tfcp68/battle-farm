import { eventDictionary as modeEvents } from '~/fsm/window/WindowModeAutomata';
import { eventDictionary as lobbyEvents } from '~/fsm/window/WindowLobbyAutomata';

export const WindowDomainEvents = {
	intro_complete: modeEvents.intro_complete,
	cancel_game_request: modeEvents.cancel_game_request,
	request_accepted: modeEvents.request_accepted,
	lobby_created: modeEvents.lobby_created,
	game_start: modeEvents.game_start,
	game_end: modeEvents.game_end,
	player_exit: modeEvents.player_exit,
	player_cancel: modeEvents.player_cancel,
	join_lobby: modeEvents.join_lobby,
	join_game_request: modeEvents.join_game_request,
	game_started: modeEvents.game_started,
	player_state_change: lobbyEvents.player_state_change,
	lobby_closed: modeEvents.lobby_closed,
} as const;