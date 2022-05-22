import {
  GameBoardWithoutMineInfo as Board,
  GameCellWithoutMineInfo as Cell,
} from "./solver_types";
import { getCellNeighbors } from "../common/cell_neighbor_functions";

export const getFrontier = (board: Board): Cell[] =>
  board.cells
    .map(
      (row) =>
        row
          .map((cell) => {
            if (cell.status === "open") {
              if (
                getCellNeighbors({ board, cell }).some(
                  (cell) => cell.status !== "open" && cell.status !== "marked"
                )
              ) {
                return cell;
              }
            }
            return undefined;
          })
          .filter((a) => !!a) as Cell[]
    )
    .reduce((a, b) => [...a, ...b], []);

export const getBoardCorners = (board: Board): Cell[] => [
  board.cells[0][0],
  board.cells[board.cells.length - 1][0],
  board.cells[0][board.cells[0].length - 1],
  board.cells[board.cells.length - 1][board.cells[0].length - 1],
];

export const getBoardEdges = (board: Board): Cell[] => {
  const result: Cell[] = [];
  for (let rowIndex = 1; rowIndex < board.cells.length - 1; rowIndex++) {
    result.push(board.cells[rowIndex][0]);
    result.push(board.cells[rowIndex][board.cells[0].length - 1]);
  }
  for (
    let columnIndex = 1;
    columnIndex < board.cells[0].length - 1;
    columnIndex++
  ) {
    result.push(board.cells[0][columnIndex]);
    result.push(board.cells[board.cells.length - 1][columnIndex]);
  }
  return result;
};

export const getBoardMiddleCells = (board: Board): Cell[] =>
  board.cells
    .filter(
      (row, rowIndex) => rowIndex > 0 && rowIndex < board.cells.length - 1
    )
    .map((row) =>
      row.filter(
        (cell, columnIndex) => columnIndex > 0 && columnIndex < row.length - 1
      )
    )
    .reduce((a, b) => [...a, ...b], []);
