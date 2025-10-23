#!/usr/bin/env bash
set -euo pipefail

WINDOW_MODE_SRC="${1:-src/diagrams/windowMenu.mermaid}"
MENU_SRC="${2:-src/diagrams/menuSubmode.mermaid}"
LOBBY_SRC="${3:-src/diagrams/lobbySubmode.mermaid}"

OUT_DIR="${OUT_DIR:-src/fsm/window}"
mkdir -p "$OUT_DIR"

if command -v yantrix >/dev/null 2>&1; then
  CODEGEN_CMD="yantrix codegen"
elif command -v pnpm >/dev/null 2>&1; then
  CODEGEN_CMD="pnpm dlx @yantrix/cli codegen"
fi

for f in "$WINDOW_MODE_SRC" "$MENU_SRC" "$LOBBY_SRC"; do
  if [ ! -f "$f" ]; then
    echo "Error: файл диаграммы не найден: $f" >&2
    exit 1
  fi
done

if [ -d "$OUT_DIR" ]; then
  echo "Cleaning target directory: $OUT_DIR"
  find "$OUT_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
else
  mkdir -p "$OUT_DIR"
fi

echo "Генерация FSM для Window Mode..."
$CODEGEN_CMD "$WINDOW_MODE_SRC" \
  -l TypeScript \
  -o "$OUT_DIR/WindowModeAutomata.ts" \
  -c WindowModeAutomata

echo "Генерация FSM для Menu submode..."
$CODEGEN_CMD "$MENU_SRC" \
  -l TypeScript \
  -o "$OUT_DIR/WindowMenuAutomata.ts" \
  -c WindowMenuAutomata

echo "Генерация FSM для Lobby submode..."
$CODEGEN_CMD "$LOBBY_SRC" \
  -l TypeScript \
  -o "$OUT_DIR/WindowLobbyAutomata.ts" \
  -c WindowLobbyAutomata

echo "Готово:"
echo "  - $OUT_DIR/WindowModeAutomata.ts"
echo "  - $OUT_DIR/WindowMenuAutomata.ts"
echo "  - $OUT_DIR/WindowLobbyAutomata.ts"