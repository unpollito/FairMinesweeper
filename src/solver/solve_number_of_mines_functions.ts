import {
  GameBoardWithoutMineInfo as Board,
  GameCellWithoutMineInfo,
  OpenGameCellWithoutMineInfo,
  SolverFlagBasedOnTotalNumberOfMines,
} from "./solver_types";
import { splitClosedMinesByFrontierNeighborhood } from "./solver_helper_functions";
import { cloneCellsAround } from "../common/board_cloning_functions";
import { getCellNeighbors } from "../common/cell_neighbor_functions";

export const trySolvingBasedOnNumberOfMines = ({
  board,
  frontier,
}: {
  board: Board;
  frontier: OpenGameCellWithoutMineInfo[];
}): SolverFlagBasedOnTotalNumberOfMines | undefined => {
  const { frontierNeighbors, nonFrontierNeighbors } =
    splitClosedMinesByFrontierNeighborhood({ board, frontier });

  // Since this runs an exhaustive search, I'm choosing to cap the number of items
  // that we can search in to avoid this becoming very slow. In some cases it took
  // several seconds to complete the search.
  if (
    nonFrontierNeighbors.length > 15 ||
    frontierNeighbors.length > 15 ||
    board.numTotalMines > 10
  ) {
    return undefined;
  }

  const solutions: GameCellWithoutMineInfo[][] = solveMineLocations({
    board,
    frontier,
    frontierNeighbors,
    maxSolutions: 2,
    nonFrontierNeighbors,
  });

  if (solutions.length !== 1) {
    return undefined;
  }
  let solutionToUse = solutions[0];
  // If our solution has 3 mines in the frontier neighbors, there are a total
  // of 8 mines and there are 5 non-frontier neighbors, then the remaining
  // 5 mines are in the non-frontier neighbors.
  if (
    solutionToUse.length + nonFrontierNeighbors.length ===
    board.numFlagsLeft
  ) {
    solutionToUse = [...solutionToUse, ...nonFrontierNeighbors];
  }
  return {
    cells: solutionToUse,
    numberOfMines: board.numFlagsLeft,
    reason: "numberOfMines",
    type: "flag",
  };
};

export const solveMineLocations = ({
  board,
  frontier,
  frontierNeighbors,
  maxSolutions,
  nonFrontierNeighbors,
}: {
  board: Board;
  frontier: OpenGameCellWithoutMineInfo[];
  frontierNeighbors: GameCellWithoutMineInfo[];
  maxSolutions: number;
  nonFrontierNeighbors: GameCellWithoutMineInfo[];
}): GameCellWithoutMineInfo[][] => {
  // Base case: there are not enough remaining closed cells to place the remaining mines.
  // This is then an invalid solution.
  if (
    frontierNeighbors.length + nonFrontierNeighbors.length <
    board.numFlagsLeft
  ) {
    return [];
  }
  // Base case: we run out of mines to place, or out of frontier neighbors. This is a valid
  // solution if all frontier cells have enough mines around them.
  if (board.numFlagsLeft === 0 || frontierNeighbors.length === 0) {
    // Note that we don't need to check cells not in the frontier because:
    // 1. We will not be adding mines exceeding the limit of each cell (we take care of this
    //    before adding each mine).
    // 2. They already had the required number of mines around them (otherwise, by definition,
    //    they would be part of the frontier).
    if (
      checkCellListMineOffset({ board, cells: frontier }).every(
        (entry) => entry === 0
      )
    ) {
      return [[]]; // solution with an empty set of cells
    } else {
      return []; // no solution
    }
  }

  const solutions: GameCellWithoutMineInfo[][] = [];

  // For each frontier neighbor we'll try first finding solutions without it mined,
  // and then see what happens if we place a mine in it.
  const frontierNeighborCell = frontierNeighbors[0];
  const solutionsWithoutMineInCurrentCell = solveMineLocations({
    board,
    frontier,
    frontierNeighbors: frontierNeighbors.slice(1),
    maxSolutions: maxSolutions - solutions.length,
    nonFrontierNeighbors,
  });
  solutionsWithoutMineInCurrentCell.forEach((solution) => {
    solutions.push(solution);
  });
  if (solutions.length < maxSolutions && board.numFlagsLeft > 0) {
    // Let's try adding a mine to the current cell and see how this
    // affects the existing restrictions
    const clonedBoardCells = cloneCellsAround({
      around: frontierNeighborCell,
      cells: board.cells,
      radius: 0,
    });
    clonedBoardCells[frontierNeighborCell.rowIndex][
      frontierNeighborCell.columnIndex
    ].status = "flagged";
    const clonedBoard = {
      ...board,
      cells: clonedBoardCells,
      numFlagsLeft: board.numFlagsLeft - 1,
    };
    // Look at each neighbor of the cell we just flagged and see
    // if this makes it go over its limit of neighboring cells with mines.
    const neighbors = getCellNeighbors({
      board: clonedBoard,
      cell: frontierNeighborCell,
    });
    let someNeighborHasTooManyMinedNeighbors = false;
    neighbors.forEach((neighbor) => {
      if (
        neighbor.status === "open" &&
        checkCellMineOffset({
          board: clonedBoard,
          cell: neighbor as OpenGameCellWithoutMineInfo,
        }) > 0
      ) {
        someNeighborHasTooManyMinedNeighbors = true;
      }
    });
    if (!someNeighborHasTooManyMinedNeighbors) {
      solveMineLocations({
        board: clonedBoard,
        frontier,
        frontierNeighbors: frontierNeighbors.slice(1),
        maxSolutions: maxSolutions - solutions.length,
        nonFrontierNeighbors,
      }).forEach((solution) => {
        solutions.push([frontierNeighborCell, ...solution]);
      });
    }
  }
  return solutions;
};

const checkCellListMineOffset = ({
  board,
  cells,
}: {
  board: Board;
  cells: OpenGameCellWithoutMineInfo[];
}): number[] => cells.map((cell) => checkCellMineOffset({ board, cell }));

// -1, -2, -3, etc. indicate that the cell still needs 1/2/3/... more mines around it
// to satisfy its restriction.
// +1 indicates that the mine has 1 more mine around it than its restriction allows for.
const checkCellMineOffset = ({
  board,
  cell,
}: {
  board: Board;
  cell: OpenGameCellWithoutMineInfo;
}): number => {
  const neighbors = getCellNeighbors({
    board,
    cell,
  });
  const actualNumNeighborsWithMines = neighbors.filter(
    (neighbor) => neighbor.status === "flagged"
  ).length;
  return actualNumNeighborsWithMines - cell.numNeighborsWithMines;
};
