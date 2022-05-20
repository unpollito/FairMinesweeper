import { GameBoard, GameCell } from "./types";

export const getCellNeighbors = ({
  board,
  cell: { columnIndex, rowIndex },
}: {
  board: GameBoard;
  cell: GameCell;
}): GameCell[] =>
  [
    board.cells[rowIndex - 1]?.[columnIndex - 1],
    board.cells[rowIndex - 1]?.[columnIndex],
    board.cells[rowIndex - 1]?.[columnIndex + 1],
    board.cells[rowIndex][columnIndex - 1],
    board.cells[rowIndex][columnIndex + 1],
    board.cells[rowIndex + 1]?.[columnIndex - 1],
    board.cells[rowIndex + 1]?.[columnIndex],
    board.cells[rowIndex + 1]?.[columnIndex + 1],
  ].filter((cell) => !!cell);
