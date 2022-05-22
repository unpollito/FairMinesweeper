import { GameBoardWithoutMineInfo as Board, SolverStep } from "./solver_types";
import { getFrontier } from "./solver_helper_functions";
import { getRandomChoice } from "./solver_random_choice_functions";
import { trySolvingSomeCell } from "./solver_solve_cell_functions";

export const processStep = (board: Board): SolverStep => {
  const frontier = getFrontier(board);

  const solveCellStep = trySolvingSomeCell({ board, frontier });
  if (solveCellStep) {
    return solveCellStep;
  }

  const randomChoice = getRandomChoice(board);
  if (randomChoice.cells.length > 0) {
    return { ...randomChoice, type: "random" };
  } else {
    return { message: "Don't know how to proceed", type: "error" };
  }
};
