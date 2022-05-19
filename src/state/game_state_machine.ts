import { assign, createMachine } from "xstate";
import {
  GameStateMachineContext,
  GameStateMachineEvent,
  GameStateMachineState,
} from "./game_state_machine_types";
import { generateEmptyBoard } from "../game_setup/game_setup_functions";
import {
  clearNeighbors,
  fillBoardAfterFirstClick,
  openCell,
  toggleCellMark,
} from "../game_setup/game_setup_procedures";

// This is a bit of a weird state machine. The weirdness comes from the fact
// that the "board" object from the context is actually holding some state of
// its own (specifically, whether we are waiting for the first click, in the
// middle of a game, we've won or we've lost). This is semantically a state
// and so it normally belongs in the state machine, i.e., I'd normally have
// "playing", "won" and "lost" states in the state machine, not in the board.
// However, I've decided to have it all in a separate object because:
//
// 1. It makes the code more concise as I can have a bunch of functions and
//    procedures that just take a "board" object as a parameter (and maybe
//    the cell that is being interacted with at the moment), as opposed to
//    having to send separately the list of cells, the current state,
//    the number of marks currently set in the map and so on.
// 2. It actually helps keep the state machine very simple.
//
// This is definitely not the best instance to showcase state machines, but
// I still appreciate how concise the machine looks, and how it allows me to
// remove any logic from the controller. Yes, the actual "state" is a bit
// all over the place, but I think it's
export const gameStateMachine = createMachine<
  GameStateMachineContext,
  GameStateMachineEvent,
  GameStateMachineState
>(
  {
    id: "gameStateMachine",
    initial: "idle",
    context: {
      triedMarkingTooManyCells: false,
    },
    states: {
      idle: {
        on: {
          START: {
            actions: ["initBoard"],
            target: "playing",
          },
        },
      },
      playing: {
        on: {
          CLEAR_NEIGHBORS: [
            {
              actions: ["clearNeighbors"],
              cond: ({ board }) => board?.status === "playing",
            },
          ],
          CLICK: [
            {
              actions: ["fillBoardAfterFirstClick"],
              cond: ({ board }) => board?.status === "waiting",
            },
            {
              actions: ["clickCell"],
              cond: ({ board }) => board?.status === "playing",
            },
          ],
          MARK: {
            actions: ["markCell"],
            cond: ({ board }) => board?.status === "playing",
          },
          START: {
            actions: ["initBoard"],
            cond: ({ board }) =>
              board?.status === "won" || board?.status === "lost",
          },
        },
      },
    },
  },
  {
    actions: {
      clearNeighbors: assign(({ board }, event) => {
        if (event.type !== "CLEAR_NEIGHBORS") {
          throw new Error("Trying to clear neighbors with wrong event type");
        }
        if (!board) {
          throw new Error("board not set when clearing neighbors");
        }
        clearNeighbors({ board, cell: event.cell });
        return { triedMarkingTooManyCells: false };
      }),

      clickCell: assign(({ board }, event) => {
        if (event.type !== "CLICK") {
          throw new Error("Trying to click cell with wrong event type");
        }
        if (!board) {
          throw new Error("board not set when clicking cell");
        }
        openCell({ board, cell: event.cell });
        return { triedMarkingTooManyCells: false };
      }),

      fillBoardAfterFirstClick: assign(({ board }, event) => {
        if (event.type !== "CLICK") {
          throw new Error("Trying to handle first click with wrong event type");
        }
        if (!board) {
          throw new Error("board not set when handling first click");
        }
        fillBoardAfterFirstClick({ board, cell: event.cell });
        return { triedMarkingTooManyCells: false };
      }),

      initBoard: assign((_, event) => {
        if (event.type !== "START") {
          throw new Error("Trying to init board with wrong event type");
        }
        return {
          board: generateEmptyBoard(event.difficulty),
          triedMarkingTooManyCells: false,
        };
      }),

      markCell: assign(({ board }, event) => {
        if (event.type !== "MARK") {
          throw new Error("Trying to mark cell with wrong event type");
        }
        if (!board) {
          throw new Error("board not set when marking cell");
        }
        const { triedMarkingTooManyCells } = toggleCellMark({
          board,
          cell: event.cell,
        });
        return { triedMarkingTooManyCells };
      }),
    },
  }
);
