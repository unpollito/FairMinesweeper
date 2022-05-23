import { GameBoardWithoutMineInfo as Board, SolverStep } from "./solver_types";
import { getFrontier } from "./solver_helper_functions";
import { getRandomChoice } from "./solver_random_choice_functions";
import { trySolvingSomeCell } from "./solver_solve_cell_functions";
import { trySolvingSomePartition } from "./solver_partition_functions";
import { trySolvingBasedOnNumberOfMines } from "./solve_number_of_mines_functions";

export const processStep = (board: Board): SolverStep => {
  const frontier = getFrontier(board);

  if (frontier.length > 0) {
    const solveCellStep = trySolvingSomeCell({ board, frontier });
    if (solveCellStep) {
      return solveCellStep;
    }

    const solvePartitionStep = trySolvingSomePartition({ board, frontier });
    if (solvePartitionStep) {
      return solvePartitionStep;
    }

    const solveNumberOfMinesStep = trySolvingBasedOnNumberOfMines({
      board,
      frontier,
    });
    if (solveNumberOfMinesStep) {
      return solveNumberOfMinesStep;
    }
  }

  const randomChoice = getRandomChoice(board);
  if (randomChoice.cells.length > 0) {
    return { ...randomChoice, type: "random" };
  } else {
    return { error: "Don't know how to proceed", type: "error" };
  }
};
