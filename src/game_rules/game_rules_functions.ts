import {
  BoardAndCellAndStatus,
  BoardAndStatus,
  GameBoard,
  GameCell,
} from "../common/types";
import { cloneCellsAround } from "../common/board_cloning_functions";
import { getCellNeighbors } from "../common/cell_neighbor_functions";

export const openCell = ({
  board: oldBoard,
  cell: oldCell,
  status: oldStatus,
}: BoardAndCellAndStatus): BoardAndStatus => {
  if (oldCell.status !== "closed") {
    return { board: oldBoard, status: oldStatus };
  }
  const newCells = cloneCellsAround({
    around: oldCell,
    cells: oldBoard.cells,
    radius: 0,
  });
  const newCell = newCells[oldCell.rowIndex][oldCell.columnIndex];
  let newBoard = { ...oldBoard, cells: newCells };
  let newStatus = oldStatus;
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

export const clearNeighbors = ({
  board: oldBoard,
  cell: oldCell,
  status: oldStatus,
}: BoardAndCellAndStatus): BoardAndStatus => {
  if (oldCell.status !== "marked" && oldCell.status !== "open") {
    return { board: oldBoard, status: oldStatus };
  }
  let newBoard = oldBoard;
  let newStatus = oldStatus;
  getCellNeighbors({ board: oldBoard, cell: oldCell }).forEach((neighbor) => {
    const nextResult = openCell({
      board: newBoard,
      cell: newBoard.cells[neighbor.rowIndex][neighbor.columnIndex],
      status: newStatus,
    });
    newBoard = nextResult.board;
    newStatus = nextResult.status;
  });
  return { board: newBoard, status: newStatus };
};

export const hasOpenedEnoughCellsToWin = (board: GameBoard): boolean =>
  board.numOpenedCells >=
  board.cells.length * board.cells[0].length - board.numTotalMines;

export const toggleCellMark = ({
  board: oldBoard,
  cell: oldCell,
}: {
  board: GameBoard;
  cell: GameCell;
}): { board: GameBoard; triedMarkingTooManyCells: boolean } => {
  if (oldCell.status === "closed" && oldBoard.numFlagsLeft === 0) {
    return { board: oldBoard, triedMarkingTooManyCells: true };
  }
  const newCells = cloneCellsAround({
    around: oldCell,
    cells: oldBoard.cells,
    radius: 0,
  });
  const newCell = newCells[oldCell.rowIndex][oldCell.columnIndex];
  const newBoard = { ...oldBoard, cells: newCells };
  if (newCell.status === "closed") {
    newCell.status = "marked";
    newBoard.numFlagsLeft--;
  } else if (newCell.status === "marked") {
    newCell.status = "closed";
    newBoard.numFlagsLeft++;
  }
  return { board: newBoard, triedMarkingTooManyCells: false };
};
