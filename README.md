Battle Farm
=================

## Table of Contents

   * [Trivia](#trivia)
   * [Game Setup](#game-setup)
   * [Turn Phases](#turn-phases)
      * [Win Limit](#win-limit)
   * [Garden Beds](#garden-beds)
   * [Cards](#cards)
      * [Rarity](#rarity)
      * [Crop Cards](#crop-cards)
      * [Action Cards](#action-cards)
   * [Classes](#classes)

## Trivia

`Battle Farm` is a turn based card game for 2-6 players with a deck of crop cards of varying rarity. Every player has a number of garden beds which they can improve and plant different crops to. If a crop yield harvest, a player gains coins. When the game ends, the player with the highest amount of coins wins. The __battle__ part of it comes from different abilities, that players can invoke upon each other to gain advantage.

## Game Setup

1. Every Player is randomly assigned 1 of 6 _Classes_
2. Every Player gains 1 common **Bed**, 3 random **Cards**, 4 **Fertilizers** and 3 **Coins**
3. Based on assigned _Class_, the Player gains bonus **Cards**, **Beds**, **Fertilizers** and/or **Coins**. Players do not show their **Cards** to other Players, only their quantity, while the amount of **Fertilizers**, **Coins** and the state of **Beds** are publicly visible.
4. Every Player rolls 1d20 to determine the sequence of turns. If two or more players roll the same value, the order between them is chosen randomly
5. Every Player gains 1 to 6 extra **Fertilizers**, in order determined at step 4. That means, the first Player to make a Turn gains 1 extra **Fertilizer**, the second one - 2, and so on.
6. 6 randoms **Cards** are placed on the field at the _Market_ area with their face up
7. Other **Cards** are put in a deck and placed on the field at the _Deck_ area with their face down
8. The game starts with every Player making their turns in the order, determined at step 4

## Turn Phases

Every Player performs their turn in a certain sequence:

1. The Player reduces `Reap Timer` on each of **Crops** in their **Beds**. **Crops**, having their `Reap Timer` equal to 0, are Harvested, being removed from its **Bed** and yielding **Coins** to the Player, equal to its `Crop Value`

2. The Player has on option to acquire up to 1d4 **Cards** from the _Market_, if they have enough **Coins**. The **Coins** are then discarded. 

   After taking the **Card** from the _Market_, a new one is drawn from the _Deck_ and placed to the same spot. If there are no more **Cards** left in the _Deck_, the current turn becomes the last one for all the following Players, and the Game ends afterwards

3. The Player has an option to propose a trade, offering other Players to buy any subset of his **Cards**. Other Players then suggest the amount of **Coins** they wish to offer, and the current **Player** can accept one of the offers, if any, sealing the deal.

4. The Player can play any number of **Cards** one by one. All the effects of the **Card** must be applied before the next **Card** is played 
    - To play a **Crop Card**, the Player should Plant it into an empty **Bed**, setting a `Reap Timer` on it, depending on the **Card** rarity.
    - To play an **Action Card**, the Player should discard a number of **Fertilizers**, equal to **Card** value. The **Card** is then discarded, unless it's marked with `Replayable`.
5. The Player can use 1d4 **Fertilizers** to reduce the `Reap Timer` on any **Crop** in their **Beds** by 1 turn per **Crop** per **Fertilizer**. If the `Reap Timer` is reduced to zero on any given **Crop**, it is immediately harvested, yielding **Coins**, but the emptied **Bed** can't be planted the same turn.
6. If by the end of their turn the Player has reached the `Win Limit` of **Coins**, the current turn becomes the last one for all the following Players, and the Game ends afterwards 

### Win Limit 
The `Win Limit` of **Coins** is set at the beginning of the Game depending on number of Players, and is calculated as
> 44 + 6 * `Total number of players` + `Total sum of Crop Card values in Deck` / (1 + `Total number of Players`) rounded up

For instance, if a 1v1 Game is started with standard Deck, the `Win Limit` would be `44 + 12 + 582 / 3` = **250 Coins**

| Number of Players | Win Limit |
|-------------------|-----------|
| 2                 | 250       |
| 3                 | 208       |
| 4                 | 185       |
| 5                 | 171       | 
| 6                 | 164       |

## Garden Beds
or just **Beds** are spots are where **Crops** are grown. They are positioned in front of each Player and are visible to all participants of the Game. When a Player plays a **Crop Card**, he plants that **Crop** in a **Garden Bed**, setting its `Reap Timer`. **Beds** come in a variety of types, providing different bonuses and mechanics. Player _Classes_ start with different sets of **Beds**, and they can be changed, acquired or destroyed during the Game with special **Cards**.

| Garden Bed     | Special Bonus                                        |
|----------------|------------------------------------------------------|
| Common Bed     | No bonuses                                           |
| Raised Bed     | +2 `Crop Value` for Rare, Epic and Mythic **Crops**  |
| Greenhouse     | The **Crop** can't be targeted by negative Abilities |
| Hydroponic     | -1 `Reap Timer` for Rare, Epic and Mythic **Crops**  |
| Trellis        | +1 `Crop Value` for `Yellow` **Crops**               |
| Rotational Bed | +1 `Crop Value` for `Red` **Crops**                  |
| Vertical Bed   | +1 `Crop Value` for `Green` **Crops**                |

## Cards

**Cards** are the main expendable source of the Game. There is a set quantity of each **Card** in the _Deck_, and, once the _Deck_ is over, the Game is over too, if it was not finished earlier. Every Player gets a given number of **Cards** in the beginning of the Game, depending on their _Class_, and 6 more are placed at _Market_ their face up. All the rest reside in _Deck_ until required by certain actions. So at every moment of the Game every Player sees only their hand and the _Market_, as well as planted **Crops**, which were previously **Crop Cards**.

### Rarity

**Crops** come in 5 different Rarity grades, which define their `Seed Cost`, which is the amount of **Coins** a Player must discard to obtain a **Crop Card** of a given rarity from the  _Market_:
- `Common` **Cards** - 1 **Coin**
- `Uncommon` **Cards** - 2 **Coins**
- `Rare` **Cards** - 3 **Coins**
- `Epic` **Cards** - 5 **Coins**
- `Mythic` **Cards** - 8 **Coins**

### Crop Cards

**Crop Cards** are the main source of Players income, with their value converted to **Coins** if a Player manages to plant and then harvest it

When played, a **Crop Card** must be planted (placed) in an empty **Garden Bed**, becoming the same **Crop**, where it starts the countdown to harvest, called
`Reap Timer`:
- `Common` **Crops** - 1 Turn
- `Uncommon` **Crops** - 2 Turns
- `Rare` **Crops** - 3 Turns
- `Epic` **Crops** - 4 Turns
- `Mythic` **Crops** - 5 Turns

After the given number of turns, the **Crop** is discarded from the **Bed**, granting **Coins** to the owning Player, equal to its `Crop Value`. The `Value` of the **Crop** and its `Reap Timer` can be modified during growth with other **Cards**. Combination of this params and acquisition cost is calculated as Gold Per Turn (`GPT`):
> `Gold Per Turn` = ( `Crop Value` - `Seed Cost` ) / `Reap Timer`

Number of **Crop Cards** of each Rarity decreases with its grade, and there is a known limit on every **Crop** type, however certain **Action Cards** and _Class_ bonuses can add more cards of certain type to the game above that limit.

All **Crops** are divided into 3 groups: `Red`, `Green` and `Yellow`. Those groups don't have any properties themselves, but affect how particular **Crops** interact with **Beds**, **Action Cards** and each other. 

|                           Name                            | Group    |           Quantity | Effect                                                                                                                                                                                              | Seed Cost | Crop Value | Ripe Timer | GPT |
|:---------------------------------------------------------:|----------|-------------------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|------------|------------|-----|
|        ![Wheat](assets/crops/wheat.png) **Wheat**         | `Yellow` |   `Common`:&nbsp;8 | `Bake it Up`: when Fertilized, increases its Crop Value by 1                                                                                                                                        | 1         | 2          | 1          | 1   |
|       ![Cherry](assets/crops/cherry.png) **Cherry**       | `Red`    |   `Common`:&nbsp;8 | `Cherry Picking`: gain 1 extra **Coin** for every other harvested `Cherry`                                                                                                                          | 1         | 2          | 1          | 1   |
|     ![Cabbage](assets/crops/cabbage.png) **Cabbage**      | `Green`  |        `Common`: 8 | `Head of Green`: when Planted, gain 1 **Coin** for every other growing `Green` **Crop**                                                                                                             | 1         | 2          | 1          | 1   |
|          ![Corn](assets/crops/corn.png) **Corn**          | `Yellow` |   `Common`:&nbsp;8 | `Yellow Patch`: when Planted, gain 1 **Coin** for every other growing `Yellow` **Crop**                                                                                                             | 1         | 3          | 1          | 2   |
|      ![Carrots](assets/crops/carrot.png) **Carrots**      | `Red`    |   `Common`:&nbsp;8 | `Red Alert`: when Planted, gain 1 **Coin** for every other growing `Red` **Crop**                                                                                                                   | 1         | 3          | 1          | 2   |
|       ![Onions](assets/crops/onion.png) **Onions**        | `Green`  |   `Common`:&nbsp;8 | `Onion Ring`: when Planted, gain 1 **Fertilizer** for every other `Onion` in your hand                                                                                                              | 1         | 3          | 1          | 2   |
|        ![Mango](assets/crops/mango.png) **Mango**         | `Yellow` | `Uncommon`:&nbsp;6 | `Mango Madness`: when Planted, steal 1 random **Card** from Opponents' hands                                                                                                                        | 2         | 5          | 2          | 1.5 |
|       ![Tomato](assets/crops/tomato.png) **Tomato**       | `Red`    | `Uncommon`:&nbsp;6 | `Catch up`: gains +1 `Crop Value` for every Opponent with more **Coins** than you                                                                                                                   | 2         | 5          | 2          | 1.5 |
|       ![Potato](assets/crops/potato.png) **Potato**       | `Green`  | `Uncommon`:&nbsp;6 | `Root Rot`: when Harvested, roll 1d4. If you roll 4, get a `Potato` **Card**, otherwise gain 1 **Fertilizer**                                                                                       | 2         | 5          | 2          | 1.5 |
|        ![Melon](assets/crops/melon.png) **Melon**         | `Yellow` | `Uncommon`:&nbsp;6 | `Melon Mania`: gain 1d4 extra **Coins** for every `Melon` Harvested after the 1st one                                                                                                               | 2         | 6          | 2          | 2   |
|        ![Beans](assets/crops/beans.png) **Beans**         | `Red`    | `Uncommon`:&nbsp;6 | `Beanstalk`: when Harvested, choose an Opponent that must give you either a **Coin** or a **Fertilizer**                                                                                            | 2         | 6          | 2          | 2   |
|       ![Wasabi](assets/crops/wasabi.png) **Wasabi**       | `Green`  | `Uncommon`:&nbsp;6 | `Radish Rally`: when Planted, steal 1d4 **Coins** from a chosen Opponent, if you have another `Wasabi` in hand                                                                                      | 2         | 6          | 2          | 2   |
|  ![Pineapple](assets/crops/pineapple.png) **Pineapple**   | `Yellow` |     `Rare`:&nbsp;4 | `Pineapple Punch`: when Harvested, destroy a **Crop** of your choice.                                                                                                                               | 3         | 9          | 3          | 2   |
|    ![Eggplant](assets/crops/eggplant.png) **Eggplant**    | `Red`    |     `Rare`:&nbsp;4 | `Eggplant Emoji`: when Planted, pick a **Crop**. It loses 1 Value, and has its `Reap Timer` increased by 1                                                                                          | 3         | 9          | 3          | 2   | 
|      ![Peppers](assets/crops/pepper.png) **Peppers**      | `Green`  |     `Rare`:&nbsp;4 | `Spicy Sprinkle`: when Harvested, roll 1d4. That many Value is distributed among your **Crop Cards** in hand                                                                                        | 3         | 9          | 3          | 2   |
|  ![Tangerine](assets/crops/tangerine.png) **Tangerine**   | `Yellow` |     `Epic`:&nbsp;2 | `Sweet and Sour`: when Planted and Harvested, all other growing **Crops** gain 1 Value                                                                                                              | 5         | 15         | 4          | 2.5 |
|     ![Pumpkin](assets/crops/pumpkin.png) **Pumpkin**      | `Red`    |     `Epic`:&nbsp;2 | `Trick or Treat`: when Harvested, all Players give you 1 **Coin** for every **Fertilizer** they have                                                                                                | 5         | 15         | 4          | 2.5 |
|        ![Grapes](assets/crops/grape.png) **Grape**        | `Green`  |     `Epic`:&nbsp;2 | `Grapevine`: when Harvested from `Common Bed` or `Raised Bed`, transform it into `Hydroponics`. Otherwise gain extra 4 **Coins**                                                                    | 5         | 15         | 4          | 2.5 |
| ![Cloudberry](assets/crops/cloudberry.png) **Cloudberry** | `Yellow` |   `Mythic`:&nbsp;1 | `Berry Blitz`: when Planted, all Players lose 1 **Coin** and 1 **Fertilizer** for every **Card** in their hand and every growing **Crop**                                                           | 8         | 21         | 5          | 2.6 |
| ![Strawberry](assets/crops/strawberry.png) **Strawberry** | `Red`    |   `Mythic`:&nbsp;1 | `Ripe for the Picking`: when Harvested, pick any other **Crop** on the field. Gain its `Crop Value` in **Coins**                                                                                    | 8         | 23         | 5          | 3   |
|  ![Blueberry](assets/crops/blueberry.png) **Blueberry**   | `Green`  |   `Mythic`:&nbsp;1 | `Blueberry Boom`: when Planted, pick an Opponent's **Bed**. It's downgraded to a `Common Bed`, and its **Crop**, if any, is destroyed. If the **Bed** was a `Greenhouse`, the **Crop** is preserved | 8         | 22         | 5          | 2.8 |

That makes up for a total of **105 Crop Cards** with a total `Crop Value` of **582 Coins**


### Action Cards

**Action Cards** require **Fertilizers** as expendables to be played. There is a set quantity of each **Action Card** in a _Deck_, and they come in the same 5 Rarities as **Crop Cards**.

| Name                     | Cost |           Quantity | Effect                                                                                                                                                                                  |
|--------------------------|------|-------------------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Garden Gourmet`         | 1    |   `Common`:&nbsp;6 | Choose a growing **Crop**, it's value is increased by this card's value                                                                                                                 |
| `Fertilizer Frenzy`      | 1    |   `Common`:&nbsp;6 | Choose a growing **Crop**. For each grade of that **Crop** Rarity, reduce it's value by 1 (1 for Common, 2 for Uncommon, etc.), down to 0                                               |
| `Recycle`                | 0    |   `Common`:&nbsp;6 | Discard a **Card** from your hand. For each grade of that **Card** Rarity, gain 1 **Fertilizer** (1 for Common, 2 for Uncommon, etc.), down to 0                                        |
| `Lucky Find`             | 1    |   `Common`:&nbsp;6 | Gain 1d6 **Coins**                                                                                                                                                                      |
| `Green Day `             | 1    |   `Common`:&nbsp;6 | Gain 1 **Coin** for each `Green` **Crop Card** in hand                                                                                                                                  |
| `Red Alert`              | 1    |   `Common`:&nbsp;6 | Gain 1 **Coin** for each `Red` **Crop Card** in hand                                                                                                                                    |
| `Yellow Warning`         | 1    |   `Common`:&nbsp;6 | Gain 1 **Coin** for each `Yellow` **Crop Card** in hand                                                                                                                                 |
| `Weed Whacker`           | 1    | `Uncommon`:&nbsp;4 | Gain as many **Coins**, as you have growing **Crops**                                                                                                                                   | 
| `Pest Control`           | 3    | `Uncommon`:&nbsp;4 | All your growing **Crops** increase their value by 1                                                                                                                                    |
| `Selection`              | 3    | `Uncommon`:&nbsp;4 | Pick any other **Card** in your hand and increase its value by 5                                                                                                                        |
| `Flower Power`           | 3    | `Uncommon`:&nbsp;4 | Gain 1 **Fertilizer** for each unique growing **Crop** on the game field                                                                                                                |
| `Fungus Infiltration`    | 3    | `Uncommon`:&nbsp;4 | All currently grown **Crops** of a chosen `Color`  field lose 1 value. The value can't be reduced below 1                                                                               |
| `Thorny Fence`           | 3    |     `Rare`:&nbsp;3 | Gain **1 Fertilizer** for every growing **Crop** in your garden                                                                                                                         |
| `Soil Enrichment`        | 2    |     `Rare`:&nbsp;3 | All currently growing **Crops** in your beds have their _Ripe Timer_ reduced by 1                                                                                                       |
| `Seed Sprout`            | 3    |     `Rare`:&nbsp;3 | Draw 1 **Card** from the _Deck_ for each unique `Color` of growing **Crops** in your garden, up to 4                                                                                    |
| `Pollinator Paradise`    | 2    |     `Rare`:&nbsp;3 | Take two **Cards** from the _Deck_.Pick 1 **Card** to be added to your hand, return another one to the _Deck_. Gain 1 **Fertilizer** for each **Card** of the same `Color` in your hand |
| `Retractable Greenhouse` | 1    |     `Rare`:&nbsp;3 | Transform any **Bed** into `Greenhouse`, keeping the **Crop** safe.                                                                                                                     | 
| `Garden Gnome`           | 1    |     `Rare`:&nbsp;3 | Every Opponent discards 1 random **Card** from their hand for every unit of this **Card** cost                                                                                          |
| `Trellis Bed`            | 2    |     `Epic`:&nbsp;2 | Transform any **Bed** into `Trellis`                                                                                                                                                    |
| `Vertical Bed`           | 2    |     `Epic`:&nbsp;2 | Transform any **Bed** into `Vertical Bed`                                                                                                                                               |
| `Rotational Bed`         | 2    |     `Epic`:&nbsp;2 | Transform any **Bed** into `Rotational Bed`                                                                                                                                             |
| `Stonks`                 | 4    |     `Epic`:&nbsp;2 | Take 1 random **Card** from the _Market_ and add it to your hand. Then, return the remaining **Cards** to the _Deck_ randomly and refill the _Market_                                   |
| `Grocery Composture`     | 1    | `Mythical`:&nbsp;1 | Roll d6 for each unit of this **Card** value. Gain as many **Fertilizers**                                                                                                              |
                                                                                 |
| `Drought`                | 4    | `Mythical`:&nbsp;1 | Discard all **Cards** from _Market_ and your _Hand_. For every **Card** discarded, gain **1 Coin**                                                                                      |
| `Clone`                  | 4    | `Mythical`:&nbsp;1 | Choose any growing **Crop**. Add an identical **Crop Card** to your hand                                                                                                                |
| `Wither (repeatable)`    | 3    | `Mythical`:&nbsp;1 | Once per turn, choose any growing **Crop**. Its `Crop Value` is set to 1                                                                                                                |

## Classes
Every Player is playing a certain _Class_, which defines his set of **Beds**, starting **Cards**, **Coins** and provides them with a unique **Action Card**

|                                   Class                                    | Starting Bonus                   | Starting Beds                        | Action Card                                                                                                                                                                                | Action Card Cost  |
|:--------------------------------------------------------------------------:|----------------------------------|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
|        ![Land Baron](assets/classes/land_baron.png) **Land Baron**         | +2 **Coins**                     | 1 Common, 2 Greenhouse               | `Land Acquisition`: once per game, restore two previously discarded cards to your hand                                                                                                     | 0                 |
|       ![Grim Reaper](assets/classes/the_reaper.png) **Grim Reaper**        |                                  | 1 Common, 2 Raised                   | `Reap and Sow (replayable)`: once per turn, swap any other **Card** with a random **Card** from _Deck_                                                                                     | 1 **Fertilizers** |
| ![Master Gardener](assets/classes/master_gardener.png) **Master Gardener** | +2 **Fertilizers**               | 4 Common                             | `Early Bird (replayable)`: once per turn, transform any of your **Beds** into `Trellis`,`Rotational Bed` or `Vertical Bed`                                                                 | 4 **Fertilizers** |
|  ![Crop Scientist](assets/classes/crop_scientist.png) **Crop Scientist**   | +1 Random Common **Action Card** | 1 Common, 2 Hydroponic               | `Genetic Modification (replayable)`: once per turn, pick any growing **Crop** and increase its value by 1                                                                                  | 1 **Fertilizer**  |
|       ![Seed Trader](assets/classes/seed_trader.png) **Seed Trader**       | +1 Random Common **Crop Card**   | 1 Common, 1 Greenhouse, 1 Raised     |                                                                                                                                                                                           | 3 **Fertilizers** |
| ![Weather Watcher](assets/classes/weather_watcher.png) **Weather Watcher** | +1 **Fertilizer**, +1 **Coin**   | 1 Common, 1 Greenhouse, 1 Hydroponic | `Cloud Cover (replayable)`: once per turn, pick an opponent's **Bed**. If it has a growing **Crop**, its `Reap Timer` is increased by 1 turn.                                              | 1 **Fertilizer**  |

