import { GameBoard, GameCell } from "../common/types";
import { getCellNeighbors } from "../neighbor_functions/neighbor_functions";
import { getRandomInteger } from "../common/random_utils";

export const fillBoardAfterFirstClick = ({
  board,
  cell: clickedCell,
}: {
  board: GameBoard;
  cell: GameCell;
}): void => {
  const candidateCells = board.cells
    .map((row) =>
      row.filter(
        (cell) =>
          cell.rowIndex !== clickedCell.rowIndex ||
          cell.columnIndex !== clickedCell.columnIndex
      )
    )
    .reduce((a, b) => [...a, ...b], []);
  if (board.numMinesLeft > candidateCells.length) {
    throw new Error("The board is too small for this number of mines");
  }

  for (let i = 0; i < board.numMinesLeft; i++) {
    const minedCellIndex = getRandomInteger(0, candidateCells.length);
    const minedCell = candidateCells[minedCellIndex];
    candidateCells.splice(minedCellIndex, 1);
    minedCell.hasMine = true;
    getCellNeighbors({
      board,
      cell: minedCell,
    }).forEach((cell) => cell.numNeighborsWithMines++);
  }

  board.status = "playing";

  openCell({ board, cell: clickedCell });
};

export const openCell = ({
  board,
  cell,
}: {
  board: GameBoard;
  cell: GameCell;
}): void => {
  if (cell.status !== "closed") {
    return;
  }
  if (cell.hasMine) {
    cell.status = "exploded";
    board.status = "lost";
  } else {
    cell.status = "open";
    if (cell.numNeighborsWithMines === 0) {
      getCellNeighbors({ board, cell }).forEach((neighbor) =>
        openCell({ board, cell: neighbor })
      );
    }
  }
};

export const toggleCellMark = ({
  board,
  cell,
  onNoMinesLeft,
}: {
  board: GameBoard;
  cell: GameCell;
  onNoMinesLeft: () => void;
}): void => {
  if (board.numMinesLeft === 0) {
    onNoMinesLeft();
    return;
  }
  if (cell.status === "open") {
    cell.status = "marked";
    board.numMinesLeft--;
  } else if (cell.status === "marked") {
    cell.status = "open";
    board.numMinesLeft++;
  }
};
