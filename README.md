# battle-farm
Implementation of a board game, designed with help of ChatGPT and Midjourney

## Game Rules

Battle farm is a turn based card game for 2-6 players with a deck of crop cards of varying rarity. Every player has a number of garden beds which they can improve and plant different crops to. If a crop yield harvest, a player gains coins. When the game ends, the player with highest amount of coins wins. The __battle__ part of it comes from different abilities, that players can invoke upon each other to gain advantage over each other.

### Game Setup

1. Every Player is randomly assigned 1 of 6 _Classes_
2. Every Player gains 2 common **Beds**, 3 random **Cards**, 6 **Fertilizers** and 4 **Coins**
3. Based on assigned _Class_, the Player gains bonus **Сards**, **Beds**, **Fertilizers** and/or **Coins**. Players does not show their **Cards** to other Players, only their quantity, while the amount of **Fertilizers**, **Coins** and the state of **Beds** are publically visible.
4. Every Player rolls 1d20 to determine the sequence of turns. If two or more players roll the same value, the order between them is chosen randomly
5. Every Player gains 1 to 6 extra **Fertilizers**, in order determined at step 4. That means, the first Player to make a Turn gains 1 extra **Fertilizer**, the second one - 2, and so one.
6. 6 randoms **Cards** are placed on the field at the _Market_ area with their face up
7. Other **Cards** are put in a deck and placed on the field at the _Deck_ area with their face down
8. The game starts with every Player making their turns in the order, determined at step 4

### Turn Phases

Every Player performs their turn in a certain sequence:

1. The Player reduces _Ripe Timer_ on each of **Crops** in their **Beds**. **Crops**, having their _Ripe Timer_ equal to 0, are harvested, being removed from its **Bed** and yielding **Coins** to the Player, equal to the original **Card** value

2. The Player has on option to buy one **Card** from the _Market_, if they have enough **Coins**. The **Coins** are then discarded. The cost of **Card** is defined by its rarity:
    - Common **Cards** - 1 coin
    - Uncommon **Cards** - 2 coins
    - Rare **Cards** - 3 coins
    - Epic **Cards** - 5 coins
    - Mythic **Cards** - 8 coins

    After taking the **Card** from the _Market_, a new one is drawn from the _Deck_ to the same spot. If there are no more **Cards** left in the _Deck_, the current turn becomes the last one for all the following Players, and the Game ends afterwards

3. The Player has an option to propose a trade, offering other Players to buy any subset of his **Cards**. Other Players then suggest the amount of **Coins** they wish to offer, and the current **Player** must accept one of the offers, if any, sealing the deal.

4. The Player can play any number of **Cards** one by one. All the effects of the **Card** must be applied before the next **Card** is played 
    - To play a **Crop Card**, the Player should put it into an empty **Bed**, setting a _Ripe Timer_ on it, dependent on the **Card** rarity:
        - Common **Crops** - 1 Turn
        - Uncommon **Crops** - 2 Turns
        - Rare **Crops** - 3 Turns
        - Epic **Crops** - 4 Turns
        - Mythic **Crops** - 5 Turns
    - To play an **Action Card**, the Player should discard a number of **Fertilizers**, equal to **Card** value. The **Card** is then discarded, unless it's marked with `Replayable`.
5. The Player can use up to 1d6 (rolled every time) **Fertilizers** to reduce _Ripe Timer_ on any **Crop** in their **Beds**, by 1 turn per **Crop** per 1 unit of **Fertilizers**. If _Ripe Timer_ is reduced to zero on any given **Crop**, it is immediately harvested, yielding **Coins**, but the emptied **Bed** can't be planted the same turn.
6. If by the end of their turn the Player has 100 or more **Coins**, the current turn becomes the last one for all the following Players, and the Game ends afterwards 

### Garden Beds
or just **Beds** are spots are where **Crops** are grown. They are positioned in front of each Player and are visible to all participants of the Game. When a Player plays a **Crop Card**, he plants that **Crop** in a **Garden Bed**, setting its _Ripe Timer_. **Beds** come in a variety of types, providing different bonuses and mechanics. Player _Classes_ start with different sets of **Beds**, and they can be changed, acquired or destroyed during the Game with special **Cards**.

| Garden Bed | Special Bonus |
| --- | --- |
| Common Bed | No bonuses |
| Raised Bed | +2 **Coin** from Rare, Epic and Mythic **Crops** |
| Greenhouse | Can't be targeted by negative Abilities |
| Hydroponic | -1 _Ripe Timer_ for Rare, Epic and Mythic **Crops** |
| Trellis | +1 **Coin** from `Green` **Crops** |
| Rotational Bed| +1 **Coin** from `Yellow` **Crops** |
| Vertical Bed| +1 **Coin** from `Red` **Crops** |

### Crop Cards

### Action Cards

**Action Cards** require **Fertilizers** as expendables to be played. There is a set quantity of each **Action Card** in a _Deck_, depending on its Rarity.

| Name | Cost | Rarity | Quantity | Effect |
| --- | --- | --- | ---| --- |
| Garden Gourmet | 1 | Common | 8 | Choose a growing **Crop**, it's value is increased by this card's value |
| Fertilizer Frenzy | 1 | Common | 8 | Choose a growing **Crop**. For each grade of that **Crop** Rarity, reduce it's value by 1 (1 for Common, 2 for Uncommon, etc.), down to 0 |
| Recycle | 0 | Common | 8 | Discard a **Card** from your hand. For each grade of that **Card** Rarity, gain 1 **Fertilizer** (1 for Common, 2 for Uncommon, etc.), down to 0 |
| Lucky Find | 0 | Common | 8 | Gain 1d4 **Coins** |
| Weed Whacker | 1 | Uncommon | 6 | Gain as many **Coins**, as you have growing **Crops** | 
| Pest Control | 3 | Uncommon | 6 | All your growing **Crops** increase their value by 1 |
| Selection | 2 | Uncommon | 6 | Pick any other **Card** in your hand and increase its value by 1 |
| Pollinator Paradise | 2 | Rare | 4 | Draw two extra **Cards** from the _Deck_. Pick 1 to be added to your hand, return another one to the _Deck_ |
| Clone | 4 | Rare | 4 | Choose any growing **Crop**. Add an identical **Crop Card** to your hand |
| Garden Gnome | 1 | Rare | 4 | Chosen Player discards 1 random **Card** from their hand for every unit of this **Card** cost |
| Trellis Bed | 2 | Epic | 2 | Transform any **Bed** into `Trellis` |
| Vertical Bed | 2 | Epic | 2 | Transform any **Bed** into `Vertical Bed` |
| Rotational Bed | 2 | Epic | 2 | Transform any **Bed** into `Rotational Bed` |
| Green Grocer | 1 | Mythical | 1 | Roll d6 for each unit of this **Card** value. Gain as many **Fertilizers** |
| Thorny Fence | 3 | Mythical | 1 | Chosen Oponnent discards as many **Cards** from his hand, as you have growing **Crops** |
| Retractable Greenhouse | 3 | Mythical | 1 | Transform any **Bed** into `Greenhouse` | 

### Classes
Every Player is playing a certain _Class_, which defines his set of **Beds**, starting **Cards**, **Coins** and provies them with a unique **Action Card**.
| Class | Starting Bonus | Starting Beds | Action Card | Action Card Cost |
| --- | --- | --- | --- | --- |
| Land Baron  | +1 Rare **Crop Card** | 2 Common, 2 Greenhouse | `Land Acquisition`: once per game, restore any previously discarded card to your hand | 0 |
| Harvest Freak | +2 Common **Crop Card** | 2 Common, 2 Raised | `Reap and Sow (replayable)`: once per turn, swap any other **Card** with a random **Card** from _Deck_ | 1 **Fertilizers** |
| Master Gardener | +2 **Fertilizers** | 5 Common | `Early Bird (replayable)`: once per turn, transform any of your **Beds** into `Trellis`,`Rotational Bed` or `Vertical Bed` | 4 **Fertilizers** 
| Crop Scientist | +2 **Action Cards** | 2 Common, 2 Hydroponic | `Genetic Modification (replayable)`: once per turn, pick any growing **Crop** and increase its value by 3 | 2 **Fertilizer** |
| Market Trader | +3 **Coins** | 2 Common, 1 Raised, 1 Greenhouse | `Stonks`: once per game, pick a **Card** from the _Market_ and add it to your hand. Then, discard all the other **Cards** in the _Market_ and refill it with new **Cards** from the _Deck_ | 3 **Fertilizers** |
| Weather Watcher | +1 **Fertilizer**, +1 **Coin** | 2 Common, 1 Raised, 1 Hydroponic | `Cloud Cover (replayable)`: once per turn, pick an oponnent's **Bed**. If it has a growing **Crop**, its _Ripe Timer_ is increased by 1 turn. | 1 **Fertilizer** |

