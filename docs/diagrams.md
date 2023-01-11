State Diagrams for Finite State Machines
================================

## Target Mode

Target Mode is a parallel automata that blocks parent state transition until resolved. Target Mode can be turned on for a Player in almost any phase of Turn either by playing a Card or being a target of other Player's Card. In the latter case, `SKIP` forces a random choice of target, while in the former it returns the Card to Hand.

```mermaid
stateDiagram-v2
direction LR
[*]-->INIT
INIT-->FOE
INIT-->PLAYER
INIT-->BED_FOE
INIT-->BED_OWN
INIT-->BED_ANY
INIT-->BED_EMPTY
INIT-->CROP_FOE
INIT-->CROP_OWN
INIT-->CROP_ANY
INIT-->CARD_OWN
INIT-->CARD_MARKET
INIT-->CARD_DISCARDED
state fork <<choice>>
FOE-->[*]: CHOOSE_PLAYER (index)
FOE-->FOE: HOVER (class)
FOE-->fork: QUIT
PLAYER-->[*]: CHOOSE_PLAYER (class)
PLAYER-->PLAYER: HOVER (class)
PLAYER-->fork: QUIT
BED_FOE-->[*]: CHOOSE_BED (class,index)
BED_FOE-->BED_FOE: HOVER (class, index)
BED_FOE-->fork: QUIT
BED_OWN-->[*]: CHOOSE_BED (self,index)
BED_OWN-->BED_OWN: HOVER (self, index)
BED_OWN-->fork: QUIT
BED_ANY-->[*]: CHOOSE_BED (class,index)
BED_ANY-->BED_ANY: HOVER (class, index)
BED_ANY-->fork: QUIT
BED_EMPTY-->[*]: CHOOSE_BED (self,index)
BED_EMPTY-->BED_EMPTY: HOVER (self, index)
BED_EMPTY-->fork: QUIT
CROP_FOE-->[*]: CHOOSE_CROP (class,index)
CROP_FOE-->CROP_FOE: HOVER (class, index)
CROP_FOE-->fork: QUIT
CROP_OWN-->[*]: CHOOSE_CROP (self,index)
CROP_OWN-->CROP_OWN: HOVER (self, index)
CROP_OWN-->fork: QUIT
CROP_ANY-->[*]: CHOOSE_CROP (class,index)
CROP_ANY-->CROP_ANY: HOVER (class, index)
CROP_ANY-->fork: QUIT
CARD_OWN-->[*]: CHOOSE_CARD (index)
CARD_OWN-->CARD_OWN: HOVER (index)
CARD_OWN-->fork: QUIT
CARD_DISCARDED-->[*]: CHOOSE_CARD (index)
CARD_DISCARDED-->CARD_DISCARDED: HOVER (index)
CARD_DISCARDED-->fork: QUIT
CARD_MARKET-->[*]: CHOOSE_MARKET_SLOT (index)
CARD_MARKET-->CARD_MARKET: HOVER (index)
CARD_MARKET-->fork: QUIT
fork-->[*]: targetOptional===true
fork-->INIT: targetOptional===false
```

## Turn Phases

### Harvest

Harvest Phase is autonomous unless Harvesting a Crop that has a corresponding effect, requiring a current Player to choose some target. In that case, after harvesting that Crop the Player is forced into a corresponding Target Mode for 15s. If they fail to choose a Target, the effect appliance is skipped. 

```mermaid
stateDiagram-v2
state hasRipeCrops <<choice>>
[*]-->hasRipeCrops: RESET
TARGET_MODE-->hasRipeCrops: SKIP_TARGET_MODE
TARGET_MODE-->hasRipeCrops: EFFECT_APPLIED (index)
FINISHED-->[*]
hasRipeCrops-->FINISHED: no mature crops
hasRipeCrops-->IDLE: has mature crops
state hasHarvestEffect <<choice>>
IDLE-->hasHarvestEffect: CROP_HARVESTED(Crop, effectContext?)
hasHarvestEffect-->hasRipeCrops: has no Harvest effect
hasHarvestEffect-->TARGET_MODE: has Harvest effect
```

### Shopping

One of the simplest Phases, Shopping enables Target Mode (`CARD_MARKET` mode) by default. The current Player can't choose Cards that they can't afford. Otherwise, there is a confirmation step and an option to `SKIP` the Phase at any stage. This Phase cannot be interrupted by indirect Target Mode.

```mermaid
stateDiagram-v2
state "TARGET_MODE (Market Slots)" as IDLE
[*]-->IDLE: RESET
[*]-->FINISHED: SKIP
IDLE-->FINISHED: SKIP
CONFIRM_TRADE-->FINISHED: SKIP
CONFIRM_TRADE-->IDLE: CANCEL_SELECTION
CONFIRM_TRADE-->IDLE: CONFIRM_DEAL (index)
IDLE-->IDLE: HOVER (index)
IDLE-->CONFIRM_TRADE: CHOOSE_MARKET_SLOT (index)
FINISHED-->[*]
```

### Trading

Trading is a three-step transaction:
- the current Player proposes a subset of Cards from their Hand for Trade;
- all `Waiting` Players receive a Trade proposal and can adjust an offer before sending it back to the current Player (see [Waiting](#waiting)). While they do so, the current Player resides in `OFFERS_WAITING` state;
- the current Player accepts one of the offers or `SKIP`s
The current Player can also `SKIP` at any stage, canceling all possible changes to the game state. 

```mermaid
stateDiagram-v2
[*]-->FINISHED: SKIP
[*]-->IDLE: RESET
COLLECT-->FINISHED: SKIP
OFFERS_WAITING-->FINISHED: SKIP
OFFERS_CHOOSING-->FINISHED: SKIP
IDLE-->FINISHED: SKIP
COLLECT-->OFFERS_WAITING: SEND_TRADE (TCard[])
COLLECT-->COLLECT: HOVER (index)
COLLECT-->COLLECT: ADD_CARD_TO_TRADE (index)
state remove_last <<choice>>
COLLECT-->remove_last: REMOVE_CARD_FROM_TRADE (index)
remove_last-->IDLE: trade is empty
remove_last-->COLLECT: trade is not empty 
OFFERS_CHOOSING-->FINISHED: ACCEPT_OFFER (player)
IDLE-->IDLE: HOVER (index)
IDLE-->COLLECT: ADD_CARD_TO_TRADE (index)
OFFERS_WAITING-->OFFERS_CHOOSING: GATHER_OFFERS (offers)
FINISHED --> [*]
```

### Playing Cards

Playing Cards is arguably the longest and the most complex Turn Phase, which flowchart significantly depends on type of Card played. The state graph is essentially a loop, which is automatically skipped when the Player runs out of Cards or by 30s timer

```mermaid
stateDiagram-v2
state gotMoreCards <<choice>>
state hasAfterPlanting <<choice>>
state isCropCard <<choice>>
state "TARGET_MODE (Planting Crop)" as TARGET_CROP
state "TARGET_MODE (Crop Effect)" as TARGET_EFFECT
state "TARGET_MODE (Action Card)" as TARGET_ACTION
[*]-->gotMoreCards: RESET
hasAfterPlanting-->TARGET_EFFECT: has "Planted" effect
hasAfterPlanting-->gotMoreCards: has no "Planted" effect
gotMoreCards-->FINISHED: no Cards In Hand
gotMoreCards-->IDLE: has Cards in Hand?
isCropCard-->TARGET_ACTION: Card.type===ACTION
isCropCard-->TARGET_CROP: Card.type===CROP
TARGET_ACTION-->TARGET_ACTION: EXECUTE_ACTION(Card,index?,player?)
TARGET_ACTION-->gotMoreCards: EXECUTE_ACTION(Card,index?,player?)
TARGET_ACTION-->IDLE: CANCEL_SELECTION
TARGET_ACTION-->FINISHED: SKIP
TARGET_CROP-->IDLE: CANCEL_SELECTION
TARGET_CROP-->FINISHED: SKIP
TARGET_CROP-->hasAfterPlanting: PLANT_CROP (Card,index)
TARGET_EFFECT-->IDLE: CANCEL_SELECTION
TARGET_EFFECT-->gotMoreCards: AFTER_PLANT(Card,index?,player?)
TARGET_EFFECT-->FINISHED: SKIP
IDLE-->IDLE: HOVER_CARD (index)
IDLE-->FINISHED: SKIP
IDLE-->isCropCard: CHOOSE_CARD (index)
FINISHED --> [*]
```

### Fertilizing

Fertilizing Phase is pretty straightforward and allows the current Player to expend Fertilizer on their growing Plant (including enemies'), requiring confirmation to apply. By default, the current Player is always in Target Mode (`CROP_OWN` mode). This Phase can't be interrupted by indirect Target Mode.

```mermaid
stateDiagram-v2
state "TARGET_MODE (Fertilizing Crop)" as IDLE
[*]-->FINISHED: SKIP
[*]-->IDLE: RESET
CROP_CONFIRM-->FINISHED: SKIP
IDLE-->FINISHED: SKIP
IDLE-->IDLE: HOVER (index)
IDLE-->CROP_CONFIRM: CHOOSE_CROP (index)
CROP_CONFIRM-->IDLE: CANCEL_SELECTION
CROP_CONFIRM-->IDLE: FERTILIZE (index)
FINISHED --> [*]
```

### Waiting

Waiting Phase is the last Phase of the Turn, and Players transition to that Phase one by one. When the Player has finished their Turn and reside in this state, they might be bothered to place Trade Offers or to enter Target Mode to apply Effects from other Players, notably from them Planting, Fertilizing or Harvesting Crops and from playing Action Cards. Thus, Trade options and Target mode never intersect.

```mermaid
stateDiagram-v2
direction LR
[*]-->IDLE: RESET
IDLE-->FINISHED: SKIP
IDLE-->HAS_TRADE: SEND_TRADE (TCard[])
HAS_TRADE-->OFFER_SENT: MAKE_OFFER (value)
OFFER_SENT-->HAS_TRADE: CANCEL_OFFER
OFFER_SENT-->IDLE: OFFER_ACCEPTED
OFFER_SENT-->IDLE: END_TRADE
HAS_TRADE-->HAS_TRADE: ADD_COINS_TO_OFFER (value)
HAS_TRADE-->HAS_TRADE: REMOVE_COINS_FROM_OFFER (value)
HAS_TRADE-->IDLE: END_TRADE
IDLE-->TARGET_MODE: ENTER_TARGET_MODE (context)
TARGET_MODE-->IDLE: QUIT_TARGET_MODE
TARGET_MODE-->FINISHED:SKIP
[*]-->FINISHED: SKIP 
FINISHED --> [*]
```
