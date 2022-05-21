import { fillBoardAfterFirstClick } from "./board_filling_functions";
import { handleFirstClick } from "./game_start_functions";
import { BoardAndStatus } from "../common/types";
import { generateEmptyBoardForTests } from "../common/tests/common_test_functions";
import { openCell } from "../game_rules/open_single_cell_functions";

jest.mock("../game_rules/open_single_cell_functions");
jest.mock("../game_setup/board_filling_functions");

describe("handleFirstClick", () => {
  const mockedFillBoardResult: BoardAndStatus = {
    board: {
      cells: [
        [
          {
            rowIndex: 0,
            columnIndex: 0,
            hasMine: false,
            numNeighborsWithMines: 1,
            status: "closed",
          },
        ],
      ],
      numFlagsLeft: 4,
      numOpenedCells: 5,
      numTotalMines: 6,
    },
    status: "playing",
  };

  (fillBoardAfterFirstClick as jest.Mock).mockReturnValue(
    mockedFillBoardResult
  );

  const mockedOpenCellResult: BoardAndStatus = {
    board: {
      cells: [
        [
          {
            rowIndex: 0,
            columnIndex: 0,
            hasMine: false,
            numNeighborsWithMines: 0,
            status: "open",
          },
        ],
      ],
      numFlagsLeft: 3,
      numOpenedCells: 1,
      numTotalMines: 2,
    },
    status: "won",
  };

  (openCell as jest.Mock).mockReturnValue(mockedOpenCellResult);

  beforeEach(() => jest.clearAllMocks());

  it("does not modify the passed board", () => {
    const board = generateEmptyBoardForTests(5, 5);
    const clonedBoard = JSON.parse(JSON.stringify(board));
    handleFirstClick({
      board,
      cell: board.cells[0][0],
    });
    expect(board).toEqual(clonedBoard);
  });

  it("calls fillBoardAfterFirstClick with the passed board and cell", () => {
    const board = generateEmptyBoardForTests(5, 5);
    handleFirstClick({
      board,
      cell: board.cells[0][0],
    });
    expect(fillBoardAfterFirstClick).toHaveBeenCalledTimes(1);
    const param = (fillBoardAfterFirstClick as jest.Mock).mock.calls[0][0];
    expect(param).toEqual({
      board,
      cell: board.cells[0][0],
    });
  });

  it(
    "calls openCell with the result of fillBoardAfterFirstClick " +
      "and the result cell with the same position and the original",
    () => {
      const board = generateEmptyBoardForTests(5, 5);
      handleFirstClick({
        board,
        cell: board.cells[0][0],
      });
      expect(openCell).toHaveBeenCalledTimes(1);
      const param = (openCell as jest.Mock).mock.calls[0][0];
      expect(param).toEqual({
        ...mockedFillBoardResult,
        cell: mockedFillBoardResult.board.cells[0][0],
      });
    }
  );

  it("returns the result of openCell", () => {
    const board = generateEmptyBoardForTests(5, 5);
    const result = handleFirstClick({
      board,
      cell: board.cells[0][0],
    });
    expect(result).toEqual(mockedOpenCellResult);
  });
});
