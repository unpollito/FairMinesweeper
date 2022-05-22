import {
  GameBoardWithoutMineInfo as Board,
  GameCellWithoutMineInfo as Cell,
  RandomChoice,
} from "./solver_types";
import {
  getBoardCorners,
  getBoardEdges,
  getBoardMiddleCells,
} from "./solver_helper_functions";
import { getCellNeighbors } from "../common/cell_neighbor_functions";

export const getRandomChoice = (
  board: Board
): { cells: Cell[]; choice: RandomChoice } => {
  // Favor corners, then edges, as these are more likely to open up islands.
  const filterChoosableCells = (cell: Cell) =>
    canChooseRandomCell({ board, cell });
  const choosableCorners = getBoardCorners(board).filter(filterChoosableCells);
  if (choosableCorners.length) {
    return { cells: choosableCorners, choice: "corner" };
  }
  const choosableEdges = getBoardEdges(board).filter(filterChoosableCells);
  if (choosableEdges.length) {
    return { cells: choosableEdges, choice: "edge" };
  }
  const choosableMiddleCells =
    getBoardMiddleCells(board).filter(filterChoosableCells);
  return { cells: choosableMiddleCells, choice: "middle" };
};

const canChooseRandomCell = ({
  board,
  cell,
}: {
  board: Board;
  cell: Cell;
}): boolean =>
  cell.status === "closed" &&
  getCellNeighbors({ board, cell }).every(
    (neighbor) => neighbor.status === "closed" || neighbor.status === "marked"
  );
