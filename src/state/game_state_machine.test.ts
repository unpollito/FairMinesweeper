import { interpret, InterpreterStatus } from "xstate";
import { toggleCellMark } from "../game_rules/mark_cell_functions";
import { gameStateMachine } from "./game_state_machine";
import { generateEmptyBoard } from "../game_setup/board_generation_functions";
import {
  generate000_x1xBoardForTests,
  generateEmptyBoardForTests,
} from "../common/tests/common_test_functions";
import { handleFirstClick } from "../game_setup/game_start_functions";
import { clearNeighbors } from "../game_rules/open_neighbors_functions";
import { BoardAndStatus, GameBoard } from "../common/types";
import { openCell } from "../game_rules/open_single_cell_functions";

jest.mock("../game_rules/mark_cell_functions");
jest.mock("../game_rules/open_neighbors_functions");
jest.mock("../game_rules/open_single_cell_functions");
jest.mock("../game_setup/board_generation_functions");
jest.mock("../game_setup/board_filling_functions");
jest.mock("../game_setup/game_start_functions");

describe("gameStateMachine", (): void => {
  let service = interpret(gameStateMachine);

  const mockedEmptyBoard = generateEmptyBoardForTests(2, 3);
  const mockedBoardAfterFirstClick = generate000_x1xBoardForTests();
  mockedBoardAfterFirstClick.cells[0][1].status = "open";
  mockedBoardAfterFirstClick.numOpenedCells = 1;

  (generateEmptyBoard as jest.Mock).mockImplementation(() => mockedEmptyBoard);
  (handleFirstClick as jest.Mock).mockImplementation(() => ({
    board: mockedBoardAfterFirstClick,
    status: "playing",
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    if (service.status === InterpreterStatus.Running) {
      service.stop();
    }
    service = interpret(gameStateMachine);
    service.start();
  });

  describe("initial state", () => {
    it("starts on the idle state", () => {
      expect(service.state.matches("idle")).toBeTrue();
    });

    it("starts with an undefined startTime and endTime", () => {
      expect(service.state.context.startTime).toBeUndefined();
      expect(service.state.context.endTime).toBeUndefined();
    });

    it("goes to the beforeFirstClick event on receiving a START event", () => {
      service.send({ difficulty: "easy", type: "START" });
      expect(service.state.matches("beforeFirstClick")).toBeTrue();
    });
  });

  describe("beforeFirstClick", () => {
    it("invokes generateEmptyBoard with difficulty = easy", () => {
      service.send({ difficulty: "easy", type: "START" });
      expect(generateEmptyBoard).toHaveBeenCalledTimes(1);
      expect(generateEmptyBoard).toHaveBeenCalledWith("easy");
    });

    it("invokes generateEmptyBoard with difficulty = medium", () => {
      service.send({ difficulty: "medium", type: "START" });
      expect(generateEmptyBoard).toHaveBeenCalledTimes(1);
      expect(generateEmptyBoard).toHaveBeenCalledWith("medium");
    });

    it("invokes generateEmptyBoard with difficulty = hard", () => {
      service.send({ difficulty: "hard", type: "START" });
      expect(generateEmptyBoard).toHaveBeenCalledTimes(1);
      expect(generateEmptyBoard).toHaveBeenCalledWith("hard");
    });

    it("sets the board to the result of generateEmptyBoard", () => {
      service.send({ difficulty: "hard", type: "START" });
      expect(service.state.context.cells).toEqual(mockedEmptyBoard.cells);
      expect(service.state.context.numOpenedCells).toEqual(
        mockedEmptyBoard.numOpenedCells
      );
      expect(service.state.context.numFlagsLeft).toEqual(
        mockedEmptyBoard.numFlagsLeft
      );
      expect(service.state.context.numTotalMines).toEqual(
        mockedEmptyBoard.numTotalMines
      );
    });

    it("sets startTime when starting the game", () => {
      service.send({ difficulty: "hard", type: "START" });
      expect(service.state.context.startTime).toBeDefined();
    });

    it("does not set endTime when starting the game", () => {
      service.send({ difficulty: "hard", type: "START" });
      expect(service.state.context.endTime).toBeUndefined();
    });

    it("has triedMarkingTooManyCells = false when starting the game", () => {
      service.send({ difficulty: "hard", type: "START" });
      expect(service.state.context.triedMarkingTooManyCells).toBeFalse();
    });

    it("ignores any MARK events", () => {
      service.send({ difficulty: "hard", type: "START" });
      service.send({ cell: mockedEmptyBoard.cells[0][0], type: "MARK" });
      expect(service.state.matches("beforeFirstClick"));
      expect(toggleCellMark).not.toHaveBeenCalled();
    });

    it("ignores any CLEAR_NEIGHBORS events", () => {
      service.send({ difficulty: "hard", type: "START" });
      service.send({
        cell: mockedEmptyBoard.cells[0][0],
        type: "CLEAR_NEIGHBORS",
      });
      expect(service.state.matches("beforeFirstClick"));
      expect(clearNeighbors).not.toHaveBeenCalled();
    });

    it("goes to the handlingFirstClick state on a CLICK event", () => {
      service.send({ difficulty: "hard", type: "START" });
      service.send({ cell: mockedEmptyBoard.cells[0][0], type: "CLICK" });
      expect(service.state.matches("handlingFirstClick"));
    });
  });

  describe("handlingFirstClick", () => {
    beforeEach(() => {
      service.send({ difficulty: "hard", type: "START" });
      service.send({ cell: mockedEmptyBoard.cells[0][1], type: "CLICK" });
    });

    it("invokes the handleFirstClick function", () => {
      expect(handleFirstClick).toHaveBeenCalledTimes(1);
    });

    it("sets the board with the state provided by the handleFirstClick function", () => {
      expect(service.state.context.cells).toEqual(
        mockedBoardAfterFirstClick.cells
      );
      expect(service.state.context.numFlagsLeft).toEqual(
        mockedBoardAfterFirstClick.numFlagsLeft
      );
      expect(service.state.context.numOpenedCells).toEqual(
        mockedBoardAfterFirstClick.numOpenedCells
      );
      expect(service.state.context.numTotalMines).toEqual(
        mockedBoardAfterFirstClick.numTotalMines
      );
    });

    it("has triedMarkingTooManyCells = false", () => {
      expect(service.state.context.triedMarkingTooManyCells).toBeFalse();
    });

    it("goes to the playing state", () => {
      expect(service.state.matches("playing"));
    });

    it("does not set endTime", () => {
      expect(service.state.context.endTime).toBeUndefined();
    });
  });

  describe("playing", () => {
    beforeEach(() => {
      service.send({ difficulty: "hard", type: "START" });
      service.send({ cell: mockedEmptyBoard.cells[0][1], type: "CLICK" });
    });

    describe("MARK", () => {
      const mockedToggleMarkResult = {
        board: JSON.parse(
          JSON.stringify(mockedBoardAfterFirstClick)
        ) as GameBoard,
        triedMarkingTooManyCells: false,
      };
      mockedToggleMarkResult.board.cells[1][2].status = "marked";
      mockedToggleMarkResult.board.numFlagsLeft = 2;

      (toggleCellMark as jest.Mock).mockReturnValue(mockedToggleMarkResult);

      it("invokes toggleCellMark", () => {
        service.send({ cell: mockedEmptyBoard.cells[1][2], type: "MARK" });
        expect(toggleCellMark).toHaveBeenCalledTimes(1);
      });

      it("sets the board to the values returned by toggleCellMark", () => {
        service.send({ cell: mockedEmptyBoard.cells[1][2], type: "MARK" });
        const mockBoard = mockedToggleMarkResult.board;
        expect(service.state.context.cells).toEqual(mockBoard.cells);
        expect(service.state.context.numFlagsLeft).toEqual(
          mockBoard.numFlagsLeft
        );
        expect(service.state.context.numOpenedCells).toEqual(
          mockBoard.numOpenedCells
        );
        expect(service.state.context.numTotalMines).toEqual(
          mockBoard.numTotalMines
        );
      });

      it("sets triedMarkingTooManyCells to false when returned by toggleCellMark", () => {
        service.send({ cell: mockedEmptyBoard.cells[1][2], type: "MARK" });
        expect(service.state.context.triedMarkingTooManyCells).toBeFalse();
      });

      it("sets triedMarkingTooManyCells to true when returned by toggleCellMark", () => {
        (toggleCellMark as jest.Mock).mockReturnValueOnce({
          board: mockedToggleMarkResult.board,
          triedMarkingTooManyCells: true,
        });
        service.send({ cell: mockedEmptyBoard.cells[1][2], type: "MARK" });
        expect(service.state.context.triedMarkingTooManyCells).toBeTrue();
      });
    });

    const mockedBoardAfterClickOrClearNeighbors = JSON.parse(
      JSON.stringify(mockedBoardAfterFirstClick)
    ) as GameBoard;
    mockedBoardAfterClickOrClearNeighbors.cells[1][1].status = "open";
    mockedBoardAfterClickOrClearNeighbors.numOpenedCells = 2;

    const mockedClickOrClearNeighborsResult: BoardAndStatus = {
      board: mockedBoardAfterClickOrClearNeighbors,
      status: "playing",
    };

    describe("CLICK", () => {
      beforeEach(() => {
        (openCell as jest.Mock).mockReturnValue(
          mockedClickOrClearNeighborsResult
        );
      });

      it("sets triedMarkingTooManyCells = false", async () => {
        (toggleCellMark as jest.Mock).mockReturnValueOnce({
          board: mockedBoardAfterFirstClick,
          triedMarkingTooManyCells: true,
        });
        service.send({ cell: mockedEmptyBoard.cells[1][2], type: "MARK" });
        service.send({ cell: mockedEmptyBoard.cells[1][1], type: "CLICK" });
        await Promise.resolve();
        expect(service.state.context.triedMarkingTooManyCells).toBeFalse();
      });

      it("invokes openCell", () => {
        service.send({ cell: mockedEmptyBoard.cells[1][1], type: "CLICK" });
        expect(openCell).toHaveBeenCalledTimes(1);
      });

      it("sets the board as returned by openCell", async (): Promise<void> => {
        service.send({ cell: mockedEmptyBoard.cells[1][1], type: "CLICK" });
        await Promise.resolve();
        expect(service.state.context.cells).toEqual(
          mockedBoardAfterClickOrClearNeighbors.cells
        );
        expect(service.state.context.numFlagsLeft).toEqual(
          mockedBoardAfterClickOrClearNeighbors.numFlagsLeft
        );
        expect(service.state.context.numOpenedCells).toEqual(
          mockedBoardAfterClickOrClearNeighbors.numOpenedCells
        );
        expect(service.state.context.numTotalMines).toEqual(
          mockedBoardAfterClickOrClearNeighbors.numTotalMines
        );
      });

      it("remains in the playing state if instructed by openCell", async () => {
        service.send({ cell: mockedEmptyBoard.cells[1][1], type: "CLICK" });
        await Promise.resolve();
        expect(service.state.matches("playing"));
      });

      it("goes to the won state if instructed by openCell", async () => {
        (openCell as jest.Mock).mockReturnValueOnce({
          board: mockedBoardAfterClickOrClearNeighbors,
          status: "won",
        });
        service.send({ cell: mockedEmptyBoard.cells[1][1], type: "CLICK" });
        await Promise.resolve();
        expect(service.state.matches("won"));
      });

      it("goes to the lost state if instructed by openCell", async () => {
        (openCell as jest.Mock).mockReturnValueOnce({
          board: mockedBoardAfterClickOrClearNeighbors,
          status: "lost",
        });
        service.send({ cell: mockedEmptyBoard.cells[1][1], type: "CLICK" });
        await Promise.resolve();
        expect(service.state.matches("won"));
      });
    });

    describe("CLEAR_NEIGHBORS", () => {
      beforeEach(() => {
        (clearNeighbors as jest.Mock).mockReturnValue(
          mockedClickOrClearNeighborsResult
        );
      });

      it("sets triedMarkingTooManyCells = false", async () => {
        (toggleCellMark as jest.Mock).mockReturnValueOnce({
          board: mockedBoardAfterFirstClick,
          triedMarkingTooManyCells: true,
        });
        service.send({ cell: mockedEmptyBoard.cells[1][2], type: "MARK" });
        service.send({
          cell: mockedEmptyBoard.cells[1][1],
          type: "CLEAR_NEIGHBORS",
        });
        await Promise.resolve();
        expect(service.state.context.triedMarkingTooManyCells).toBeFalse();
      });

      it("invokes clearNeighbors", () => {
        service.send({
          cell: mockedEmptyBoard.cells[1][1],
          type: "CLEAR_NEIGHBORS",
        });
        expect(clearNeighbors).toHaveBeenCalledTimes(1);
      });

      it("sets the board as returned by clearNeighbors", async (): Promise<void> => {
        service.send({
          cell: mockedEmptyBoard.cells[1][1],
          type: "CLEAR_NEIGHBORS",
        });
        await Promise.resolve();
        expect(service.state.context.cells).toEqual(
          mockedBoardAfterClickOrClearNeighbors.cells
        );
        expect(service.state.context.numFlagsLeft).toEqual(
          mockedBoardAfterClickOrClearNeighbors.numFlagsLeft
        );
        expect(service.state.context.numOpenedCells).toEqual(
          mockedBoardAfterClickOrClearNeighbors.numOpenedCells
        );
        expect(service.state.context.numTotalMines).toEqual(
          mockedBoardAfterClickOrClearNeighbors.numTotalMines
        );
      });

      it("remains in the playing state if instructed by clearNeighbors", async () => {
        service.send({
          cell: mockedEmptyBoard.cells[1][1],
          type: "CLEAR_NEIGHBORS",
        });
        await Promise.resolve();
        expect(service.state.matches("playing"));
      });

      it("goes to the won state if instructed by clearNeighbors", async () => {
        (clearNeighbors as jest.Mock).mockReturnValueOnce({
          board: mockedBoardAfterClickOrClearNeighbors,
          status: "won",
        });
        service.send({
          cell: mockedEmptyBoard.cells[1][1],
          type: "CLEAR_NEIGHBORS",
        });
        await Promise.resolve();
        expect(service.state.matches("won"));
      });

      it("goes to the lost state if instructed by clearNeighbors", async () => {
        (clearNeighbors as jest.Mock).mockReturnValueOnce({
          board: mockedBoardAfterClickOrClearNeighbors,
          status: "lost",
        });
        service.send({
          cell: mockedEmptyBoard.cells[1][1],
          type: "CLEAR_NEIGHBORS",
        });
        await Promise.resolve();
        expect(service.state.matches("won"));
      });
    });
  });

  describe("won", () => {
    beforeEach(async () => {
      (openCell as jest.Mock).mockReturnValue({
        board: mockedBoardAfterFirstClick,
        status: "won",
      });
      service.send({ difficulty: "hard", type: "START" });
      service.send({ cell: mockedEmptyBoard.cells[0][1], type: "CLICK" });
      await Promise.resolve();
      service.send({ cell: mockedEmptyBoard.cells[1][1], type: "CLICK" });
      await Promise.resolve();
    });

    it("sets endTime", () => {
      expect(service.state.context.endTime).toBeNumber();
    });

    describe("on START", () => {
      let oldStartTime: number;

      beforeEach(async () => {
        oldStartTime = service.state.context.startTime ?? 0;
        await new Promise((resolve) => setTimeout(resolve, 10));
        service.send({ difficulty: "easy", type: "START" });
      });

      it("goes to the beforeFirstClick state", () => {
        expect(service.state.matches("beforeFirstClick")).toBeTrue();
      });

      it("resets the board", () => {
        expect(service.state.context.cells).toEqual(mockedEmptyBoard.cells);
        expect(service.state.context.numFlagsLeft).toEqual(
          mockedEmptyBoard.numFlagsLeft
        );
        expect(service.state.context.numOpenedCells).toEqual(
          mockedEmptyBoard.numOpenedCells
        );
        expect(service.state.context.numTotalMines).toEqual(
          mockedEmptyBoard.numTotalMines
        );
      });

      it("sets startTime", () => {
        expect(service.state.context.startTime).toBeNumber();
        expect(service.state.context.startTime).toBeGreaterThan(oldStartTime);
      });

      it("unsets endTime", () => {
        expect(service.state.context.endTime).toBeUndefined();
      });
    });
  });

  describe("lost", () => {
    beforeEach(async () => {
      (openCell as jest.Mock).mockReturnValue({
        board: mockedBoardAfterFirstClick,
        status: "lost",
      });
      service.send({ difficulty: "hard", type: "START" });
      service.send({ cell: mockedEmptyBoard.cells[0][1], type: "CLICK" });
      await Promise.resolve();
      service.send({ cell: mockedEmptyBoard.cells[1][1], type: "CLICK" });
      await Promise.resolve();
    });

    it("sets endTime", () => {
      expect(service.state.context.endTime).toBeNumber();
    });

    describe("on START", () => {
      let oldStartTime: number;

      beforeEach(async () => {
        oldStartTime = service.state.context.startTime ?? 0;
        await new Promise((resolve) => setTimeout(resolve, 10));
        service.send({ difficulty: "easy", type: "START" });
      });

      it("goes to the beforeFirstClick state", () => {
        expect(service.state.matches("beforeFirstClick")).toBeTrue();
      });

      it("resets the board", () => {
        expect(service.state.context.cells).toEqual(mockedEmptyBoard.cells);
        expect(service.state.context.numFlagsLeft).toEqual(
          mockedEmptyBoard.numFlagsLeft
        );
        expect(service.state.context.numOpenedCells).toEqual(
          mockedEmptyBoard.numOpenedCells
        );
        expect(service.state.context.numTotalMines).toEqual(
          mockedEmptyBoard.numTotalMines
        );
      });

      it("sets startTime", () => {
        expect(service.state.context.startTime).toBeNumber();
        expect(service.state.context.startTime).toBeGreaterThan(oldStartTime);
      });

      it("unsets endTime", () => {
        expect(service.state.context.endTime).toBeUndefined();
      });
    });
  });
});
