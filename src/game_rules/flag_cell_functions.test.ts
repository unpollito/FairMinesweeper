import { GameBoard, GameCell } from "../common/types";
import { toggleCellFlag } from "./flag_cell_functions";
import { generate000_x1xBoardForTests } from "../common/tests/common_test_functions";

const initialBoard = generate000_x1xBoardForTests();

describe("toggleCellFlag", () => {
  const runInvariantTests = ({
    board,
    cell,
  }: {
    board: GameBoard;
    cell: GameCell;
  }): void => {
    it("does not change the original board", () => {
      const originalBoard = JSON.parse(JSON.stringify(board));
      toggleCellFlag({ board, cell });
      expect(board).toEqual(originalBoard);
    });

    it("does not change the number of opened cells", () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.board.numOpenedCells).toBe(board.numOpenedCells);
    });

    it("does not change the number of total mines", () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.board.numTotalMines).toBe(board.numTotalMines);
    });

    it("does not modify any of the other cells", () => {
      const result = toggleCellFlag({ board, cell });
      for (let rowIndex = 0; rowIndex < result.board.cells.length; rowIndex++) {
        const resultRow = result.board.cells[rowIndex];
        for (
          let columnIndex = 0;
          columnIndex < resultRow.length;
          columnIndex++
        ) {
          if (rowIndex !== cell.rowIndex || columnIndex !== cell.columnIndex) {
            expect(resultRow[columnIndex]).toEqual(
              board.cells[rowIndex][columnIndex]
            );
          }
        }
      }
    });
  };

  const runCommonTestsForCellChange = ({
    board,
    cell,
  }: {
    board: GameBoard;
    cell: GameCell;
  }) => {
    it("does not modify any cell field other than the status", () => {
      const result = toggleCellFlag({ board, cell });
      const resultCell = result.board.cells[cell.rowIndex][cell.columnIndex];
      const originalCell = board.cells[cell.rowIndex][cell.columnIndex];
      expect(resultCell.rowIndex).toBe(originalCell.rowIndex);
      expect(resultCell.columnIndex).toBe(originalCell.columnIndex);
      expect(resultCell.hasMine).toBe(originalCell.hasMine);
      expect(resultCell.numNeighborsWithMines).toBe(
        originalCell.numNeighborsWithMines
      );
    });

    it("returns triedFlaggingTooManyCells: false", () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.triedFlaggingTooManyCells).toBeFalse();
    });
  };

  const runTestsForFlaggingACell = ({
    board,
    cell,
  }: {
    board: GameBoard;
    cell: GameCell;
  }) => {
    runInvariantTests({ board, cell });
    runCommonTestsForCellChange({ board, cell });

    it(`decreases the number of available flags by one`, () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.board.numFlagsLeft).toBe(board.numFlagsLeft - 1);
    });

    it("flags the passed cell", () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.board.cells[cell.rowIndex][cell.columnIndex].status).toBe(
        "flagged"
      );
    });
  };

  describe("flaging first cell without a mine", () => {
    runTestsForFlaggingACell({
      board: initialBoard,
      cell: initialBoard.cells[0][0],
    });
  });

  describe("flaging first cell with a mine", () => {
    runTestsForFlaggingACell({
      board: initialBoard,
      cell: initialBoard.cells[1][0],
    });
  });

  describe("flaging cell without a mine using the last flag", () => {
    const board: GameBoard = generate000_x1xBoardForTests();
    board.cells[0][0].status = "flagged";
    board.numFlagsLeft = 1;
    runTestsForFlaggingACell({
      board,
      cell: board.cells[0][2],
    });
  });

  describe("flaging cell with a mine using the last flag", () => {
    const board: GameBoard = generate000_x1xBoardForTests();
    board.cells[0][0].status = "flagged";
    board.numFlagsLeft = 1;
    runTestsForFlaggingACell({
      board,
      cell: board.cells[1][0],
    });
  });

  const runTestsForUnflaggingACell = ({
    board,
    cell,
  }: {
    board: GameBoard;
    cell: GameCell;
  }) => {
    runInvariantTests({ board, cell });
    runCommonTestsForCellChange({ board, cell });

    it(`increases the number of available flags by one`, () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.board.numFlagsLeft).toBe(board.numFlagsLeft + 1);
    });

    it("unflags the passed cell", () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.board.cells[cell.rowIndex][cell.columnIndex].status).toBe(
        "closed"
      );
    });
  };

  describe("unflag first flag on an unmined cell", () => {
    const board: GameBoard = generate000_x1xBoardForTests();
    board.cells[0][0].status = "flagged";
    board.numFlagsLeft = 1;
    runTestsForUnflaggingACell({
      board,
      cell: board.cells[0][0],
    });
  });

  describe("unflag first flag on a mined cell", () => {
    const board: GameBoard = generate000_x1xBoardForTests();
    board.cells[1][0].status = "flagged";
    board.numFlagsLeft = 1;
    runTestsForUnflaggingACell({
      board,
      cell: board.cells[1][0],
    });
  });

  describe("unflag last flag on an unmined cell", () => {
    const board: GameBoard = generate000_x1xBoardForTests();
    board.cells[0][0].status = "flagged";
    board.cells[0][1].status = "flagged";
    board.numFlagsLeft = 0;
    runTestsForUnflaggingACell({
      board,
      cell: board.cells[0][0],
    });
  });

  describe("unflag last flag on a mined cell", () => {
    const board: GameBoard = generate000_x1xBoardForTests();
    board.cells[0][0].status = "flagged";
    board.cells[1][0].status = "flagged";
    board.numFlagsLeft = 0;
    runTestsForUnflaggingACell({
      board,
      cell: board.cells[1][0],
    });
  });

  const runTestsForNoExpectedChange = ({
    board,
    cell,
    expectedTooManyCells,
  }: {
    board: GameBoard;
    cell: GameCell;
    expectedTooManyCells: boolean;
  }): void => {
    runInvariantTests({ board, cell });

    it("does not change the number of flags left", () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.board.numFlagsLeft).toBe(board.numFlagsLeft);
    });

    it("does not modify the cell", () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.board.cells[cell.rowIndex][cell.columnIndex]).toEqual(
        board.cells[cell.rowIndex][cell.columnIndex]
      );
    });

    it(`returns triedFlaggingTooManyCells: ${expectedTooManyCells}`, () => {
      const result = toggleCellFlag({ board, cell });
      expect(result.triedFlaggingTooManyCells).toBe(expectedTooManyCells);
    });
  };

  describe("trying to flag unmined cell when there are no flags left", () => {
    const board: GameBoard = generate000_x1xBoardForTests();
    board.cells[0][0].status = "flagged";
    board.cells[1][0].status = "flagged";
    board.numFlagsLeft = 0;
    runTestsForNoExpectedChange({
      board,
      cell: board.cells[0][1],
      expectedTooManyCells: true,
    });
  });

  describe("trying to flag mined cell when there are no flags left", () => {
    const board: GameBoard = generate000_x1xBoardForTests();
    board.cells[0][0].status = "flagged";
    board.cells[1][0].status = "flagged";
    board.numFlagsLeft = 0;
    runTestsForNoExpectedChange({
      board,
      cell: board.cells[1][2],
      expectedTooManyCells: true,
    });
  });

  describe("trying to flag open cell", () => {
    const board: GameBoard = generate000_x1xBoardForTests();
    board.cells[0][0].status = "open";
    board.numOpenedCells = 1;
    runTestsForNoExpectedChange({
      board,
      cell: board.cells[0][0],
      expectedTooManyCells: false,
    });
  });
});
