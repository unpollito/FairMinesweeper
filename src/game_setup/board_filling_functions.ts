import { BoardAndStatus, GameBoard, GameCell } from "../common/types";
import { cloneCells } from "../common/board_cloning_functions";
import { getRandomInteger } from "../common/random_util_functions";
import { getCellNeighbors } from "../common/cell_neighbor_functions";

export const fillBoardAfterFirstClick = ({
  board: oldBoard,
  cell: clickedCell,
}: {
  board: GameBoard;
  cell: GameCell;
}): BoardAndStatus => {
  const newBoard = { ...oldBoard, cells: cloneCells(oldBoard.cells) };
  const candidateCells = newBoard.cells
    .map((row) =>
      row.filter(
        (cell) =>
          cell.rowIndex !== clickedCell.rowIndex ||
          cell.columnIndex !== clickedCell.columnIndex
      )
    )
    .reduce((a, b) => [...a, ...b], []);
  if (newBoard.numFlagsLeft > candidateCells.length) {
    throw new Error("The board is too small for this number of mines");
  }

  for (let i = 0; i < newBoard.numFlagsLeft; i++) {
    const minedCellIndex = getRandomInteger(0, candidateCells.length);
    const minedCell = candidateCells[minedCellIndex];
    candidateCells.splice(minedCellIndex, 1);
    minedCell.hasMine = true;
    getCellNeighbors({
      board: newBoard,
      cell: minedCell,
    }).forEach((cell) => cell.numNeighborsWithMines++);
  }

  return {
    board: newBoard,
    status: "playing",
  };
};
