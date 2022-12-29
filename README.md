# battle-farm
Implementation of a board game, designed with help of ChatGPT and Midjourney

## Game Rules

Battle farm is a turn based card game for 2-6 players with a deck of crop cards of varying rarity. Every player has a number of garden beds which they can improve and plant different crops to. If a crop yield harvest, a player gains coins. When the game ends, the player with highest amount of coins wins. The __battle__ part of it comes from different abilities, that players can invoke upon each other to gain advantage over each other.

### Game Setup

1. Every Player is randomly assigned 1 of 6 _Classes_
2. Every Player gains 2 basic **Beds**, 3 random **Cards**, 6 **Fertilizers** and 4 **Coins**
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
    - To play an **Action Card**, the Player should discard a number of **Fertilizers**, equal to **Card** value. The **Card** is then discarded.
5. The Player can use up to 1d6 (rolled every time) **Fertilizers** to reduce _Ripe Timer_ on any **Crop** in their **Beds**, by 1 turn per **Crop** per 1 unit of **Fertilizers**. The _Ripe Timer_ can be never be reduced below 1 on any given **Crop**.
6. If by the end of their turn the Player has 100 or more **Coins**, the current turn becomes the last one for all the following Players, and the Game ends afterwards 

### Crop Cards

### Action Cards

### Classes
Every Player is playing a certain _Class_, which defines his set of **Beds**, starting **Cards**, **Coins** and provides them a unique ability, which can be used once per game.
