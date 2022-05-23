# FairMinesweeper

## Minesweeper solver

While there are many algorithmic approaches to solving Minesweeper (check
[David Becerra's bachelor thesis](https://dash.harvard.edu/handle/1/14398552))
for an overview, I decided to implement a Minesweeper solver that would just
use the rules that I would normally use as a player.

The solver assumes that all decisions up until now have been correct. In
particular, this means that it will look at flags and treat them as having
certainty that there is a mine. If a flag was incorrectly placed by the user,
then the solver will make incorrect decisions.

These are the rules that I've implemented:

### 1. Single cell opening

If a cell with N mined neighbors already has N mines around it, then all
other neighbors do not contain a mine and can be open.

E.g., as soon as we place a flag next to a cell with a 1, we can open
all of the neighbors of this cell.

### 2. Single cell flagging

If a cell with N mined neighbors has X flags around it, has Y closed cells
around it and X+Y=N, then all the closed cells around it contain mines and
should be flagged.

E.g., if a cell has a 3, it has 1 flagged neighbor and 2 other closed
neighbors, then the 2 closed neighbors also contain mines. 

### 3. Partitioned restrictions
The main idea here is that each cell introduces a set of restrictions upon
its neighbors. We can then combine the restrictions of different cells to
figure out places where there we can guarantee that there is a mine,
or no mine.

Imagine we have this board, where `?` indicates a closed cell:

```
???
111
```

The bottom center cell introduces the restriction that there is exactly one
mine in `{top left, top center, top right}`. Meanwhile, the bottom left cell
lets us know that there is exactly one mine in `{top left, top center}`.
With this knowledge, we can go back to the restriction from the bottom center
cell and split it in to: we have one mine in `{top left, top center}`, and
then the rest `{top right}` cannot have any mines, so we can open it.

Now an example where we can flag a mine:

```
???
121
```

In this case, the bottom center restriction is that there are 2 mines in the
top row. The bottom left restriction doesn't change, so we still have 1 mine
in `{top left, top center}`. So then we partition the bottom middle
restriction into two: there is 1 mine in `{top left, top center}` and 1 mine
in `{top right}`. At that point we can flag the top right square.

Lastly, be aware that we can partition restrictions multiple times. Consider
the following:

```
???
12?
01?
```

These are the restrictions we have then:

```
middle left   -> {top left, top center}: 1 mine
middle center -> {top left, top center, top right, middle right, bottom right}: 2 mines
bottom center -> {middle right, bottom right}: 1 mine
```

We can split the middle center restrictions into two using the knowledge
from `middle left`:

```
middle left   -> {top left, top center}: 1 mine
middle center -> {top left, top center}: 1 mine 
              -> {top right, middle right, bottom right}: 1 mine
bottom center -> {middle right, bottom right}: 1 mine
```

And then, split them again with the knowledge from `bottom center`:

```
middle left   -> {top left, top center}: 1 mine
middle center -> {top left, top center}: 1 mine
              -> {middle right, bottom right}: 1 mine 
              -> {top right}: 0 mines
bottom center -> {middle right, bottom right}: 1 mine
```

The result is that we can now open the top right square as it cannot have
a cell.

#### Frontier

The concept of "frontier" is used extensively in the code, so it requires an
explanation. The frontier is the set of open cells that still have closed,
unflagged neighbors around them; these are the cells that give the player
information during a game. Normally we don't get any information from closed
cells, or from open cells which are surrounded by flags and other open cells.
To get some useful information, the cell needs to have at least one neighbor
that we still don't know about.

### 4. Decision based on number of mines remaining

When the above fails, we can look at the number of mines remaining and see
whether this can be used to know where the mines must be. Consider the
following board (`F` indicates a flagged cell):

```
13F
F4F
2??
1??
```

Just by looking at the board, we cannot make any call here and would need to
resort to a random guess. However, if we know the number of mines left, then
we might be able to determine the location of the mines:

- If there is one mine, it has to be in `row 3, column 2`. (Note that these are 1-indexed)
- If there are three mines, they need to be in `row 3, column 3`, `row 4, column 2` and
  `row 4, column 3`.
- If there are two mines, then they can either be in
    - `row 3, column 2` and `row 4, column 3`
    - or `row 3, column 3` and `row 4, column 2`

This is implemented using a depth-first search where we start trying to place
mines on each of the frontier's neighboring cells and verify that the restrictions
on each of the frontier's cells are upheld. Then we look at the remaining cells,
that is, the closed cells which are not neighbors of the frontier. (In the example
above, that would be the bottom right corner only.) If after we've placed mines
in the frontier's neighboring cells, the number of remaining cells is exactly the
same as the number of non-frontier-neighbors, then all of these must contain a mine.

Note that this is very unlikely to yield any useful results when there are many
mines left as there will be many different possibilities. However, it's actually
quite fast because if it doesn't run out of combinations, it stops as soon as it
finds two possible solutions. If there are several possible solutions, then we can't
know which is the correct one, and so it doesn't make sense to keep looking for more.

Note that the depth-first search is also the mechanism that we use to ensure that
a forced random pick does not result in the player losing the game. If the last
hint that we could provide was to do a random pick and the user clicks on a mined
cell, then we will attempt to set the clicked mine to open, and then run a
depth-first search of possible combinations with that cell open. As soon as we
find a valid solution, we set the board to it, so that the user can keep playing.
In this case, what we do with the non-frontier-neighbor cells is to look at how
many remaining mines there are after we placed the mines in the frontier neighbors,
and then place the remaining mines randomly in the non-frontier neighbors.

### 5. Random pick

If nothing else works, we do a random pick. We will prioritize corners and then
edges because these have the highest probability of uncovering islands as they
only have 3 and 5 neighbors where there could be mines, as opposed to middle
cells, which have 8 neighbors.

While the random pick could be improved a lot (e.g., assigning a probability
value to each cell indicating how likely it is that there is a mine in it), once
that we have ensured that users will not lose due to random picks, it doesn't
really make a lot of sense to improve this.
