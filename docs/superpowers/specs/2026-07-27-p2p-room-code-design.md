# Вход по коду комнаты и P2P-транспорт вместо Supabase

Дата: 2026-07-27

## Цель

Убрать аккаунты и серверную БД. Игрок вводит никнейм, создаёт комнату или входит
в неё по коду, дальше игра целиком идёт по WebRTC между браузерами. Локальные
данные лежат за портом с выбором драйвера через ENV.

## Что уходит

- `src/entities/auth/*` — вся email/password-авторизация через Supabase.
- `src/shared/api/connect.ts`, `src/shared/types/supabase.ts`.
- Зависимость `@supabase/supabase-js`, ENV `VITE_SUPABASE_*`,
  `VITE_AUTH_BASE_EMAIL_LOCAL`, `VITE_AUTH_BASE_EMAIL_DOMAIN`.
- Все `model.ts`, работающие с таблицами (`players`, `lobbies`, `lobby_players`,
  `lobby_requests`, игровые таблицы).
- Публичный список открытых лобби (`LobbiesModel.listLobbies`) и UI, который его
  показывает. Без сервера комнаты некому агрегировать: попасть в комнату можно
  только по коду.

## Архитектура

Четыре слоя, каждый тестируется отдельно.

### 1. Storage — единственная точка DI/ENV

```ts
interface StoragePort {
	get<T>(key: string): Promise<T | null>
	set<T>(key: string, value: T): Promise<void>
	remove(key: string): Promise<void>
}
```

Реализации: `LocalStorageAdapter`, `IndexedDbAdapter`. Выбор в `createServices`
по `VITE_STORAGE_DRIVER` (`local` | `indexeddb`, по умолчанию `local`).

Порт асинхронный с самого начала, хотя localStorage синхронный: иначе
IndexedDB-адаптер потом не подставить без правки всех вызывающих.

Состав хранимых данных за пределами профиля (снапшоты партий, история матчей)
намеренно не фиксируется в этой спеке — порт спроектирован так, чтобы добавление
ключей не меняло его контракт.

### 2. Profile — identity вместо auth

`src/entities/profile`: `{ playerId: string, nickname: string }`.

- `playerId` — `crypto.randomUUID()`, генерируется один раз при первом вводе
  никнейма и живёт в хранилище. Стабильность важна: по нему хост узнаёт
  вернувшегося игрока после F5.
- `nickname` меняется свободно, уникален только внутри комнаты. Хост при
  коллизии добавляет суффикс.
- Никаких паролей, сетевых вызовов и состояния «ошибка входа».

`ProfileController`: `getProfile()`, `createProfile(nickname)`,
`renameProfile(nickname)`, `clearProfile()`.

### 3. RoomTransport — WebRTC поверх Trystero

`src/shared/net/RoomTransport`:

```ts
interface RoomTransport {
	join(code: string): Promise<void>
	leave(): void
	send(action: string, payload: unknown, peerId?: string): void
	on(action: string, cb: (payload: unknown, peerId: string) => void): () => void
	onPeerJoin(cb: (peerId: string) => void): () => void
	onPeerLeave(cb: (peerId: string) => void): () => void
	readonly peers: readonly string[]
}
```

Trystero берёт на себя сигналинг через публичные релеи — своего сервера нет.
Имя room — `${VITE_P2P_APP_ID}:${code}`.

Код комнаты: 6 символов из алфавита без визуально похожих знаков
(`0/O`, `1/I/l` исключены), генерирует хост.

### 4. Room — host-authoritative состояние

`src/entities/room` в двух ролях поверх одного транспорта:

- **HostRoom** — владеет состоянием комнаты (участники, join-запросы, статус,
  игровое состояние). Принимает интенты, валидирует, применяет, рассылает
  снапшот с монотонной версией.
- **GuestRoom** — шлёт интенты хосту, хранит последний принятый снапшот.
  Снапшот с версией меньше текущей игнорируется.

Протокол сообщений:

| Направление | Сообщение | Payload |
|---|---|---|
| guest → host | `hello` | `{ playerId, nickname }` |
| guest → host | `join_request` | `{ playerId }` |
| guest → host | `set_ready` | `{ isReady }` |
| guest → host | `intent` | игровое намерение хода |
| guest → host | `leave` | `{ playerId }` |
| host → guest | `snapshot` | `{ version, state }` |
| host → guest | `request_result` | `{ playerId, approved }` |
| host → guest | `game_started` | `{ gameId, playerIds }` |
| host → guest | `error` | `{ code, message }` |

Хост — единственный источник правды. Гость никогда не применяет собственный
интент локально до подтверждения снапшотом: иначе получаем оптимистичный UI,
который надо откатывать.

## Стыковка с Yantrix

`QueryDomainDataSource` слушает кэш TanStack Query, а не сеть. Это позволяет
подменить транспорт, не трогая FSM-слой:

1. Приходит `snapshot` → обновляется in-memory реплика комнаты.
2. Реплика дёргает `queryClient.invalidateQueries({ queryKey: ['lobbies', ...] })`.
3. `QueryDomainDataSource` срабатывает ровно как сегодня и публикует
   `player_state_change`.

Контроллеры (`lobbies`, `games`) сохраняют сигнатуры — меняется только то, что
за ними. `refetchInterval` в `queries.ts` выключается: обновления теперь push,
поллинг локальной памяти был бы бессмысленной работой.

Диаграммы `lobbySubmode`, `gameLoop`, `turnLoop`, `menuSubmode` и игровой UI не
меняются.

## Изменения FSM `windowMenu`

Меняется только «голова» машины — участок до входа в лобби:

```
[*] --> NO_PROFILE
NO_PROFILE --> INTRO: PROFILE_CREATED (playerId, nickname)
NO_PROFILE --> MAIN_MENU: SESSION_RESTORED (playerId)
MAIN_MENU --> CONNECTING: JOIN_ROOM (code)
MAIN_MENU --> CONNECTING: CREATE_ROOM
CONNECTING --> JOIN_REQUEST: ROOM_CONNECTED (code)
CONNECTING --> GAME_LOBBY: ROOM_CREATED (code, isHost = 1)
CONNECTING --> MAIN_MENU: CONNECT_FAILED (error)
MAIN_MENU --> NO_PROFILE: CHANGE_NICKNAME
```

Хвост машины (`JOIN_REQUEST → GAME_LOBBY → GAME_STARTING → IN_GAME →
SCORE_SCREEN`) остаётся без изменений. Апрув хостом сохраняется: код даёт
подключение к комнате, решение о входе принимает хост — только теперь запрос
едет по DataChannel, а не через таблицу `lobby_requests`.

Состояния `UNAUTHENTICATED`, `AUTHENTICATING`, `AUTH_FAILED` и события
`AUTH_REQUESTED`, `AUTH_SUCCEEDED`, `FAIL_AUTH`, `SIGN_OUT` удаляются.
`NavigationDataDestination` мапит `NO_PROFILE` и `CONNECTING` на `/`.

## UI

- `LoginPage` → `ProfilePage`: одно поле «никнейм», одна кнопка.
- Новый экран в `MAIN_MENU`: «Создать комнату» и поле ввода кода. После
  создания показывается код с кнопкой копирования.
- `JoinRequestPopup` и таймаут join-запроса сохраняются как есть.

## Обработка ошибок

| Сценарий | Поведение |
|---|---|
| Комнаты с таким кодом нет | Таймер на 10 c в состоянии `CONNECTING`; по истечении публикуется `CONNECT_FAILED`. Отличить «нет комнаты» от «медленный коннект» в P2P нельзя. |
| ICE не сошёлся (нет TURN) | `CONNECT_FAILED` с текстом про сеть и подсказкой про TURN. |
| Хост отвалился в лобби | Гости получают `onPeerLeave` хоста → возврат в `MAIN_MENU` с уведомлением. |
| Хост отвалился в игре | То же. Host migration в этой итерации не делаем. |
| Гость отвалился | Хост убирает его из состояния и рассылает снапшот. При возврате с тем же `playerId` — восстановление места. |
| Снапшот с устаревшей версией | Игнорируется. |
| Никнейм-коллизия в комнате | Хост добавляет числовой суффикс. |

## Тестирование

- **StoragePort** — один набор контрактных тестов, прогоняется против обоих
  адаптеров (fake-indexeddb для второго).
- **Profile** — создание, переименование, восстановление из хранилища.
- **HostRoom / GuestRoom** — на фейковом `RoomTransport` (in-memory шина двух
  «пиров»), без реального WebRTC: применение интентов, версионирование
  снапшотов, апрув/реджект, отвал пира.
- **Room → query cache** — что входящий снапшот приводит к инвалидации нужных
  ключей и `QueryDomainDataSource` публикует `player_state_change`.
- **Реальный WebRTC** остаётся ручной проверкой в двух вкладках: автотесты на
  публичные релеи были бы флаки.

## ENV

| Переменная | Значения | По умолчанию |
|---|---|---|
| `VITE_STORAGE_DRIVER` | `local` \| `indexeddb` | `local` |
| `VITE_P2P_APP_ID` | строка | `battle-farm` |
| `VITE_P2P_STRATEGY` | `torrent` \| `nostr` \| `mqtt` | `torrent` |
| `VITE_ICE_SERVERS` | JSON-массив `RTCIceServer` | публичный STUN |

## Известные ограничения

- Без TURN часть игроков (симметричный NAT, корпоративные сети) не сможет
  подключиться. Это ограничение WebRTC, а не реализации; `VITE_ICE_SERVERS`
  оставляет возможность подключить TURN.
- Сигналинг зависит от публичных релеев Trystero: их недоступность означает,
  что игроки не найдут друг друга.
- Уход хоста завершает партию.
- Защиты от читерства нет: хост авторитетен и доверенным считается по
  умолчанию. Для игры с друзьями это приемлемо.
