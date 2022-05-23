import {
  GameBoardWithoutMineInfo as Board,
  GameCellWithoutMineInfo,
  GameCellWithoutMineInfo as Cell,
  OpenGameCellWithoutMineInfo,
  OpenGameCellWithoutMineInfo as OpenCell,
} from "./solver_types";
import { getCellNeighbors } from "../common/cell_neighbor_functions";

export const getFrontier = (board: Board): OpenCell[] =>
  board.cells
    .map(
      (row) =>
        row
          .map((cell) => {
            if (cell.status === "open") {
              if (
                getCellNeighbors({ board, cell }).some(
                  (cell) => cell.status !== "open" && cell.status !== "flagged"
                )
              ) {
                return cell;
              }
            }
            return undefined;
          })
          .filter((a) => !!a) as Cell[]
    )
    .reduce((a, b) => [...a, ...b], []) as OpenCell[];

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

export const splitClosedMinesByFrontierNeighborhood = ({
  board,
  frontier,
}: {
  board: Board;
  frontier: OpenGameCellWithoutMineInfo[];
}): {
  frontierNeighbors: GameCellWithoutMineInfo[];
  nonFrontierNeighbors: GameCellWithoutMineInfo[];
} => {
  const frontierClosedNeighborsMap: Record<
    number,
    Record<number, GameCellWithoutMineInfo>
  > = {};
  frontier.forEach((cell) =>
    getCellNeighbors({ board, cell }).forEach((neighbor) => {
      if (neighbor.status === "closed") {
        if (!frontierClosedNeighborsMap[neighbor.rowIndex]) {
          frontierClosedNeighborsMap[neighbor.rowIndex] = {};
        }
        frontierClosedNeighborsMap[neighbor.rowIndex][neighbor.columnIndex] =
          neighbor;
      }
    })
  );

  const frontierNeighbors: GameCellWithoutMineInfo[] = [];
  const nonFrontierNeighbors: GameCellWithoutMineInfo[] = [];

  board.cells.forEach((row, rowIndex) =>
    row.forEach((cell, columnIndex) => {
      if (cell.status === "closed") {
        if (frontierClosedNeighborsMap[rowIndex]?.[columnIndex]) {
          frontierNeighbors.push(cell);
        } else {
          nonFrontierNeighbors.push(cell);
        }
      }
    })
  );
  return { frontierNeighbors, nonFrontierNeighbors };
};
