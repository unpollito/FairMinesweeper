import { GameBoard } from "../types";

export const generateEmptyBoardForTests = (
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

export const generate000_x1xBoardForTests = (): GameBoard => ({
  // 2x3 board with mines in [1,0] and [1,2]:
  // 0: [_,_,_]
  // 1: [x,_,x]
  cells: [
    [
      {
        columnIndex: 0,
        hasMine: false,
        numNeighborsWithMines: 1,
        rowIndex: 0,
        status: "closed",
      },
      {
        columnIndex: 1,
        hasMine: false,
        numNeighborsWithMines: 2,
        rowIndex: 0,
        status: "closed",
      },
      {
        columnIndex: 2,
        hasMine: false,
        numNeighborsWithMines: 1,
        rowIndex: 0,
        status: "closed",
      },
    ],
    [
      {
        columnIndex: 0,
        hasMine: true,
        numNeighborsWithMines: 0,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 1,
        hasMine: false,
        numNeighborsWithMines: 2,
        rowIndex: 0,
        status: "closed",
      },
      {
        columnIndex: 2,
        hasMine: true,
        numNeighborsWithMines: 0,
        rowIndex: 1,
        status: "closed",
      },
    ],
  ],
  numFlagsLeft: 2,
  numOpenedCells: 0,
  numTotalMines: 2,
});

export const generate000x_11xxBoardForTests = (): GameBoard => ({
  // 2x4 board with mines in [0,3], [1,2] and [1,3]:
  // 0: [_,_,_,x]
  // 1: [_,_,x,x]
  cells: [
    [
      {
        columnIndex: 0,
        hasMine: false,
        numNeighborsWithMines: 0,
        rowIndex: 0,
        status: "closed",
      },
      {
        columnIndex: 1,
        hasMine: false,
        numNeighborsWithMines: 1,
        rowIndex: 0,
        status: "closed",
      },
      {
        columnIndex: 2,
        hasMine: false,
        numNeighborsWithMines: 3,
        rowIndex: 0,
        status: "closed",
      },
      {
        columnIndex: 3,
        hasMine: true,
        numNeighborsWithMines: 2,
        rowIndex: 0,
        status: "closed",
      },
    ],
    [
      {
        columnIndex: 0,
        hasMine: false,
        numNeighborsWithMines: 0,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 1,
        hasMine: false,
        numNeighborsWithMines: 1,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 2,
        hasMine: true,
        numNeighborsWithMines: 2,
        rowIndex: 1,
        status: "closed",
      },
      {
        columnIndex: 3,
        hasMine: true,
        numNeighborsWithMines: 2,
        rowIndex: 1,
        status: "closed",
      },
    ],
  ],
  numFlagsLeft: 2,
  numOpenedCells: 0,
  numTotalMines: 3,
});
