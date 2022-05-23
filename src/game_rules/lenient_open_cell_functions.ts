import {
  BoardAndCellAndStatus,
  BoardAndStatus,
  GameBoard,
  GameCell,
} from "../common/types";
import { openCell } from "./open_single_cell_functions";
import { processStep } from "../solver/solver_logic_functions";
import {
  getFrontier,
  splitClosedMinesByFrontierNeighborhood,
} from "../solver/solver_helper_functions";
import { boardToBoardWithoutMineInfo } from "../solver/solver_board_conversion_functions";
import {
  cloneCells,
  cloneCellsAround,
} from "../common/board_cloning_functions";
import {
  GameCellWithoutMineInfo,
  OpenGameCellWithoutMineInfo,
} from "../solver/solver_types";
import { solveMineLocations } from "../solver/solve_number_of_mines_functions";
import { getCellNeighbors } from "../common/cell_neighbor_functions";
import { getRandomInteger } from "../common/random_util_functions";

// The difference between lenientOpenCell and openCell is that if the user has opened
// a cell with a mine when the only available option was a random guess,
// it will attempt to rearrange the mines in a way that the user doesn't lose by opening
// that cell. If this is impossible, the game finishes.
export const lenientOpenCell = ({
  board,
  cell,
  status,
}: BoardAndCellAndStatus): BoardAndStatus => {
  if (!cell.hasMine || status !== "playing") {
    return openCell({ board, cell, status });
  }
  console.log(JSON.stringify(board));
  const previousSolverStep = processStep(board);
  if (previousSolverStep.type !== "random") {
    return openCell({ board, cell, status });
  }
  const alternativeBoard = getAlternativeMineDisposition({ board, cell });
  return alternativeBoard
    ? openCell({
        board: alternativeBoard,
        cell: alternativeBoard.cells[cell.rowIndex][cell.columnIndex],
        status: "playing",
      })
    : openCell({ board, cell, status });
};

export const getAlternativeMineDisposition = ({
  board: originalBoard,
  cell: originalCell,
}: {
  board: GameBoard;
  cell: GameCell;
}): GameBoard | undefined => {
  let board = boardToBoardWithoutMineInfo(originalBoard);
  board = {
    ...board,
    cells: cloneCellsAround({
      around: {
        rowIndex: originalCell.rowIndex,
        columnIndex: originalCell.columnIndex,
      },
      cells: board.cells,
      radius: 0,
    }),
  };
  const cell = board.cells[originalCell.rowIndex][originalCell.columnIndex];
  const frontier = getFrontier(board);
  frontier.splice(frontier.indexOf(cell as OpenGameCellWithoutMineInfo), 1);
  board.numFlagsLeft--;
  cell.status = "closed";

  const { frontierNeighbors, nonFrontierNeighbors } =
    splitClosedMinesByFrontierNeighborhood({ board, frontier });

  const solutions = solveMineLocations({
    board,
    frontier,
    frontierNeighbors,
    maxSolutions: 2,
    nonFrontierNeighbors,
  });
  if (solutions.length === 0) {
    return undefined;
  }
  const chosenSolution =
    solutions[Math.floor(Math.random() * solutions.length)];
  console.log("Avoiding losing on a random click!");
  return getChangedBoardBasedOnAlternativeSolution({
    board: originalBoard,
    clickedCell: originalCell,
    frontierNeighbors,
    nonFrontierNeighbors,
    solution: chosenSolution,
  });
};

const getChangedBoardBasedOnAlternativeSolution = ({
  board: oldBoard,
  clickedCell,
  frontierNeighbors,
  nonFrontierNeighbors,
  solution,
}: {
  board: GameBoard;
  clickedCell: GameCell;
  frontierNeighbors: GameCellWithoutMineInfo[];
  nonFrontierNeighbors: GameCellWithoutMineInfo[];
  solution: GameCellWithoutMineInfo[];
}): GameBoard | undefined => {
  const board = {
    ...oldBoard,
    cells: cloneCells(oldBoard.cells),
  };
  [clickedCell, ...frontierNeighbors, ...nonFrontierNeighbors].forEach(
    (current) => {
      const cell = board.cells[current.rowIndex][current.columnIndex];
      if (cell.hasMine) {
        cell.hasMine = false;
        getCellNeighbors({ board, cell }).forEach(
          (neighbor) => neighbor.numNeighborsWithMines--
        );
      }
    }
  );
  let cellsToMine = [...solution];
  if (solution.length < board.numFlagsLeft) {
    cellsToMine = [
      ...cellsToMine,
      ...chooseNAtRandom({
        items: nonFrontierNeighbors,
        n: board.numFlagsLeft - frontierNeighbors.length,
      }),
    ];
  }
  cellsToMine.forEach((current) => {
    const cell = board.cells[current.rowIndex][current.columnIndex];
    if (!cell.hasMine) {
      cell.hasMine = true;
      getCellNeighbors({ board, cell }).forEach(
        (neighbor) => neighbor.numNeighborsWithMines++
      );
    }
  });
  return isBoardValid(board, true) ? board : undefined;
};

const chooseNAtRandom = <T>({ items, n }: { items: T[]; n: number }): T[] => {
  if (n > items.length) {
    throw new Error("Broken assumption");
  }
  const remainingItems = items.slice();
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    const randomIndex = getRandomInteger(0, remainingItems.length);
    const selectedItem = remainingItems[randomIndex];
    result.push(selectedItem);
    remainingItems.splice(randomIndex, 1);
  }
  return result;
};

const isBoardValid = (board: GameBoard, verbose = false): boolean => {
  let numberOfMinesInBoard = 0;
  let numberOfFlagsInBoard = 0;
  let someMinedNeighborCountMismatch = false;
  board.cells.forEach((row) =>
    row.forEach((cell) => {
      if (cell.hasMine) {
        numberOfMinesInBoard++;
      }
      if (cell.status === "flagged") {
        numberOfFlagsInBoard++;
      }
      if (
        getCellNeighbors({ board, cell }).filter((neighbor) => neighbor.hasMine)
          .length !== cell.numNeighborsWithMines
      ) {
        someMinedNeighborCountMismatch = true;
      }
    })
  );

  const isMineMismatch = numberOfMinesInBoard !== board.numTotalMines;
  const isFlagMismatch =
    numberOfFlagsInBoard + board.numFlagsLeft !== board.numTotalMines;
  if (verbose) {
    if (isMineMismatch) {
      console.warn("The number of mines in the board does not match");
    }
    if (isFlagMismatch) {
      console.warn(
        "The number of set and remaining flags does not add up to the total number of mines"
      );
    }
    if (someMinedNeighborCountMismatch) {
      console.warn("Some cell has an invalid numNeighborsWithMines");
    }
  }

  return !isMineMismatch && !isFlagMismatch && !someMinedNeighborCountMismatch;
};
