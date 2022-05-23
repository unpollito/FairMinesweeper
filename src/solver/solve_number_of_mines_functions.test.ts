import { GameBoardWithoutMineInfo } from "./solver_types";
import { trySolvingBasedOnNumberOfMines } from "./solve_number_of_mines_functions";
import { getFrontier } from "./solver_helper_functions";

// Board to test:
// 1 3 F
// F 4 F
// 2 ? ?
// 1 ? ?
// Depending on the number of mines left, this can have several solutions:
// 1 mine -> has to be in {[2, 2]}
// 2 mines -> can either be in {[2,2], [3, 3]} or {[2,3], [3,2]}
// 3 mines -> must be in {[2,3], [3,2], [3,3]}
const baseBoard: Omit<
  Omit<GameBoardWithoutMineInfo, "numFlagsLeft">,
  "numTotalMines"
> = {
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
        numNeighborsWithMines: 3,
        rowIndex: 0,
        status: "open",
      },
      {
        columnIndex: 2,
        rowIndex: 0,
        status: "flagged",
      },
    ],
    [
      {
        columnIndex: 0,
        rowIndex: 1,
        status: "flagged",
      },
      {
        columnIndex: 1,
        numNeighborsWithMines: 4,
        rowIndex: 1,
        status: "open",
      },
      {
        columnIndex: 2,
        rowIndex: 1,
        status: "flagged",
      },
    ],
    [
      {
        columnIndex: 0,
        numNeighborsWithMines: 2,
        rowIndex: 2,
        status: "open",
      },
      {
        columnIndex: 1,
        rowIndex: 2,
        status: "closed",
      },
      {
        columnIndex: 2,
        rowIndex: 2,
        status: "closed",
      },
    ],
    [
      {
        columnIndex: 0,
        numNeighborsWithMines: 1,
        rowIndex: 3,
        status: "open",
      },
      {
        columnIndex: 1,
        rowIndex: 3,
        status: "closed",
      },
      {
        columnIndex: 2,
        rowIndex: 3,
        status: "closed",
      },
    ],
  ],
  numOpenedCells: 5,
};

describe("trySolvingBasedOnNumberOfMines", () => {
  it("gets the right solution for the sample board and 1 mine", () => {
    const board: GameBoardWithoutMineInfo = {
      ...baseBoard,
      numTotalMines: 4,
      numFlagsLeft: 1,
    };
    const frontier = getFrontier(board);
    expect(trySolvingBasedOnNumberOfMines({ board, frontier })).toEqual({
      cells: [board.cells[2][1]],
      numberOfMines: 1,
      reason: "numberOfMines",
      type: "flag",
    });
  });

  it("does not get a solution for the sample board and 2 mines", () => {
    const board: GameBoardWithoutMineInfo = {
      ...baseBoard,
      numTotalMines: 5,
      numFlagsLeft: 2,
    };
    const frontier = getFrontier(board);
    expect(trySolvingBasedOnNumberOfMines({ board, frontier })).toBeUndefined();
  });

  it("gets the right solution for the sample board and 3 mines", () => {
    const board: GameBoardWithoutMineInfo = {
      ...baseBoard,
      numTotalMines: 6,
      numFlagsLeft: 3,
    };
    const frontier = getFrontier(board);
    const solution = trySolvingBasedOnNumberOfMines({ board, frontier });
    expect(solution).toBeDefined();
    solution?.cells.sort((a, b) =>
      a.rowIndex < b.rowIndex
        ? -1
        : a.rowIndex > b.rowIndex
        ? 1
        : a.columnIndex - b.columnIndex
    );
    expect(solution).toEqual({
      cells: [board.cells[2][2], board.cells[3][1], board.cells[3][2]],
      numberOfMines: 3,
      reason: "numberOfMines",
      type: "flag",
    });
  });
});
