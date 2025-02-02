State Diagrams for Finite State Machines
================================

<!-- TOC -->

* [Window Mode](#window-mode)
    * [Menu submode](#menu-submode)
    * [Lobby submode](#lobby-submode)
* [Target Mode](#target-mode)
* [Game Loop](#game-loop)
* [Turn Loop](#turn-loop)
* [Turn Phases](#turn-phases)
    * [Harvest](#harvest)
    * [Shopping](#shopping)
    * [Trading](#trading)
    * [Playing Cards](#playing-cards)
    * [Fertilizing](#fertilizing)
    * [Waiting](#waiting)

<!-- TOC -->

## Window Mode

Every Window Mode represent different visual layout and different reactions to user input, including keystrokes. Most of window modes have submachines to control local visuals.

```mermaid
stateDiagram-v2
    [*] --> INTRO: RESET
    INTRO --> MAIN_MENU: TO_MENU
    GAME_LOBBY --> MAIN_MENU: EXIT
    MAIN_MENU --> JOIN_REQUEST: JOIN_GAME (gameId)
    JOIN_REQUEST --> MAIN_MENU: CANCEL
    JOIN_REQUEST --> GAME_LOBBY: REQUEST_ACCEPTED(gameId)
    MAIN_MENU --> GAME_LOBBY: CREATE_GAME (gameId, isHost = 1)  
    GAME_LOBBY --> GAME_STARTING: START_GAME (gameId, playerIds)
    GAME_STARTING --> IN_GAME: START_GAME    
    IN_GAME --> SCORE_SCREEN: END_GAME (scoreBoard)
    IN_GAME --> MAIN_MENU: ERROR
    IN_GAME --> MAIN_MENU: EXIT
    SCORE_SCREEN --> MAIN_MENU: EXIT

note right of [*]
#{playerId = getPlayerId()}
subscribe/intro_complete TO_MENU
subscribe/cancel_game_request CANCEL
subscribe/request_accepted REQUEST_ACCEPTED (gameId)
subscribe/lobby_created (gameId)
subscribe/game_start START_GAME (gameId, playerIds)
subscribe/game_end END_GAME (scoreBoard)
subscribe/player_exit EXIT
subscribe/player_cancel CANCEL
end note 

note right of INTRO
+Initial
end note

note left of GAME_LOBBY
#{gameId, isHost} <= $gameId, $isHost = 0
emit/join_lobby (gameId, playerId, isHost)
end note 

note right of JOIN_REQUEST
#{gameId} <= $gameId
emit/join_game_request (gameId, playerId)
end note
note left of GAME_STARTING
+ByPass
#{gameId, playerIds} <= $gameId, $playerIds
emit/game_started (gameId, playerIds)
end note
note right of SCORE_SCREEN
#{scoreBoard} <= $scoreBoard
end note
```

### Menu submode

Represents the behaviour of the main menu, where the Player can create or join a Game

```mermaid
stateDiagram-v2
    [*]-->IN_MENU: RESET
    IN_MENU --> CREATING_GAME: CREATE_LOBBY (gameId=get_game_id())
    IN_MENU-->IN_MENU: SELECT (index)
    CREATING_GAME --> IN_LOBBY: CREATE_LOBBY (gameId)
    CREATING_GAME-->IN_MENU: ERROR
    IN_MENU --> GAME_JOIN: JOIN_GAME
    GAME_JOIN --> GAME_JOIN_PENDING: JOINING_GAME (gameId)   
    GAME_JOIN-->GAME_JOIN: ENTER_GAME_ID (gameId)
    GAME_JOIN_PENDING --> IN_LOBBY: LOBBY_JOINED (gameId)
    GAME_JOIN_PENDING --> GAME_JOIN: ERROR

note right of [*]
subscribe/request_accepted LOBBY_JOINED (gameId)
#{selectedIndex=-1}
end note
note left of IN_MENU
#{selectedIndex} <= coalesce($index, #selectedIndex)
end note
note left of GAME_JOIN
#{gameId} <= coalesce($gameId, #gameId)
end note
note right of CREATING_GAME
+ByPass
#{gameId} <= $gameId
emit/lobby_created (gameId)
end note
```

### Lobby submode
Represents the behaviour of game lobby. 
- all players must call to be "ready" for game
- automatically concludes to game launch whenever all Players are ready
- once ready, the call can't be revoked
- a game host can kick a player, resetting the readiness of _all_ players
  
```mermaid
stateDiagram-v2
    state hasSpace <<choice>>
    state canKick <<choice>>
    state gameReady <<choice>>
    [*] --> LOBBY_INIT: CREATE_GAME (gameId, playerId, isHost)
    LOBBY --> hasSpace: PLAYER_JOINING (gameId, playerId)
    hasSpace --> JOIN_REQUEST: and(isEqual(#gameId,$gameId),has_player_slots(#playerReadyMap,#maxPlayers))
    LOBBY_INIT --> LOBBY: CREATE_GAME
    LOBBY --> EXTERNAL_UPDATE: UPDATE (playerReadyMap)
    LOBBY-->canKick: KICK (playerId)
    canKick-->KICK_PLAYER: and(has(#playerReadyMap,$playerId),isEqual(#isHost,1))
    KICK_PLAYER-->gameReady: KICK
    LOBBY --> READY_STATE_CHANGE: READY
    READY_STATE_CHANGE --> gameReady: READY
    EXTERNAL_UPDATE --> gameReady: UPDATE
    JOIN_REQUEST --> gameReady: PLAYER_JOINING
    gameReady --> GAME_STARTING: game_ready(#playerReadyMap)
    gameReady --> LOBBY
    hasSpace -->LOBBY 
    canKick --> LOBBY
    GAME_STARTING-->IN_GAME: LAUNCH

note left of [*]
define/empty_map () => zip([],[])
define/reset_map (players) => zip(players,repeat(0, len(players)))
define/has_player_slots (map, maxPlayers) => isGreater(maxPlayers,len(keys(map)))
define/game_ready (map) => isEqual(len(keys(map)),sum(values(map)))
end note
note right of [*]
#{playerId, gameId, playerReadyMap = empty_map(), hostPlayerId, maxPlayers = 7, readyState = 0}
subscribe/lobby_created CREATE_GAME (gameId, playerId, isHost = 1)
subscribe/join_game_request PLAYER_JOINING (gameId, playerId) 
subscribe/player_state_change UPDATE (playerReadyMap)
subscribe/game_start LAUNCH
end note
note right of LOBBY_INIT
+ByPass
#{gameId, hostPlayerId = 0} <= $gameId, if(isEqual($isHost,1), $playerId, #hostPlayerId)
#{playerReadyMap} <= setAttr(#playerReadyMap,$playerId,0)
end note
note right of JOIN_REQUEST
+ByPass
#{playerReadyMap} <= setAttr(#playerReadyMap,$playerId,0)
emit/request_accepted (game_id)
end note
note right of KICK_PLAYER
+ByPass
#{playerReadyMap} <= reset_map(omit(keys(#playerReadyMap),$playerId))
end note
note right of READY_STATE_CHANGE
+ByPass
#{playerReadyMap, readyState} <= setAttr(#playerReadyMap, #playerId, 1), 1
emit/player_state_change (game_id, playerReadyMap)
end note
note right of EXTERNAL_UPDATE
+ByPass
#{playerReadyMap} <= $playerReadyMap
end note
note right of GAME_STARTING
emit/game_start (gameId, playerIds) <= #gameId, keys(#playerReadyMap)
end note
```

## Target Mode

Target Mode is a parallel automata that blocks parent state transition until resolved. Target Mode can be turned on for
a Player in almost any phase of Turn either by playing a Card or being a target of other Player's Card. In the latter
case, `SKIP` forces a random choice of target, while in the former it returns the Card to Hand.

```mermaid
stateDiagram-v2
    direction LR
    [*] --> FOE
    [*] --> PLAYER
    [*] --> BED_FOE
    [*] --> BED_OWN
    [*] --> BED_ANY
    [*] --> BED_EMPTY
    [*] --> CROP_FOE
    [*] --> CROP_OWN
    [*] --> CROP_ANY
    [*] --> CARD_OWN
    [*] --> CARD_MARKET
    [*] --> CARD_DISCARDED
    [*] --> CROP_COLOR
    FOE --> FINISHED: CHOOSE_PLAYER (index)
    FOE --> FOE: HOVER (class)
    FOE --> [*]: QUIT
    PLAYER --> FINISHED: CHOOSE_PLAYER (class)
    PLAYER --> PLAYER: HOVER (class)
    PLAYER --> [*]: QUIT
    BED_FOE --> FINISHED: CHOOSE_BED (class,index)
    BED_FOE --> BED_FOE: HOVER (class, index)
    BED_FOE --> [*]: QUIT
    BED_OWN --> FINISHED: CHOOSE_BED (self,index)
    BED_OWN --> BED_OWN: HOVER (self, index)
    BED_OWN --> [*]: QUIT
    BED_ANY --> FINISHED: CHOOSE_BED (class,index)
    BED_ANY --> BED_ANY: HOVER (class, index)
    BED_ANY --> [*]: QUIT
    BED_EMPTY --> FINISHED: CHOOSE_BED (self,index)
    BED_EMPTY --> BED_EMPTY: HOVER (self, index)
    BED_EMPTY --> [*]: QUIT
    CROP_FOE --> FINISHED: CHOOSE_CROP (class,index)
    CROP_FOE --> CROP_FOE: HOVER (class, index)
    CROP_FOE --> [*]: QUIT
    CROP_OWN --> FINISHED: CHOOSE_CROP (self,index)
    CROP_OWN --> CROP_OWN: HOVER (self, index)
    CROP_OWN --> [*]: QUIT
    CROP_ANY --> FINISHED: CHOOSE_CROP (class,index)
    CROP_ANY --> CROP_ANY: HOVER (class, index)
    CROP_ANY --> [*]: QUIT
    CARD_OWN --> FINISHED: CHOOSE_CARD (index)
    CARD_OWN --> CARD_OWN: HOVER (index)
    CARD_OWN --> [*]: QUIT
    CARD_DISCARDED --> FINISHED: CHOOSE_CARD (index)
    CARD_DISCARDED --> CARD_DISCARDED: HOVER (index)
    CARD_DISCARDED --> [*]: QUIT
    CARD_MARKET --> FINISHED: CHOOSE_MARKET_SLOT (index)
    CARD_MARKET --> CARD_MARKET: HOVER (index)
    CARD_MARKET --> [*]: QUIT
    CROP_COLOR --> FINISHED: CHOOSE_COLOR (color)
    CROP_COLOR --> CROP_COLOR: HOVER (index)
    CROP_COLOR --> [*]: QUIT
    FINISHED --> [*]
    end
```

## Game Loop

Game Loop is a state machine that represents the lifecycle of a single game, starting with players agreeing to start a
game

```mermaid
stateDiagram-v2
    [*] --> PLANNED: RESET
    PLANNED --> FINISHED: END
    PLANNED --> ROLLING_CHARACTERS: ROLL_CHARACTERS
    ROLLING_CHARACTERS --> ROLLING_TURN_ORDER: ROLL_TURN_ORDER
    ROLLING_TURN_ORDER --> SETUP: PREPARE
    SETUP --> IN_PROGRESS: START
    IN_PROGRESS --> IN_PROGRESS: TURN_START
    IN_PROGRESS --> IN_PROGRESS: TURN_PHASE_START
    IN_PROGRESS --> IN_PROGRESS: TURN_PHASE_END
    state isLimitReached <<choice>>
    IN_PROGRESS --> isLimitReached: TURN_END
    IN_PROGRESS --> FINISHED: END
    isLimitReached --> IN_PROGRESS: Coin Limit Not Reached
    isLimitReached --> LAST_TURN: Coin Limit Reached
    LAST_TURN --> LAST_TURN: TURN_START
    LAST_TURN --> LAST_TURN: TURN_PHASE_START
    LAST_TURN --> LAST_TURN: TURN_PHASE_END
    LAST_TURN --> FINISHED: TURN_END
```

## Turn Loop

Turn Loop is triggered with `TURN_START` from Game Loop and is resolved by triggering `TURN_END`. Every transition
within Turn Loop is triggered with `TURN_PHASE_START`, and the `FINISHED` state of the corresponding Turn Phase
triggers `TURN_PHASE_END`

```mermaid
stateDiagram-v2
    [*] --> WAITING
    WAITING --> HARVEST
    HARVEST --> SHOPPING
    SHOPPING --> TRADE
    TRADE --> PLAYING
    PLAYING --> FERTILIZE
    FERTILIZE --> CALCULATION
    state isLastTurn <<choice>>
    CALCULATION --> isLastTurn
    isLastTurn --> [*]: is last turn
    isLastTurn --> WAITING: game continues
```

## Turn Phases

### Harvest

Harvest Phase is autonomous unless Harvesting a Crop that has a corresponding effect, requiring a current Player to
choose some target. In that case, after harvesting that Crop the Player is forced into a corresponding Target Mode for
15s. If they fail to choose a Target, the effect appliance is skipped.

```mermaid
stateDiagram-v2
    [*] --> IDLE: RESET
    note left of IDLE
        emit/harvestNextPlant
        emit/disableTargetMode
        listen/harvestNextPlant => HARVEST
    end note
    state hasRipeCrops <<choice>>
    note left of hasRipeCrops
        predicates/hasRipeCrops
    end note
    IDLE --> hasRipeCrops: HARVEST
    hasRipeCrops --> FINISHED: no
    FINISHED --> [*]
    hasRipeCrops --> HARVESTING: yes
    state hasHarvestEffect <<choice>>
    note right of hasHarvestEffect
        predicates/hasHarvestEffect
    end note
    HARVESTING --> hasHarvestEffect: CROP_HARVESTED(Crop, effectContext?)
    hasHarvestEffect --> IDLE: no
    hasHarvestEffect --> EFFECT_TARGETING: yes
    note right of EFFECT_TARGETING
        emit/enableTargetMode
        listen/forceEndPhase => SKIP
    end note
    EFFECT_TARGETING --> EFFECT_APPLIANCE: EFFECT_APPLIED (Crop)
    note right of EFFECT_APPLIANCE
        emit/disableTargetMode
        emit/applyEffect
        listen/applyEffect => EFFECT_APPLIED
    end note
    EFFECT_APPLIANCE --> IDLE: EFFECT_APPLIED
    EFFECT_TARGETING --> IDLE: SKIP
```

### Shopping

One of the simplest Phases, Shopping enables Target Mode (`CARD_MARKET` mode) by default. The current Player can't
choose Cards that they can't afford. Otherwise, there is a confirmation step and an option to `SKIP` the Phase at any
stage. This Phase cannot be interrupted by indirect Target Mode.

```mermaid
stateDiagram-v2
    [*] --> IDLE: RESET
    note right of IDLE
        emit/browseMarket
        listen/browseMarket => START_TRADE
    end note
    state hasMoney <<choice>>
    IDLE --> hasMoney: START_TRADE
    note left of hasMoney
        predicates/hasCoinsForTrade
    end note
    hasMoney --> FINISHED: no
    FINISHED --> [*]
    hasMoney --> TRADING: yes
    note right of TRADING
        emit/enableTargetMode [CARD_MARKET]
        listen/forceEndPhase => SKIP
    end note
    TRADING --> FINISHED: SKIP
    TRADING --> TRADING: HOVER (index)
    TRADING --> CONFIRM_TRADE: CHOOSE_MARKET_SLOT (index)
    note right of CONFIRM_TRADE
        listen/forceEndPhase => SKIP
        emit/disableTargetMode
    end note
    CONFIRM_TRADE --> FINISHED: SKIP
    CONFIRM_TRADE --> hasMoney: CANCEL_SELECTION
    CONFIRM_TRADE --> ACCEPTING_TRADE: CONFIRM_DEAL (index)
    ACCEPTING_TRADE --> hasMoney: START_TRADE
    note right of ACCEPTING_TRADE
        emit/startMarketAcquisition
        listen/completeMarketAcquisition => START_TRADE
    end note
```

### Trading

Trading is a three-step transaction:

- the current Player proposes a subset of Cards from their Hand for Trade;
- all `Waiting` Players receive a Trade proposal and can adjust an offer before sending it back to the current Player (
  see [Waiting](#waiting)). While they do so, the current Player resides in `OFFERS_WAITING` state;
- the current Player accepts one of the offers or `SKIP`s

  The current Player can also `SKIP` at any stage, except for when waiting for trade offers, canceling all possible
  changes to the game state.

```mermaid
stateDiagram-v2
    [*] --> IDLE: RESET
    note left of IDLE
        emit/startTradeCollection
        listen/startTradeCollection => START_COLLECT
    end note
    state hasCardsInHand <<choice>>
    note right of hasCardsInHand
        predicates/hasCardsInHand
    end note
    IDLE --> hasCardsInHand: START_COLLECT
    hasCardsInHand --> COLLECT: yes
    note left of COLLECT
        emit/enableTargetMode [CARD_OWN]
    end note
    COLLECT --> COLLECT: HOVER (index)
    COLLECT --> COLLECT: ADD_CARD_TO_TRADE (index)
    COLLECT --> COLLECT: REMOVE_CARD_FROM_TRADE (index)
    hasCardsInHand --> FINISHED: no
    COLLECT --> FINISHED: SKIP
    COLLECT --> OFFERS_WAITING: SEND_TRADE (TCard[])
    note left of OFFERS_WAITING
        emit/startTrade
        emit/disableTargetMode
        listen/tradeOffersGathered => GATHER_OFFERS
        listen/forceEndPhase => SKIP
    end note
    state hasOffers <<choice>>
    note left of hasOffers
        predicates/hasTradeOffers
    end note
    OFFERS_WAITING --> hasOffers: GATHER_OFFERS (offers)
    hasOffers --> OFFERS_CHOOSING: yes
    hasOffers --> FINISHED: no
    note left of OFFERS_CHOOSING
        listen/forceEndPhase => SKIP
    end note
    OFFERS_CHOOSING --> FINISHED: SKIP
    OFFERS_CHOOSING --> OFFER_ACCEPTED: ACCEPT_OFFER (player)
    note left of OFFER_ACCEPTED
        emit/completeTrade
        listen/completeTrade => ACCEPT_OFFER
    end note
    OFFER_ACCEPTED --> FINISHED: ACCEPT_OFFER
    FINISHED --> [*]
```

### Playing Cards

Playing Cards is arguably the longest and the most complex Turn Phase, which flowchart significantly depends on type of
Card played. The state graph is essentially a loop, which is automatically skipped when the Player runs out of Cards or
by 30s timer

```mermaid
stateDiagram-v2
    direction LR
    [*] --> IDLE: RESET
    state gotMoreCards <<choice>>
    IDLE --> gotMoreCards: START_PLAY
    gotMoreCards --> PLAYING: yes
    state isCropCard <<choice>>
    PLAYING --> isCropCard: CHOOSE_CARD
    PLAYING --> PLAYING: HOVER_CARD (index)
    PLAYING --> FINISHED: SKIP
    isCropCard --> PLANTING: yes
    isCropCard --> TARGETING: no
    PLANTING --> FINISHED: SKIP
    state hasAfterPlanting <<choice>>
    PLANTING --> CROP_PLANTED: PLANT_CROP
    CROP_PLANTED --> hasAfterPlanting: PLANT_CROP
    PLANTING --> PLAYING: CANCEL_SELECTION
    hasAfterPlanting --> TARGETING: yes
    hasAfterPlanting --> gotMoreCards: no
    TARGETING --> PLAYING: CANCEL_SELECTION
    TARGETING --> EXECUTION: EXECUTE_ACTION
    TARGETING --> FINISHED: SKIP
    EXECUTION --> gotMoreCards: EXECUTE_ACTION
    gotMoreCards --> FINISHED: no
    FINISHED --> [*]
    note right of IDLE
        emit/startPlay
        listen/startPlay => START_PLAY
    end note
    note right of hasAfterPlanting
        predicates/hasPlantingEffect
    end note
    note left of PLANTING
        emit/enableTargetMode [BED_EMPTY]
    end note
    note right of EXECUTION
        emit/disableTargetMode
        emit/applyEffect
        listen/applyEffect => EXECUTE_ACTION
    end note
    note left of TARGETING
        emit/enableTargetMode
    end note
    note left of PLAYING
        emit/enableTargetMode [CARD_OWN]
        listen/forceEndPhase => SKIP
    end note
    note left of CROP_PLANTED
        emit/cropPlanted
        listen/cropPlanted => PLANT_CROP
    end note
    note right of isCropCard
        predicates/isCropCard
    end note
    note right of gotMoreCards
        predicates/hasAvailableMoves
    end note
```

### Fertilizing

Fertilizing Phase is pretty straightforward and allows the current Player to expend Fertilizer on their growing Plant (
including enemies'), requiring confirmation to apply. By default, the current Player is always in Target
Mode (`CROP_OWN` mode). This Phase can't be interrupted by indirect Target Mode.

```mermaid
stateDiagram-v2
    [*] --> IDLE: RESET
    note right of IDLE
        emit/disableTargetMode
        emit/startFertilize
        listen/startFertilize => START_FERTILIZE
    end note
    state canApply <<choice>>
    IDLE --> canApply: START_FERTILIZE
    note left of canApply
        predicates/canFertilize
    end note
    canApply --> CROP_SELECTION: yes
    canApply --> FINISHED: no
    note left of CROP_SELECTION
        emit/enableTargetMode [CROP_OWN]
        listen/forceEndPhase => SKIP
    end note
    CROP_SELECTION --> CROP_SELECTION: HOVER
    CROP_SELECTION --> FINISHED: SKIP
    CROP_SELECTION --> CROP_CONFIRM: CHOOSE_CROP
    note left of CROP_CONFIRM
        emit/disableTargetMode
    end note
    state hasFertilizeEffect <<choice>>
    note right of hasFertilizeEffect
        predicates/hasFertilizeEffect
    end note
    CROP_CONFIRM --> FINISHED: SKIP
    CROP_CONFIRM --> CROP_SELECTION: CANCEL_SELECTION
    CROP_CONFIRM --> CROP_FERTILIZED: FERTILIZE
    note right of CROP_FERTILIZED
        emit/cropFertilized
        listen/cropFertilized => FERTILIZE
    end note
    CROP_FERTILIZED --> hasFertilizeEffect: FERTILIZE
    hasFertilizeEffect --> canApply: no
    hasFertilizeEffect --> EFFECT_TARGETING: yes
    note left of EFFECT_TARGETING
        emit/enableTargetMode
        listen/forceEndPhase => SKIP
    end note
    EFFECT_TARGETING --> canApply: CANCEL_SELECTION
    EFFECT_TARGETING --> FINISHED: SKIP
    EFFECT_TARGETING --> EFFECT_APPLIANCE: APPLY_EFFECT
    note right of EFFECT_APPLIANCE
        emit/disableTargetMode
        emit/applyEffect
        listen/applyEffect => EFFECT_APPLIED
    end note
    EFFECT_APPLIANCE --> canApply: APPLY_EFFECT
    FINISHED --> [*]
    note left of FINISHED
        emit/disableTargetMode
    end note
```

### Waiting

Waiting Phase is the last Phase of the Turn, and Players transition to that Phase one by one. When the Player has
finished their Turn and reside in this state, they might be bothered to place Trade Offers or to enter Target Mode to
apply Effects from other Players, notably from them Planting, Fertilizing or Harvesting Crops and from playing Action
Cards. Thus, Trade options and Target mode never intersect.

```mermaid
stateDiagram-v2
    direction LR
    [*] --> IDLE: RESET
    IDLE --> FINISHED: SKIP
    note left of IDLE
        listen/startTrade => START_TRADE
        listen/cropHarvested => ENTER_TARGET_MODE
        listen/cropFertilized => ENTER_TARGET_MODE
        listen/cropPlanted => ENTER_TARGET_MODE
        listen/forceEndPhase => SKIP
        emit/revokeTradeOffers
        emit/disableTargetMode
    end note
    state hasMoney <<choice>>
    note left of hasMoney
        predicates/hasCoins
    end note
    IDLE --> hasMoney: START_TRADE
    hasMoney --> IDLE: no
    hasMoney --> HAS_TRADE: yes
    HAS_TRADE --> FINISHED: SKIP
    HAS_TRADE --> HAS_TRADE: CHANGE_TRADE_OFFER
    HAS_TRADE --> OFFER_SENT: MAKE_OFFER
    note left of OFFER_SENT
        emit/makeTradeOffer
        listen/completeTrade => predicates/isOwnOffer
        predicates/isOwnOffer => OFFER_ACCEPTED | CANCEL_SELECTION
    end note
    OFFER_SENT --> IDLE: CANCEL_SELECTION
    OFFER_SENT --> IDLE: OFFER_ACCEPTED
    OFFER_SENT --> FINISHED: SKIP
    state isAffected <<choice>>
    note right of isAffected
        predicates/hasEligibleEffectConditions
    end note
    IDLE --> isAffected: ENTER_TARGET_MODE
    isAffected --> IDLE: no
    isAffected --> TARGETING: yes
    note left of TARGETING
        emit/enableTargetMode
    end note
    TARGETING --> IDLE: CANCEL_SELECTION
    TARGETING --> FINISHED: SKIP
    TARGETING --> EFFECT_APPLIED: APPLY_EFFECT
    note right of EFFECT_APPLIED
        emit/applyEffect
        emit/disableTargetMode
        listen/applyEffect => APPLY_EFFECT
    end note
    EFFECT_APPLIED --> IDLE: APPLY_EFFECT
    FINISHED --> [*]
```
