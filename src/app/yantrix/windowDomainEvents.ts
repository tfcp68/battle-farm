import { eventDictionary as modeEvents } from '~/shared/lib/fsm/window/WindowModeAutomata';
import { eventDictionary as menuEvents } from '~/shared/lib/fsm/window/WindowMenuAutomata';
import { eventDictionary as lobbyEvents } from '~/shared/lib/fsm/window/WindowLobbyAutomata';

export const WindowDomainEvents = {
	auth_requested: modeEvents.auth_requested,
	auth_succeeded: modeEvents.auth_succeeded,
	auth_failed: modeEvents.auth_failed,
	auth_signed_out: modeEvents.auth_signed_out,
	session_restored: modeEvents.session_restored,
	intro_complete: modeEvents.intro_complete,
	cancel_game_request: modeEvents.cancel_game_request,
	mode_join_accepted: modeEvents.mode_join_accepted, // requester side (JOIN_REQUEST → GAME_LOBBY)
	menu_join_accepted: lobbyEvents.menu_join_accepted, // host side (lobby FSM emit, GAME_JOIN_PENDING → IN_LOBBY)
	request_timeout: modeEvents.request_timeout,
	request_rejected: modeEvents.request_rejected,
	lobby_created: menuEvents.lobby_created,
	re_enter_lobby: modeEvents.re_enter_lobby,
	game_start: modeEvents.game_start,
	game_end: modeEvents.game_end,
	player_exit: modeEvents.player_exit,
	player_cancel: modeEvents.player_cancel,
	join_lobby: modeEvents.join_lobby,
	join_game_request: modeEvents.join_game_request,
	game_started: modeEvents.game_started,
	lobby_closed: modeEvents.lobby_closed,
	lobby_request_approved: modeEvents.lobby_request_approved,
	lobby_request_rejected: modeEvents.lobby_request_rejected,
	player_state_change: lobbyEvents.player_state_change,
} as const;
