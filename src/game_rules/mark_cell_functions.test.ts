import { GameBoard, GameCell } from "../common/types";
import { toggleCellMark } from "./mark_cell_functions";

const initialBoard: GameBoard = {
  // 2x3 board with mines in [1,0] and [1,2].
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
};

const getClonedInitialBoard = (): GameBoard =>
  JSON.parse(JSON.stringify(initialBoard));

describe("toggleCellMark", () => {
  const runInvariantTests = ({
    board,
    cell,
  }: {
    board: GameBoard;
    cell: GameCell;
  }): void => {
    it("does not change the original board", () => {
      const originalBoard = JSON.parse(JSON.stringify(board));
      toggleCellMark({ board, cell });
      expect(board).toEqual(originalBoard);
    });

    it("does not change the number of opened cells", () => {
      const result = toggleCellMark({ board, cell });
      expect(result.board.numOpenedCells).toBe(board.numOpenedCells);
    });

    it("does not change the number of total mines", () => {
      const result = toggleCellMark({ board, cell });
      expect(result.board.numTotalMines).toBe(board.numTotalMines);
    });

    it("does not modify any of the other cells", () => {
      const result = toggleCellMark({ board, cell });
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
      const result = toggleCellMark({ board, cell });
      const resultCell = result.board.cells[cell.rowIndex][cell.columnIndex];
      const originalCell = board.cells[cell.rowIndex][cell.columnIndex];
      expect(resultCell.rowIndex).toBe(originalCell.rowIndex);
      expect(resultCell.columnIndex).toBe(originalCell.columnIndex);
      expect(resultCell.hasMine).toBe(originalCell.hasMine);
      expect(resultCell.numNeighborsWithMines).toBe(
        originalCell.numNeighborsWithMines
      );
    });

    it("returns triedMarkingTooManyCells: false", () => {
      const result = toggleCellMark({ board, cell });
      expect(result.triedMarkingTooManyCells).toBeFalse();
    });
  };

  const runTestsForMarkingACell = ({
    board,
    cell,
  }: {
    board: GameBoard;
    cell: GameCell;
  }) => {
    runInvariantTests({ board, cell });
    runCommonTestsForCellChange({ board, cell });

    it(`decreases the number of available flags by one`, () => {
      const result = toggleCellMark({ board, cell });
      expect(result.board.numFlagsLeft).toBe(board.numFlagsLeft - 1);
    });

    it("marks the passed cell", () => {
      const result = toggleCellMark({ board, cell });
      expect(result.board.cells[cell.rowIndex][cell.columnIndex].status).toBe(
        "marked"
      );
    });
  };

  describe("marking first cell without a mine", () => {
    runTestsForMarkingACell({
      board: initialBoard,
      cell: initialBoard.cells[0][0],
    });
  });

  describe("marking first cell with a mine", () => {
    runTestsForMarkingACell({
      board: initialBoard,
      cell: initialBoard.cells[1][0],
    });
  });

  describe("marking cell without a mine using the last flag", () => {
    const board: GameBoard = getClonedInitialBoard();
    board.cells[0][0].status = "marked";
    board.numFlagsLeft = 1;
    runTestsForMarkingACell({
      board,
      cell: board.cells[0][2],
    });
  });

  describe("marking cell with a mine using the last flag", () => {
    const board: GameBoard = getClonedInitialBoard();
    board.cells[0][0].status = "marked";
    board.numFlagsLeft = 1;
    runTestsForMarkingACell({
      board,
      cell: board.cells[1][0],
    });
  });

  const runTestsForUnmarkingACell = ({
    board,
    cell,
  }: {
    board: GameBoard;
    cell: GameCell;
  }) => {
    runInvariantTests({ board, cell });
    runCommonTestsForCellChange({ board, cell });

    it(`increases the number of available flags by one`, () => {
      const result = toggleCellMark({ board, cell });
      expect(result.board.numFlagsLeft).toBe(board.numFlagsLeft + 1);
    });

    it("unmarks the passed cell", () => {
      const result = toggleCellMark({ board, cell });
      expect(result.board.cells[cell.rowIndex][cell.columnIndex].status).toBe(
        "closed"
      );
    });
  };

  describe("unmark first flag on an unmined cell", () => {
    const board: GameBoard = getClonedInitialBoard();
    board.cells[0][0].status = "marked";
    board.numFlagsLeft = 1;
    runTestsForUnmarkingACell({
      board,
      cell: board.cells[0][0],
    });
  });

  describe("unmark first flag on a mined cell", () => {
    const board: GameBoard = getClonedInitialBoard();
    board.cells[1][0].status = "marked";
    board.numFlagsLeft = 1;
    runTestsForUnmarkingACell({
      board,
      cell: board.cells[1][0],
    });
  });

  describe("unmark last flag on an unmined cell", () => {
    const board: GameBoard = getClonedInitialBoard();
    board.cells[0][0].status = "marked";
    board.cells[0][1].status = "marked";
    board.numFlagsLeft = 0;
    runTestsForUnmarkingACell({
      board,
      cell: board.cells[0][0],
    });
  });

  describe("unmark last flag on a mined cell", () => {
    const board: GameBoard = getClonedInitialBoard();
    board.cells[0][0].status = "marked";
    board.cells[1][0].status = "marked";
    board.numFlagsLeft = 0;
    runTestsForUnmarkingACell({
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
      const result = toggleCellMark({ board, cell });
      expect(result.board.numFlagsLeft).toBe(board.numFlagsLeft);
    });

    it("does not modify the cell", () => {
      const result = toggleCellMark({ board, cell });
      expect(result.board.cells[cell.rowIndex][cell.columnIndex]).toEqual(
        board.cells[cell.rowIndex][cell.columnIndex]
      );
    });

    it(`returns triedMarkingTooManyCells: ${expectedTooManyCells}`, () => {
      const result = toggleCellMark({ board, cell });
      expect(result.triedMarkingTooManyCells).toBe(expectedTooManyCells);
    });
  };

  describe("trying to mark unmined cell when there are no flags left", () => {
    const board: GameBoard = getClonedInitialBoard();
    board.cells[0][0].status = "marked";
    board.cells[1][0].status = "marked";
    board.numFlagsLeft = 0;
    runTestsForNoExpectedChange({
      board,
      cell: board.cells[0][1],
      expectedTooManyCells: true,
    });
  });

  describe("trying to mark mined cell when there are no flags left", () => {
    const board: GameBoard = getClonedInitialBoard();
    board.cells[0][0].status = "marked";
    board.cells[1][0].status = "marked";
    board.numFlagsLeft = 0;
    runTestsForNoExpectedChange({
      board,
      cell: board.cells[1][2],
      expectedTooManyCells: true,
    });
  });

  describe("trying to mark open cell", () => {
    const board: GameBoard = getClonedInitialBoard();
    board.cells[0][0].status = "open";
    board.numOpenedCells = 1;
    runTestsForNoExpectedChange({
      board,
      cell: board.cells[0][0],
      expectedTooManyCells: false,
    });
  });
});
