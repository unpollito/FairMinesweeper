import { GameBoard } from "../common/types";

export const hasOpenedEnoughCellsToWin = (board: GameBoard): boolean =>
  board.numOpenedCells >=
  board.cells.length * board.cells[0].length - board.numTotalMines;
