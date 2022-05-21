import {
  BoardAndCellAndStatus,
  BoardAndStatus,
  GameStatus,
} from "../common/types";
import { cloneCellsAround } from "../common/board_cloning_functions";
import { clearNeighbors } from "./open_neighbors_functions";
import { hasOpenedEnoughCellsToWin } from "./win_condition_functions";

export const openCell = ({
  board: oldBoard,
  cell: oldCell,
  status: oldStatus,
}: BoardAndCellAndStatus): BoardAndStatus => {
  if (
    oldCell.status !== "closed" ||
    oldStatus === "won" ||
    oldStatus === "lost"
  ) {
    return { board: oldBoard, status: oldStatus };
  }
  const newCells = cloneCellsAround({
    around: oldCell,
    cells: oldBoard.cells,
    radius: 0,
  });
  const newCell = newCells[oldCell.rowIndex][oldCell.columnIndex];
  let newBoard = { ...oldBoard, cells: newCells };
  let newStatus: GameStatus = oldStatus;
  if (newCell.hasMine) {
    newCell.status = "exploded";
    newStatus = "lost";
  } else {
    newBoard.numOpenedCells++;
    newCell.status = "open";
    if (newCell.numNeighborsWithMines === 0) {
      const nextResult = clearNeighbors({
        board: newBoard,
        cell: newCell,
        status: newStatus,
      });
      newBoard = nextResult.board;
      newStatus = nextResult.status;
    }
  }

  if (hasOpenedEnoughCellsToWin(newBoard) && newStatus === "playing") {
    newStatus = "won";
  }

  return { board: newBoard, status: newStatus };
};
