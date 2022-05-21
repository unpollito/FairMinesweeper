import { GameBoard, GameCell } from "./types";
import { getCellNeighbors } from "./cell_neighbor_functions";
import { generateEmptyBoardForTests } from "./tests/common_test_functions";

describe("getCellNeighbors", () => {
  const board: GameBoard = generateEmptyBoardForTests(4, 4);

  const expectArraysToContainSameCells = (
    a: GameCell[],
    b: GameCell[]
  ): void => {
    expect(a.length).toBe(b.length);
    const sort = (a: GameCell, b: GameCell): number =>
      a.rowIndex < b.rowIndex
        ? -1
        : a.rowIndex > b.rowIndex
        ? 1
        : a.columnIndex < b.columnIndex
        ? -1
        : a.columnIndex > b.columnIndex
        ? 1
        : 0;
    const orderedA = a.slice().sort(sort);
    const orderedB = b.slice().sort(sort);

    orderedA.forEach((entry, index) => {
      expect(entry).toBe(orderedB[index]);
    });
  };

  it("is correct for a cell in the top left corner", () => {
    expectArraysToContainSameCells(
      getCellNeighbors({ board, cell: board.cells[0][0] }),
      [board.cells[0][1], board.cells[1][0], board.cells[1][1]]
    );
  });

  it("is correct for a cell in the top right corner", () => {
    expectArraysToContainSameCells(
      getCellNeighbors({ board, cell: board.cells[0][3] }),
      [board.cells[0][2], board.cells[1][2], board.cells[1][3]]
    );
  });

  it("is correct for a cell in the bottom left corner", () => {
    expectArraysToContainSameCells(
      getCellNeighbors({ board, cell: board.cells[3][0] }),
      [board.cells[2][0], board.cells[2][1], board.cells[3][1]]
    );
  });

  it("is correct for a cell in the bottom right corner", () => {
    expectArraysToContainSameCells(
      getCellNeighbors({ board, cell: board.cells[3][3] }),
      [board.cells[2][2], board.cells[2][3], board.cells[3][2]]
    );
  });

  it("is correct for a cell in the top edge", () => {
    expectArraysToContainSameCells(
      getCellNeighbors({ board, cell: board.cells[0][2] }),
      [
        board.cells[0][1],
        board.cells[0][3],
        board.cells[1][1],
        board.cells[1][2],
        board.cells[1][3],
      ]
    );
  });

  it("is correct for a cell in the bottom edge", () => {
    expectArraysToContainSameCells(
      getCellNeighbors({ board, cell: board.cells[3][1] }),
      [
        board.cells[2][0],
        board.cells[2][1],
        board.cells[2][2],
        board.cells[3][0],
        board.cells[3][2],
      ]
    );
  });

  it("is correct for a cell in the left edge", () => {
    expectArraysToContainSameCells(
      getCellNeighbors({ board, cell: board.cells[1][0] }),
      [
        board.cells[0][0],
        board.cells[0][1],
        board.cells[1][1],
        board.cells[2][0],
        board.cells[2][1],
      ]
    );
  });

  it("is correct for a cell in the right edge", () => {
    expectArraysToContainSameCells(
      getCellNeighbors({ board, cell: board.cells[2][3] }),
      [
        board.cells[1][2],
        board.cells[1][3],
        board.cells[2][2],
        board.cells[3][2],
        board.cells[3][3],
      ]
    );
  });

  it("is correct for a cell in the middle", () => {
    expectArraysToContainSameCells(
      getCellNeighbors({ board, cell: board.cells[1][2] }),
      [
        board.cells[0][1],
        board.cells[0][2],
        board.cells[0][3],
        board.cells[1][1],
        board.cells[1][3],
        board.cells[2][1],
        board.cells[2][2],
        board.cells[2][3],
      ]
    );
  });
});
