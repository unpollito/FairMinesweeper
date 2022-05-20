import { cloneCells } from "./board_cloning_functions";
import { generateExampleBoard } from "./common_test_functions";

describe("cloneCells", () => {
  const board = generateExampleBoard(4, 4);
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
  // TODO
});
