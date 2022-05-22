import { GameBoard, GameCell } from "../common/types";
import { cloneCellsAround } from "../common/board_cloning_functions";

export const toggleCellFlag = ({
  board: oldBoard,
  cell: oldCell,
}: {
  board: GameBoard;
  cell: GameCell;
}): { board: GameBoard; triedFlaggingTooManyCells: boolean } => {
  if (oldCell.status === "open" || oldCell.status === "exploded") {
    return { board: oldBoard, triedFlaggingTooManyCells: false };
  }
  if (oldCell.status === "closed" && oldBoard.numFlagsLeft === 0) {
    return { board: oldBoard, triedFlaggingTooManyCells: true };
  }
  const newCells = cloneCellsAround({
    around: oldCell,
    cells: oldBoard.cells,
    radius: 0,
  });
  const newCell = newCells[oldCell.rowIndex][oldCell.columnIndex];
  const newBoard = { ...oldBoard, cells: newCells };
  if (newCell.status === "closed") {
    newCell.status = "flagged";
    newBoard.numFlagsLeft--;
  } else if (newCell.status === "flagged") {
    newCell.status = "closed";
    newBoard.numFlagsLeft++;
  }
  return { board: newBoard, triedFlaggingTooManyCells: false };
};
