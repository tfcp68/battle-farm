import WindowModeAutomata from '~/fsm/window/WindowModeAutomata';
import WindowMenuAutomata from '~/fsm/window/WindowMenuAutomata';
import WindowLobbyAutomata from '~/fsm/window/WindowLobbyAutomata';

export const windowAutomataClasses = {
  mode: WindowModeAutomata,
  menu: WindowMenuAutomata,
  lobby: WindowLobbyAutomata,
} as const;

export const windowAutomataIds = {
  mode: WindowModeAutomata.id,
  menu: WindowMenuAutomata.id,
  lobby: WindowLobbyAutomata.id,
} as const;

export type WindowAutomataKey = keyof typeof windowAutomataIds;
export type WindowAutomataId = (typeof windowAutomataIds)[WindowAutomataKey];
