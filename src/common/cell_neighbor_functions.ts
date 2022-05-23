import { GameBoard } from "./types";
import { GameCellWithoutMineInfo } from "../solver/solver_types";

export const getCellNeighbors = <T extends GameCellWithoutMineInfo>({
  board,
  cell: { columnIndex, rowIndex },
}: {
  board: Omit<GameBoard, "cells"> & { cells: T[][] };
  cell: T;
}): T[] =>
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
