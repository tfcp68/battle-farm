#!/usr/bin/env bash
set -euo pipefail

WINDOW_MODE_SRC="${1:-src/shared/lib/fsm/diagrams/windowMenu.mermaid}"
MENU_SRC="${2:-src/shared/lib/fsm/diagrams/menuSubmode.mermaid}"
LOBBY_SRC="${3:-src/shared/lib/fsm/diagrams/lobbySubmode.mermaid}"

OUT_DIR="${OUT_DIR:-src/shared/lib/fsm/window}"
mkdir -p "$OUT_DIR"

FUNCTIONS_FILE="${FUNCTIONS_FILE:-src/shared/lib/fsm/functions.ts}"
FUNCTIONS_IMPORT="~/shared/lib/fsm/functions"

YANTRIX_CLI_VERSION="${YANTRIX_CLI_VERSION:-0.5.4}"

if command -v yantrix >/dev/null 2>&1; then
  CODEGEN_CMD="yantrix codegen"
elif command -v pnpm >/dev/null 2>&1; then
  CODEGEN_CMD="pnpm dlx @yantrix/cli@${YANTRIX_CLI_VERSION} codegen"
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
  -c WindowModeAutomata \
  -f "$FUNCTIONS_FILE"

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

# ---- Game-loop / turn-phase automata ----
# Design FSMs for the in-game turn engine. Their <<choice>> branches are guarded by predicates
# injected from $FUNCTIONS_FILE (names from docs/diagrams.md, semantics from docs/rules.md).
# The context they read is PROVISIONAL and reconciles with the game data model (board task #32).
GAME_OUT_DIR="${GAME_OUT_DIR:-src/shared/lib/fsm/game}"
DIAGRAMS_DIR="$(dirname "$WINDOW_MODE_SRC")"
GAME_DIAGRAMS="gameLoop turnLoop targetMode harvest shopping trading fertilizing waiting playingCards"

if [ -d "$GAME_OUT_DIR" ]; then
  echo "Cleaning target directory: $GAME_OUT_DIR"
  find "$GAME_OUT_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
else
  mkdir -p "$GAME_OUT_DIR"
fi

for name in $GAME_DIAGRAMS; do
  src="$DIAGRAMS_DIR/$name.mermaid"
  cls="${name^}Automata"
  if [ ! -f "$src" ]; then
    echo "Error: файл диаграммы не найден: $src" >&2
    exit 1
  fi
  echo "Генерация FSM для $cls..."
  $CODEGEN_CMD "$src" \
    -l TypeScript \
    -o "$GAME_OUT_DIR/$cls.ts" \
    -c "$cls" \
    -f "$FUNCTIONS_FILE"
done

# Post-process every generated file (window + game):
#  1. Codegen inlines the raw -f path into `import * as userFunctions from '...'` — rewrite it to
#     the `~` alias (no .ts extension) so it resolves from the generated file's dir under tsc/vite.
#  2. Generated FSM files are not meant to be type-checked/linted (project convention — every
#     committed automata starts with these flags). Some @yantrix/cli versions stop prepending them,
#     so re-add idempotently.
for gen in "$OUT_DIR"/*.ts "$GAME_OUT_DIR"/*.ts; do
  sed -i "s#from '[^']*functions\.ts'#from '$FUNCTIONS_IMPORT'#" "$gen"
  if ! head -1 "$gen" | grep -q 'eslint-disable'; then
    printf '/* eslint-disable */\n// @ts-nocheck\n\n%s' "$(cat "$gen")" > "$gen"
  fi
done

echo "Готово:"
echo "  Window:"
echo "    - $OUT_DIR/WindowModeAutomata.ts"
echo "    - $OUT_DIR/WindowMenuAutomata.ts"
echo "    - $OUT_DIR/WindowLobbyAutomata.ts"
echo "  Game loop:"
for name in $GAME_DIAGRAMS; do
  echo "    - $GAME_OUT_DIR/${name^}Automata.ts"
done