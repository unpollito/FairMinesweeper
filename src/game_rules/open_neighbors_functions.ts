import {
  BoardAndCellAndStatus,
  BoardAndStatus,
  GameStatus,
} from "../common/types";
import { getCellNeighbors } from "../common/cell_neighbor_functions";
import { openCell } from "./open_single_cell_functions";
import { hasOpenedEnoughCellsToWin } from "./win_condition_functions";

export const clearNeighbors = ({
  board: oldBoard,
  cell: oldCell,
  status: oldStatus,
}: BoardAndCellAndStatus): BoardAndStatus => {
  const wrongCellStatus =
    oldCell.status !== "marked" && oldCell.status !== "open";
  const wrongGameStatus = oldStatus !== "playing";
  if (wrongCellStatus || wrongGameStatus) {
    return { board: oldBoard, status: oldStatus };
  }
  let newBoard = oldBoard;
  let someMineOpened = false;
  getCellNeighbors({ board: oldBoard, cell: oldCell }).forEach((neighbor) => {
    const nextResult = openCell({
      board: newBoard,
      cell: newBoard.cells[neighbor.rowIndex][neighbor.columnIndex],
      status: oldStatus,
    });
    if (nextResult.status === "lost") {
      someMineOpened = true;
    }
    newBoard = nextResult.board;
  });
  let newStatus: GameStatus = oldStatus;
  if (someMineOpened) {
    newStatus = "lost";
  } else if (hasOpenedEnoughCellsToWin(newBoard)) {
    newStatus = "won";
  }
  return { board: newBoard, status: newStatus };
};
