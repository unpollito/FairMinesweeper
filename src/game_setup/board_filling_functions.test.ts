import { fillBoardAfterFirstClick } from "./board_filling_functions";
import { generateEmptyBoard } from "./board_generation_functions";
import { GameBoard, GameDifficulty } from "../common/types";
import { GAME_MODES } from "./game_setup_constants";
import { getCellNeighbors } from "../common/cell_neighbor_functions";

jest.mock("../common/random_util_functions");

describe("fillBoardAfterFirstClick", () => {
  (["easy", "medium", "hard"] as GameDifficulty[]).forEach((difficulty) => {
    describe(difficulty, () => {
      let board: GameBoard;

      beforeEach(() => {
        board = generateEmptyBoard(difficulty);
      });

      it("does not make any changes to the passed board", () => {
        const originalBoard: GameBoard = JSON.parse(JSON.stringify(board));
        fillBoardAfterFirstClick({ board, cell: board.cells[0][0] });
        expect(board).toEqual(originalBoard);
      });

      it("does not change the board metadata", () => {
        const { board: newBoard } = fillBoardAfterFirstClick({
          board,
          cell: board.cells[0][0],
        });
        expect(newBoard.numFlagsLeft).toBe(board.numFlagsLeft);
        expect(newBoard.numTotalMines).toBe(board.numTotalMines);
      });

      it("has the correct number of cells with mines", () => {
        const { board: newBoard } = fillBoardAfterFirstClick({
          board,
          cell: board.cells[0][0],
        });
        const cellsWithMines = newBoard.cells
          .reduce((a, b) => [...a, ...b], [])
          .filter((cell) => cell.hasMine);
        expect(cellsWithMines).toBeArrayOfSize(GAME_MODES[difficulty].numMines);
      });

      it("has all the correct numbers of neighbors with mines", () => {
        const { board: newBoard } = fillBoardAfterFirstClick({
          board,
          cell: board.cells[0][0],
        });
        newBoard.cells.forEach((row) =>
          row.forEach((cell) => {
            const neighbors = getCellNeighbors({ board: newBoard, cell });
            expect(cell.numNeighborsWithMines).toBe(
              neighbors.filter((neighbor) => neighbor.hasMine).length
            );
          })
        );
      });
    });
  });
});
