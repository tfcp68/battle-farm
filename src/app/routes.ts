import { statesDictionary } from '~/shared/lib/fsm/window/WindowModeAutomata';

/** Every route the app has. Nothing else should spell these out. */
export const AppRoutes = {
	profile: '/',
	intro: '/intro',
	menu: '/menu',
	lobby: '/lobby',
	game: '/game',
	score: '/score',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];

/**
 * Where each mode-FSM state lives. Keyed by state id, so a renamed state breaks
 * the build instead of silently losing its route. `CONNECTING` and
 * `JOIN_REQUEST` stay on the menu — both render as overlays there.
 */
export const ROUTE_BY_STATE_ID: Record<number, AppRoute> = {
	[statesDictionary.NO_PROFILE]: AppRoutes.profile,
	[statesDictionary.INTRO]: AppRoutes.intro,
	[statesDictionary.MAIN_MENU]: AppRoutes.menu,
	[statesDictionary.CONNECTING]: AppRoutes.menu,
	[statesDictionary.JOIN_REQUEST]: AppRoutes.menu,
	[statesDictionary.GAME_LOBBY]: AppRoutes.lobby,
	[statesDictionary.GAME_STARTING]: AppRoutes.lobby,
	[statesDictionary.IN_GAME]: AppRoutes.game,
	[statesDictionary.SCORE_SCREEN]: AppRoutes.score,
};

/** Route paths without the leading slash — used to strip a route off a URL. */
export const ROUTE_SEGMENTS: readonly string[] = Object.values(AppRoutes)
	.map((route) => route.replace(/^\//, ''))
	.filter(Boolean);
