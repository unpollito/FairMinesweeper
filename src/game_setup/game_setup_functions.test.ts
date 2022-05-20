import { generateEmptyBoard } from "./game_setup_functions";
import { GameBoard, GameCell, GameDifficulty } from "../common/types";
import { GAME_MODES } from "./game_setup_constants";

jest.mock("../common/random_util_functions");

describe("generateEmptyBoard", () => {
  (["easy", "medium", "hard"] as GameDifficulty[]).forEach((difficulty) => {
    describe(difficulty, () => {
      let board: GameBoard;

      beforeEach(() => {
        board = generateEmptyBoard(difficulty);
      });

      it("generates a board", () => {
        expect(board).toBeDefined();
      });

      it("has the correct size", () => {
        expect(board.cells).toBeArrayOfSize(GAME_MODES[difficulty].height);
        for (const row of board.cells) {
          expect(row).toBeArrayOfSize(GAME_MODES[difficulty].width);
        }
      });

      it("has the correct number of flags left", () => {
        expect(board.numFlagsLeft).toBe(GAME_MODES[difficulty].numMines);
      });

      it("has numOpenedCells set to 0", () => {
        expect(board.numOpenedCells).toBe(0);
      });

      it("has the correct number of total mines", () => {
        expect(board.numTotalMines).toBe(GAME_MODES[difficulty].numMines);
      });

      describe("cells", () => {
        const runForAllCells = (
          cb: (cell: GameCell, rowIndex: number, columnIndex: number) => void
        ) =>
          board.cells.forEach((row, rowIndex) =>
            row.forEach((cell, columnIndex) => cb(cell, rowIndex, columnIndex))
          );

        it("have the correct position", () => {
          runForAllCells((cell, rowIndex, columnIndex) => {
            expect(cell.rowIndex).toBe(rowIndex);
            expect(cell.columnIndex).toBe(columnIndex);
          });
        });

        it("don't have a mine", () => {
          runForAllCells((cell) => expect(cell.hasMine).toBe(false));
        });

        it("don't have any neighbors with mines", () => {
          runForAllCells((cell) => expect(cell.numNeighborsWithMines).toBe(0));
        });

        it("have an status of closed", () => {
          runForAllCells((cell) => expect(cell.status).toBe("closed"));
        });
      });
    });
  });
});
