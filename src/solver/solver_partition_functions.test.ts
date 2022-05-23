import {
  GameBoardWithoutMineInfo,
  GameCellWithoutMineInfo,
} from "./solver_types";
import { trySolvingSomePartition } from "./solver_partition_functions";
import { getFrontier } from "./solver_helper_functions";

// 1 1
// ? ?
const unsolvableBoard: GameBoardWithoutMineInfo = {
  cells: [
    [
      {
        columnIndex: 0,
        numNeighborsWithMines: 1,
        rowIndex: 0,
        status: "open",
      },
      {
        columnIndex: 1,
        numNeighborsWithMines: 1,
        rowIndex: 0,
        status: "open",
      },
    ],
    [
      {
        columnIndex: 0,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 1,
        rowIndex: 1,
        status: "closed",
      },
    ],
  ],
  numOpenedCells: 0,
  numFlagsLeft: 1,
  numTotalMines: 1,
};

// 1 1 1 ?
// ? ? ? ?
const solvableBoardOpenOne: GameBoardWithoutMineInfo = {
  cells: [
    [
      {
        columnIndex: 0,
        numNeighborsWithMines: 1,
        rowIndex: 0,
        status: "open",
      },
      {
        columnIndex: 1,
        numNeighborsWithMines: 1,
        rowIndex: 0,
        status: "open",
      },
      {
        columnIndex: 2,
        numNeighborsWithMines: 1,
        rowIndex: 0,
        status: "open",
      },
      {
        columnIndex: 3,
        rowIndex: 0,
        status: "closed",
      },
    ],
    [
      {
        columnIndex: 0,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 1,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 2,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 3,
        rowIndex: 1,
        status: "closed",
      },
    ],
  ],
  numOpenedCells: 0,
  numFlagsLeft: 1,
  numTotalMines: 1,
};

// 1 2 2 ?
// ? ? ? ?
const solvableBoardFlagOne: GameBoardWithoutMineInfo = {
  cells: [
    [
      {
        columnIndex: 0,
        numNeighborsWithMines: 1,
        rowIndex: 0,
        status: "open",
      },
      {
        columnIndex: 1,
        numNeighborsWithMines: 2,
        rowIndex: 0,
        status: "open",
      },
      {
        columnIndex: 2,
        numNeighborsWithMines: 2,
        rowIndex: 0,
        status: "open",
      },
      {
        columnIndex: 3,
        rowIndex: 0,
        status: "closed",
      },
    ],
    [
      {
        columnIndex: 0,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 1,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 2,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 3,
        rowIndex: 1,
        status: "closed",
      },
    ],
  ],
  numOpenedCells: 0,
  numFlagsLeft: 2,
  numTotalMines: 2,
};

// ? ? ?
// 1 2 ?
// 0 1 ?
const solvableBoardOpenOneWithSubpartitions: GameBoardWithoutMineInfo = {
  cells: [
    [
      { columnIndex: 0, rowIndex: 0, status: "closed" },
      { columnIndex: 1, rowIndex: 0, status: "closed" },
      { columnIndex: 2, rowIndex: 0, status: "closed" },
    ],
    [
      { columnIndex: 0, numNeighborsWithMines: 1, rowIndex: 1, status: "open" },
      { columnIndex: 1, numNeighborsWithMines: 2, rowIndex: 1, status: "open" },
      { columnIndex: 2, rowIndex: 1, status: "closed" },
    ],
    [
      { columnIndex: 0, numNeighborsWithMines: 0, rowIndex: 2, status: "open" },
      { columnIndex: 1, numNeighborsWithMines: 1, rowIndex: 2, status: "open" },
      { columnIndex: 2, rowIndex: 2, status: "closed" },
    ],
  ],
  numOpenedCells: 0,
  numFlagsLeft: 2,
  numTotalMines: 2,
};

describe("trySolvingSomePartition", () => {
  it("does not solve an unsolvable board", () => {
    expect(
      trySolvingSomePartition({
        board: unsolvableBoard,
        frontier: getFrontier(unsolvableBoard),
      })
    ).toBeUndefined();
  });

  it("solves a simple restriction forcing to open a cell", () => {
    const result = trySolvingSomePartition({
      board: solvableBoardOpenOne,
      frontier: getFrontier(solvableBoardOpenOne),
    });
    result?.commonRegion.sort(sortCellsFn);
    expect(result).toEqual({
      cells: [solvableBoardOpenOne.cells[1][2]],
      commonRegion: [
        solvableBoardOpenOne.cells[1][0],
        solvableBoardOpenOne.cells[1][1],
      ],
      numMinesInCommonRegion: 1,
      restrictedCells: [solvableBoardOpenOne.cells[0][1]],
      restrictingCells: [solvableBoardOpenOne.cells[0][0]],
      type: "open",
    });
  });

  it("solves a simple restriction forcing to flag a cell", () => {
    const result = trySolvingSomePartition({
      board: solvableBoardFlagOne,
      frontier: getFrontier(solvableBoardFlagOne),
    });
    result?.commonRegion.sort(sortCellsFn);
    expect(result).toEqual({
      cells: [solvableBoardFlagOne.cells[1][2]],
      commonRegion: [
        solvableBoardFlagOne.cells[1][0],
        solvableBoardFlagOne.cells[1][1],
      ],
      numMinesInCommonRegion: 1,
      reason: "partition",
      restrictedCells: [solvableBoardFlagOne.cells[0][1]],
      restrictingCells: [solvableBoardFlagOne.cells[0][0]],
      type: "flag",
    });
  });

  it("solves a combined restriction forcing to flag a cell", () => {
    const result = trySolvingSomePartition({
      board: solvableBoardOpenOneWithSubpartitions,
      frontier: getFrontier(solvableBoardOpenOneWithSubpartitions),
    });
    // There are two possible outcomes here. As there are three working
    // restrictions here, depending on the order in which they get
    // applied, we might get that the restricted cells are the top row
    // or the right column. So I will just be testing that it tells us
    // to open the only cell which is guaranteed not to contain a mine.
    expect(result?.cells).toEqual([
      solvableBoardOpenOneWithSubpartitions.cells[0][2],
    ]);
    expect(result?.type).toBe("open");
  });
});

const sortCellsFn = (
  a: GameCellWithoutMineInfo,
  b: GameCellWithoutMineInfo
): number =>
  a.rowIndex < b.rowIndex
    ? -1
    : a.rowIndex > b.rowIndex
    ? 1
    : a.columnIndex - b.columnIndex;
