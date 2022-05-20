import { GameBoard } from "../types";

export const generateSampleBoardForTests = (
  height: number,
  width: number
): GameBoard => ({
  cells: [...Array(height).keys()].map((_, row) =>
    [...Array(width).keys()].map((_, column) => ({
      rowIndex: row,
      columnIndex: column,
      hasMine: false,
      numNeighborsWithMines: 0,
      status: "closed",
    }))
  ),
  numFlagsLeft: 0,
  numOpenedCells: 0,
  numTotalMines: 0,
});
