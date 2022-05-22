import { assign, AssignAction, createMachine, DoneInvokeEvent } from "xstate";
import {
  GameStateMachineContext,
  GameStateMachineEvent,
  GameStateMachineState,
} from "./game_state_machine_types";
import { handleFirstClick } from "../game_setup/game_start_functions";
import { openCell } from "../game_rules/open_single_cell_functions";
import { BoardAndStatus } from "../common/types";
import { toggleCellFlag } from "../game_rules/flag_cell_functions";
import { clearNeighbors } from "../game_rules/open_neighbors_functions";
import { generateEmptyBoard } from "../game_setup/board_generation_functions";
import { boardToBoardWithoutMineInfo } from "../solver/solver_board_conversion_functions";

export const assignBoardAfterChange: AssignAction<
  GameStateMachineContext,
  DoneInvokeEvent<BoardAndStatus>
> = assign((_, event) => ({
  triedFlaggingTooManyCells: false,
  ...event.data.board,
}));

export const gameStateMachine = createMachine<
  GameStateMachineContext,
  GameStateMachineEvent,
  GameStateMachineState
>(
  {
    id: "gameStateMachine",
    initial: "idle",
    context: {
      ...generateEmptyBoard("easy"),
      isShowingHint: false,
      triedFlaggingTooManyCells: false,
    },
    states: {
      idle: {
        on: {
          SET_SOLVER_WORKER: {
            actions: ["setSolverWorker"],
          },
          START: {
            target: "beforeFirstClick",
          },
        },
      },
      beforeFirstClick: {
        entry: [
          "initBoard",
          "setStartTime",
          "unsetEndTime",
          "disableIsShowingHint",
          "requestHint",
        ],
        on: {
          CLICK: {
            target: "handlingFirstClick",
          },
          SET_HINT: { actions: ["setHint"] },
          SHOW_HINT: { actions: ["enableIsShowingHint"] },
        },
      },
      handlingFirstClick: {
        invoke: {
          src: "handleFirstClick",
          onDone: {
            actions: [assignBoardAfterChange],
            target: "playing",
          },
        },
      },
      playing: {
        entry: ["disableIsShowingHint", "requestHint"],
        on: {
          CLEAR_NEIGHBORS: {
            actions: ["disableIsShowingHint"],
            target: "handlingChange",
          },
          CLICK: {
            actions: ["disableIsShowingHint"],
            target: "handlingChange",
          },
          FLAG: {
            actions: ["flagCell", "disableIsShowingHint", "requestHint"],
          },
          SET_HINT: { actions: ["setHint"] },
          SHOW_HINT: { actions: ["enableIsShowingHint"] },
        },
      },
      handlingChange: {
        invoke: {
          src: "handleChange",
          onDone: [
            {
              actions: [assignBoardAfterChange],
              cond: (_, event) => event.data.status === "playing",
              target: "playing",
            },
            {
              actions: [assignBoardAfterChange],
              cond: (_, event) => event.data.status === "won",
              target: "won",
            },
            {
              actions: [assignBoardAfterChange],
              cond: (_, event) => event.data.status === "lost",
              target: "lost",
            },
          ],
        },
      },
      won: {
        entry: ["setEndTime"],
        on: {
          START: {
            target: "beforeFirstClick",
          },
        },
      },
      lost: {
        entry: ["setEndTime"],
        on: {
          START: {
            target: "beforeFirstClick",
          },
        },
      },
    },
  },
  {
    actions: {
      // Need to put up with this or else I get compilation errors because XState's types
      // are brittle.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      disableIsShowingHint: assign((_) => ({ isShowingHint: false })),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      enableIsShowingHint: assign((_) => ({ isShowingHint: true })),
      flagCell: assign((context, event) => {
        if (event.type !== "FLAG") {
          throw new Error("tried to flagCell with wrong event type");
        }
        const result = toggleCellFlag({ board: context, cell: event.cell });
        return {
          ...result.board,
          triedFlaggingTooManyCells: result.triedFlaggingTooManyCells,
        };
      }),
      initBoard: assign((context, event) => {
        if (event.type !== "START") {
          throw new Error("tried to initBoard with wrong event type");
        }
        return {
          ...generateEmptyBoard(event.difficulty),
          triedFlaggingTooManyCells: false,
        };
      }),
      requestHint: (context) => {
        context.solverWorker?.postMessage(
          boardToBoardWithoutMineInfo({
            cells: context.cells,
            numFlagsLeft: context.numFlagsLeft,
            numOpenedCells: context.numOpenedCells,
            numTotalMines: context.numTotalMines,
          })
        );
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setEndTime: assign((_) => ({ endTime: Date.now() })),
      setHint: assign((context, event) => {
        if (event.type !== "SET_HINT") {
          throw new Error("tried to setHint with wrong event type");
        }
        return { hint: event.hint };
      }),
      setSolverWorker: assign((_, event) => {
        if (event.type !== "SET_SOLVER_WORKER") {
          throw new Error("tried to setSolverWorker with wrong event type");
        }
        return { solverWorker: event.solverWorker };
      }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setStartTime: assign((_) => ({ startTime: Date.now() })),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      unsetEndTime: assign((_) => ({ endTime: undefined })),
    },
    services: {
      handleChange: (context, event) => {
        if (event.type === "CLEAR_NEIGHBORS") {
          return Promise.resolve(
            clearNeighbors({
              board: context,
              cell: event.cell,
              status: "playing",
            })
          );
        } else if (event.type === "CLICK") {
          return Promise.resolve(
            openCell({ board: context, cell: event.cell, status: "playing" })
          );
        } else {
          throw new Error("invoked handleChange with wrong event type");
        }
      },
      handleFirstClick: (context, event) => {
        if (event.type !== "CLICK") {
          throw new Error("invoked handleFirstClick with wrong event type");
        }
        return Promise.resolve(
          handleFirstClick({ board: context, cell: event.cell })
        );
      },
    },
  }
);
