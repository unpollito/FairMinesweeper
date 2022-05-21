import { cloneCells, cloneCellsAround } from "./board_cloning_functions";
import { generateEmptyBoardForTests } from "./tests/common_test_functions";
import { GameBoard, GameCell } from "./types";

describe("cloneCells", () => {
  const board = generateEmptyBoardForTests(4, 4);
  board.cells[0][0].hasMine = true;
  board.cells[0][1].numNeighborsWithMines = 1;
  board.cells[1][0].numNeighborsWithMines = 1;
  board.cells[1][1].numNeighborsWithMines = 1;
  board.cells[0][2].status = "open";

  const clonedCells = cloneCells(board.cells);

  it("returns a matrix whose cells are equal", () => {
    for (const [rowIndex, row] of board.cells.entries()) {
      for (const [columnIndex, cell] of row.entries()) {
        const clonedCell = clonedCells[rowIndex][columnIndex];
        expect(clonedCell.rowIndex).toBe(rowIndex);
        expect(clonedCell.columnIndex).toBe(columnIndex);
        expect(clonedCell).toEqual(cell);
      }
    }
  });

  it("returns a matrix with new row arrays and cell objects", () => {
    for (const [rowIndex, row] of board.cells.entries()) {
      expect(row === clonedCells[rowIndex]).toBeFalse();
      for (const [columnIndex, cell] of row.entries()) {
        expect(cell === clonedCells[rowIndex][columnIndex]).toBeFalse();
      }
    }
  });
});

describe("cloneCellsAround", () => {
  const testForRadius = ({
    around,
    board,
    radius,
  }: {
    around: GameCell;
    board: GameBoard;
    radius: number;
  }): void => {
    const clonedCells = cloneCellsAround({
      around,
      cells: board.cells,
      radius,
    });
    const minRowToClone = Math.max(0, around.rowIndex - radius);
    const maxRowToClone = Math.min(
      board.cells.length,
      around.rowIndex + radius
    );
    const minColumnToClone = Math.max(0, around.columnIndex - radius);
    const maxColumnToClone = Math.min(
      board.cells[0].length,
      around.columnIndex + radius
    );

    it("returns a matrix whose cells are equal", () => {
      for (const [rowIndex, row] of board.cells.entries()) {
        for (const [columnIndex, cell] of row.entries()) {
          const clonedCell = clonedCells[rowIndex][columnIndex];
          expect(clonedCell.rowIndex).toBe(rowIndex);
          expect(clonedCell.columnIndex).toBe(columnIndex);
          expect(clonedCell).toEqual(cell);
        }
      }
    });

    it(`returns a matrix where only the cells outside a ${radius} cell radius have equal references`, () => {
      for (const [rowIndex, row] of board.cells.entries()) {
        for (const [columnIndex, cell] of row.entries()) {
          const isRowNonClonable =
            rowIndex < minRowToClone || rowIndex > maxRowToClone;
          const isColumnNonClonable =
            columnIndex < minColumnToClone || columnIndex > maxColumnToClone;
          const clonedCell = clonedCells[rowIndex][columnIndex];
          expect(clonedCell === cell).toBe(
            isRowNonClonable || isColumnNonClonable
          );
        }
      }
    });
  };

  describe("with radius = 0", () => {
    const board = generateEmptyBoardForTests(4, 4);
    const around = board.cells[1][1];
    testForRadius({ around, board, radius: 0 });
  });

  describe("with radius = 1 in the center", () => {
    const board = generateEmptyBoardForTests(5, 5);
    const around = board.cells[2][2];
    testForRadius({ around, board, radius: 1 });
  });

  describe("with radius = 1 in the top left corner", () => {
    const board = generateEmptyBoardForTests(5, 5);
    const around = board.cells[0][0];
    testForRadius({ around, board, radius: 1 });
  });

  describe("with radius = 1 in the bottom right corner", () => {
    const board = generateEmptyBoardForTests(5, 5);
    const around = board.cells[4][4];
    testForRadius({ around, board, radius: 1 });
  });

  describe("with radius = 2 in the center", () => {
    const board = generateEmptyBoardForTests(7, 7);
    const around = board.cells[3][3];
    testForRadius({ around, board, radius: 2 });
  });

  describe("with radius = 2 in the top right corner", () => {
    const board = generateEmptyBoardForTests(7, 7);
    const around = board.cells[0][6];
    testForRadius({ around, board, radius: 2 });
  });

  describe("with radius = 2 in the bottom left corner", () => {
    const board = generateEmptyBoardForTests(7, 7);
    const around = board.cells[6][0];
    testForRadius({ around, board, radius: 2 });
  });
});
