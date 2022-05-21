jest.mock("./open_single_cell_functions");

import { openCell } from "./open_single_cell_functions";
import { BoardAndCellAndStatus } from "../common/types";
import {
  generate000_x1xBoardForTests,
  generate000x_11xxBoardForTests,
  generate0x0x_1x1xBoardForTests,
} from "../common/tests/common_test_functions";
import { clearNeighbors } from "./open_neighbors_functions";

describe("clearNeighbors", (): void => {
  const mockOpenCell = (): void => {
    (openCell as jest.Mock).mockImplementation(({ board, status }) => ({
      board,
      status,
    }));
  };

  const stopMockingOpenCell = (): void => {
    (openCell as jest.Mock).mockImplementation((params) =>
      jest.requireActual("./open_single_cell_functions").openCell(params)
    );
  };

  beforeEach(() => {
    (openCell as jest.Mock).mockReset();
  });

  const runTestsForNoChange = (params: BoardAndCellAndStatus): void => {
    const originalBoard = JSON.parse(JSON.stringify(params.board));

    beforeEach(() => {
      mockOpenCell();
    });

    it("does not modify the passed data", () => {
      clearNeighbors(params);
      expect(params.board).toEqual(originalBoard);
    });

    it("does not call openCell", () => {
      clearNeighbors(params);
      expect(openCell).not.toHaveBeenCalled();
    });

    it("returns the same board and status", () => {
      const result = clearNeighbors(params);
      expect(result.board).toEqual(params.board);
      expect(result.status).toBe(params.status);
    });
  };

  describe("with a closed cell passed", () => {
    const board = generate000_x1xBoardForTests();
    runTestsForNoChange({
      board,
      cell: board.cells[0][0],
      status: "playing",
    });
  });

  describe("marked cell and status = won", () => {
    const board = generate000_x1xBoardForTests();
    board.cells[0][0].status = "open";
    board.cells[0][1].status = "open";
    board.cells[0][2].status = "open";
    board.cells[1][0].status = "marked";
    board.cells[0][1].status = "open";
    board.numOpenedCells = 4;
    board.numFlagsLeft = 1;
    runTestsForNoChange({
      board,
      cell: board.cells[1][0],
      status: "won",
    });
  });

  describe("marked cell and status = lost", () => {
    const board = generate000_x1xBoardForTests();
    board.cells[1][0].status = "marked";
    board.cells[1][2].status = "exploded";
    board.numFlagsLeft = 1;
    runTestsForNoChange({
      board,
      cell: board.cells[1][0],
      status: "lost",
    });
  });

  describe("open cell and status = won", () => {
    const board = generate000_x1xBoardForTests();
    board.cells[0][0].status = "open";
    board.cells[0][1].status = "open";
    board.cells[0][2].status = "open";
    board.cells[1][0].status = "marked";
    board.cells[0][1].status = "open";
    board.numOpenedCells = 4;
    board.numFlagsLeft = 1;
    runTestsForNoChange({
      board,
      cell: board.cells[0][0],
      status: "won",
    });
  });

  describe("open cell and status = lost", () => {
    const board = generate000_x1xBoardForTests();
    board.cells[0][0].status = "open";
    board.cells[1][0].status = "marked";
    board.cells[1][2].status = "exploded";
    board.numFlagsLeft = 1;
    runTestsForNoChange({
      board,
      cell: board.cells[0][0],
      status: "lost",
    });
  });

  describe("open cells with all mined neighbors marked and keep playing", () => {
    const board = generate0x0x_1x1xBoardForTests();
    board.cells[0][0].status = "open";
    board.cells[0][1].status = "marked";
    board.cells[1][1].status = "marked";
    board.numOpenedCells = 1;
    board.numFlagsLeft = 2;

    const originalBoard = JSON.parse(JSON.stringify(board));

    const callParams: BoardAndCellAndStatus = {
      board,
      cell: board.cells[0][0],
      status: "playing",
    };

    it("does not modify the original board", () => {
      mockOpenCell();
      clearNeighbors(callParams);
      expect(board).toEqual(originalBoard);
    });

    it("invokes openCell once per neighbor", () => {
      mockOpenCell();
      clearNeighbors(callParams);
      expect(openCell).toHaveBeenCalledTimes(3);
    });

    it("opens all unmarked neighbors of the passed cell", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      const cells = result.board.cells;
      expect(cells[0][0].status).toBe("open");
      expect(cells[0][1].status).toBe("marked");
      expect(cells[1][0].status).toBe("open");
      expect(cells[1][1].status).toBe("marked");
    });

    it("does not open any non-neighbor cells", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      const cells = result.board.cells;
      expect(cells[0][2].status).toBe("closed");
      expect(cells[0][3].status).toBe("closed");
      expect(cells[1][2].status).toBe("closed");
      expect(cells[1][3].status).toBe("closed");
    });

    it("returns a board with the correct numOpenedCells", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      expect(result.board.numOpenedCells).toBe(2);
    });

    it("returns the correct status", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      expect(result.status).toBe("playing");
    });
  });

  describe("open cells with all mined neighbors marked and win the game", () => {
    const board = generate000x_11xxBoardForTests();
    board.cells[0][1].status = "open";
    board.cells[1][2].status = "marked";
    board.numOpenedCells = 1;
    board.numFlagsLeft = 2;

    const originalBoard = JSON.parse(JSON.stringify(board));

    const callParams: BoardAndCellAndStatus = {
      board,
      cell: board.cells[0][1],
      status: "playing",
    };

    it("does not modify the original board", () => {
      mockOpenCell();
      clearNeighbors(callParams);
      expect(board).toEqual(originalBoard);
    });

    it("invokes openCell once per neighbor", () => {
      mockOpenCell();
      clearNeighbors(callParams);
      expect(openCell).toHaveBeenCalledTimes(5);
    });

    it("opens all unmarked neighbors of the passed cell", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      const cells = result.board.cells;
      expect(cells[0][0].status).toBe("open");
      expect(cells[0][1].status).toBe("open");
      expect(cells[0][2].status).toBe("open");
      expect(cells[1][0].status).toBe("open");
      expect(cells[1][1].status).toBe("open");
      expect(cells[1][2].status).toBe("marked");
    });

    it("does not open any non-neighbor cells", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      const cells = result.board.cells;
      expect(cells[0][3].status).toBe("closed");
      expect(cells[1][3].status).toBe("closed");
    });

    it("returns a board with the correct numOpenedCells", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      expect(result.board.numOpenedCells).toBe(5);
    });

    it("returns the correct status", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      expect(result.status).toBe("won");
    });
  });

  describe("open cells with a mined neighbors unmarked", () => {
    const board = generate000x_11xxBoardForTests();
    board.cells[0][1].status = "open";
    board.numOpenedCells = 1;

    const originalBoard = JSON.parse(JSON.stringify(board));

    const callParams: BoardAndCellAndStatus = {
      board,
      cell: board.cells[0][1],
      status: "playing",
    };

    it("does not modify the original board", () => {
      mockOpenCell();
      clearNeighbors(callParams);
      expect(board).toEqual(originalBoard);
    });

    it("invokes openCell once per neighbor", () => {
      mockOpenCell();
      clearNeighbors(callParams);
      expect(openCell).toHaveBeenCalledTimes(5);
    });

    it("opens all unmarked neighbors of the passed cell", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      const cells = result.board.cells;
      expect(cells[0][0].status).toBe("open");
      expect(cells[0][1].status).toBe("open");
      expect(cells[0][2].status).toBe("open");
      expect(cells[1][0].status).toBe("open");
      expect(cells[1][1].status).toBe("open");
      expect(cells[1][2].status).toBe("exploded");
    });

    it("does not open any non-neighbor cells", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      const cells = result.board.cells;
      expect(cells[0][3].status).toBe("closed");
      expect(cells[1][3].status).toBe("closed");
    });

    it("returns the correct status", () => {
      stopMockingOpenCell();
      const result = clearNeighbors(callParams);
      expect(result.status).toBe("lost");
    });
  });
});
