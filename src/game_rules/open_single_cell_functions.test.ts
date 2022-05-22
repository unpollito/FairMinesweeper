import {
  generate000_x1xBoardForTests,
  generate000x_11xxBoardForTests,
} from "../common/tests/common_test_functions";
import { openCell } from "./open_single_cell_functions";
import { BoardAndStatus, GameBoard } from "../common/types";

describe("openCell", () => {
  it("does not change anything if the cell is already open", () => {
    const board = generate000_x1xBoardForTests();
    board.cells[0][0].status = "open";
    board.numOpenedCells = 1;

    expect(
      openCell({ board, cell: board.cells[0][0], status: "playing" })
    ).toEqual({
      board,
      status: "playing",
    });
  });

  it("does not change anything if the cell is flagged", () => {
    const board = generate000_x1xBoardForTests();
    board.cells[0][0].status = "flagged";
    board.numFlagsLeft--;

    expect(
      openCell({ board, cell: board.cells[0][0], status: "playing" })
    ).toEqual({
      board,
      status: "playing",
    });
  });

  it("does not change anything if the game is lost", () => {
    const board = generate000_x1xBoardForTests();
    board.cells[1][0].status = "exploded";

    expect(
      openCell({ board, cell: board.cells[0][0], status: "lost" })
    ).toEqual({
      board,
      status: "lost",
    });
  });

  it("does not change anything if the game is won", () => {
    const board = generate000_x1xBoardForTests();
    board.cells[0][0].status = "open";
    board.cells[0][1].status = "open";
    board.cells[0][2].status = "open";
    board.cells[1][1].status = "open";
    board.numOpenedCells = 4;

    expect(openCell({ board, cell: board.cells[0][0], status: "won" })).toEqual(
      {
        board,
        status: "won",
      }
    );
  });

  describe("open a single cell without a mine and with some neighbor with mines", () => {
    let board: GameBoard;
    let originalBoard: GameBoard;
    let result: BoardAndStatus;

    beforeEach(() => {
      board = generate000x_11xxBoardForTests();
      originalBoard = JSON.parse(JSON.stringify(board));
      result = openCell({
        board,
        cell: board.cells[0][1],
        status: "playing",
      });
    });

    it("does not change the passed board", () => {
      expect(board).toEqual(originalBoard);
    });

    it("opens the cell", () => {
      expect(result.board.cells[0][1].status).toBe("open");
    });

    it("does not change any other cell field", () => {
      expect(result.board.cells[0][1].rowIndex).toBe(0);
      expect(result.board.cells[0][1].columnIndex).toBe(1);
      expect(result.board.cells[0][1].numNeighborsWithMines).toBe(
        board.cells[0][1].numNeighborsWithMines
      );
      expect(result.board.cells[0][1].hasMine).toBeFalse();
    });

    it("does not change any other cell", () => {
      expect(result.board.cells[0][0]).toEqual(board.cells[0][0]);
      expect(result.board.cells[0][2]).toEqual(board.cells[0][2]);
      expect(result.board.cells[0][3]).toEqual(board.cells[0][3]);
      expect(result.board.cells[1][0]).toEqual(board.cells[1][0]);
      expect(result.board.cells[1][1]).toEqual(board.cells[1][1]);
      expect(result.board.cells[1][2]).toEqual(board.cells[1][2]);
      expect(result.board.cells[1][3]).toEqual(board.cells[1][3]);
    });

    it("increases the number of open cells by 1", () => {
      expect(result.board.numOpenedCells).toBe(1);
    });

    it("does not change any other board status fields", () => {
      expect(result.board.numFlagsLeft).toEqual(board.numFlagsLeft);
      expect(result.board.numTotalMines).toEqual(board.numTotalMines);
    });

    it("returns playing as the status", () => {
      expect(result.status).toBe("playing");
    });
  });

  describe("open an island cell with 0 mined neighbors", () => {
    let board: GameBoard;
    let originalBoard: GameBoard;
    let result: BoardAndStatus;

    beforeEach(() => {
      board = generate000x_11xxBoardForTests();
      originalBoard = JSON.parse(JSON.stringify(board));
      result = openCell({
        board,
        cell: board.cells[0][0],
        status: "playing",
      });
    });

    it("does not change the passed board", () => {
      expect(board).toEqual(originalBoard);
    });

    it("opens the cell", () => {
      expect(result.board.cells[0][0].status).toBe("open");
    });

    it("opens neighboring cells", () => {
      expect(result.board.cells[0][1].status).toBe("open");
      expect(result.board.cells[1][0].status).toBe("open");
      expect(result.board.cells[1][1].status).toBe("open");
    });

    it("does not change any other cell field", () => {
      const cells = result.board.cells;
      [cells[0][0], cells[0][1], cells[1][0], cells[1][1]].forEach((cell) => {
        expect(cell.numNeighborsWithMines).toBe(
          board.cells[cell.rowIndex][cell.columnIndex].numNeighborsWithMines
        );
        expect(cell.hasMine).toBeFalse();
      });
    });

    it("does not change any unopened cell", () => {
      expect(result.board.cells[0][2]).toEqual(board.cells[0][2]);
      expect(result.board.cells[0][3]).toEqual(board.cells[0][3]);
      expect(result.board.cells[1][2]).toEqual(board.cells[1][2]);
      expect(result.board.cells[1][3]).toEqual(board.cells[1][3]);
    });

    it("increases the number of open cells by an appropiate amount", () => {
      expect(result.board.numOpenedCells).toBe(4);
    });

    it("does not change any other board status fields", () => {
      expect(result.board.numFlagsLeft).toEqual(board.numFlagsLeft);
      expect(result.board.numTotalMines).toEqual(board.numTotalMines);
    });

    it("returns playing as the status", () => {
      expect(result.status).toBe("playing");
    });
  });

  describe("open a mine", () => {
    let board: GameBoard;
    let originalBoard: GameBoard;
    let result: BoardAndStatus;

    beforeEach(() => {
      board = generate000x_11xxBoardForTests();
      originalBoard = JSON.parse(JSON.stringify(board));
      result = openCell({
        board,
        cell: board.cells[1][3],
        status: "playing",
      });
    });

    it("does not change the passed board", () => {
      expect(board).toEqual(originalBoard);
    });

    it("explodes the cell", () => {
      expect(result.board.cells[1][3].status).toBe("exploded");
    });

    it("does not change any other cell field", () => {
      expect(result.board.cells[1][3].rowIndex).toBe(1);
      expect(result.board.cells[1][3].columnIndex).toBe(3);
      expect(result.board.cells[1][3].numNeighborsWithMines).toBe(
        board.cells[1][3].numNeighborsWithMines
      );
      expect(result.board.cells[1][3].hasMine).toBeTrue();
    });

    it("does not change any other cell", () => {
      expect(result.board.cells[0][0]).toEqual(board.cells[0][0]);
      expect(result.board.cells[0][1]).toEqual(board.cells[0][1]);
      expect(result.board.cells[0][2]).toEqual(board.cells[0][2]);
      expect(result.board.cells[0][3]).toEqual(board.cells[0][3]);
      expect(result.board.cells[1][0]).toEqual(board.cells[1][0]);
      expect(result.board.cells[1][1]).toEqual(board.cells[1][1]);
      expect(result.board.cells[1][2]).toEqual(board.cells[1][2]);
    });

    it("does not change any other board status fields", () => {
      expect(result.board.numFlagsLeft).toEqual(board.numFlagsLeft);
      expect(result.board.numTotalMines).toEqual(board.numTotalMines);
    });

    it("returns lost as the status", () => {
      expect(result.status).toBe("lost");
    });
  });

  describe("win by opening last single cell", () => {
    let board: GameBoard;
    let originalBoard: GameBoard;
    let result: BoardAndStatus;

    beforeEach(() => {
      board = generate000x_11xxBoardForTests();
      board.cells[0][0].status = "open";
      board.cells[0][1].status = "open";
      board.cells[1][0].status = "open";
      board.cells[1][1].status = "open";
      board.numOpenedCells = 4;
      originalBoard = JSON.parse(JSON.stringify(board));
      result = openCell({
        board,
        cell: board.cells[0][2],
        status: "playing",
      });
    });

    it("does not change the passed board", () => {
      expect(board).toEqual(originalBoard);
    });

    it("opens the cell", () => {
      expect(result.board.cells[0][2].status).toBe("open");
    });

    it("does not change any other cell field", () => {
      expect(result.board.cells[0][2].rowIndex).toBe(0);
      expect(result.board.cells[0][2].columnIndex).toBe(2);
      expect(result.board.cells[0][2].numNeighborsWithMines).toBe(
        board.cells[0][2].numNeighborsWithMines
      );
      expect(result.board.cells[0][2].hasMine).toBeFalse();
    });

    it("does not change any other cell", () => {
      expect(result.board.cells[0][0]).toEqual(board.cells[0][0]);
      expect(result.board.cells[0][1]).toEqual(board.cells[0][1]);
      expect(result.board.cells[0][3]).toEqual(board.cells[0][3]);
      expect(result.board.cells[1][0]).toEqual(board.cells[1][0]);
      expect(result.board.cells[1][1]).toEqual(board.cells[1][1]);
      expect(result.board.cells[1][2]).toEqual(board.cells[1][2]);
      expect(result.board.cells[1][3]).toEqual(board.cells[1][3]);
    });

    it("increases the number of open cells by 1", () => {
      expect(result.board.numOpenedCells).toBe(5);
    });

    it("does not change any other board status fields", () => {
      expect(result.board.numFlagsLeft).toEqual(board.numFlagsLeft);
      expect(result.board.numTotalMines).toEqual(board.numTotalMines);
    });

    it("returns won as the status", () => {
      expect(result.status).toBe("won");
    });
  });

  describe("win by opening island", () => {
    let board: GameBoard;
    let originalBoard: GameBoard;
    let result: BoardAndStatus;

    beforeEach(() => {
      board = generate000x_11xxBoardForTests();
      board.cells[0][2].status = "open";
      board.numOpenedCells = 1;
      originalBoard = JSON.parse(JSON.stringify(board));
      result = openCell({
        board,
        cell: board.cells[0][0],
        status: "playing",
      });
    });

    it("does not change the passed board", () => {
      expect(board).toEqual(originalBoard);
    });

    it("opens the cell", () => {
      expect(result.board.cells[0][0].status).toBe("open");
    });

    it("opens neighboring cells", () => {
      expect(result.board.cells[0][1].status).toBe("open");
      expect(result.board.cells[1][0].status).toBe("open");
      expect(result.board.cells[1][1].status).toBe("open");
    });

    it("does not change any other cell field", () => {
      const cells = result.board.cells;
      [cells[0][0], cells[0][1], cells[1][0], cells[1][1]].forEach((cell) => {
        expect(cell.numNeighborsWithMines).toBe(
          board.cells[cell.rowIndex][cell.columnIndex].numNeighborsWithMines
        );
        expect(cell.hasMine).toBeFalse();
      });
    });

    it("does not change any unopened cell", () => {
      expect(result.board.cells[0][2]).toEqual(board.cells[0][2]);
      expect(result.board.cells[0][3]).toEqual(board.cells[0][3]);
      expect(result.board.cells[1][2]).toEqual(board.cells[1][2]);
      expect(result.board.cells[1][3]).toEqual(board.cells[1][3]);
    });

    it("increases the number of open cells by an appropiate amount", () => {
      expect(result.board.numOpenedCells).toBe(5);
    });

    it("does not change any other board status fields", () => {
      expect(result.board.numFlagsLeft).toEqual(board.numFlagsLeft);
      expect(result.board.numTotalMines).toEqual(board.numTotalMines);
    });

    it("returns won as the status", () => {
      expect(result.status).toBe("won");
    });
  });

  describe("lost by opening mine with only one unmined cell left", () => {
    let board: GameBoard;
    let originalBoard: GameBoard;
    let result: BoardAndStatus;

    beforeEach(() => {
      board = generate000x_11xxBoardForTests();
      board.cells[0][0].status = "open";
      board.cells[0][1].status = "open";
      board.cells[1][0].status = "open";
      board.cells[1][1].status = "open";
      board.numOpenedCells = 4;
      originalBoard = JSON.parse(JSON.stringify(board));
      result = openCell({
        board,
        cell: board.cells[1][3],
        status: "playing",
      });
    });

    it("does not change the passed board", () => {
      expect(board).toEqual(originalBoard);
    });

    it("explodes the cell", () => {
      expect(result.board.cells[1][3].status).toBe("exploded");
    });

    it("does not change any other cell field", () => {
      expect(result.board.cells[1][3].rowIndex).toBe(1);
      expect(result.board.cells[1][3].columnIndex).toBe(3);
      expect(result.board.cells[1][3].numNeighborsWithMines).toBe(
        board.cells[1][3].numNeighborsWithMines
      );
      expect(result.board.cells[1][3].hasMine).toBeTrue();
    });

    it("does not change any other cell", () => {
      expect(result.board.cells[0][0]).toEqual(board.cells[0][0]);
      expect(result.board.cells[0][1]).toEqual(board.cells[0][1]);
      expect(result.board.cells[0][2]).toEqual(board.cells[0][2]);
      expect(result.board.cells[0][3]).toEqual(board.cells[0][3]);
      expect(result.board.cells[1][0]).toEqual(board.cells[1][0]);
      expect(result.board.cells[1][1]).toEqual(board.cells[1][1]);
      expect(result.board.cells[1][2]).toEqual(board.cells[1][2]);
    });

    it("does not change any other board status fields", () => {
      expect(result.board.numFlagsLeft).toEqual(board.numFlagsLeft);
      expect(result.board.numTotalMines).toEqual(board.numTotalMines);
    });

    it("returns lost as the status", () => {
      expect(result.status).toBe("lost");
    });
  });
});
