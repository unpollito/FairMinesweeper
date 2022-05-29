import { assign, AssignAction, createMachine, DoneInvokeEvent } from "xstate";
import {
  GameStateMachineContext,
  GameStateMachineEvent,
  GameStateMachineState,
} from "./game_state_machine_types";
import { handleFirstClick } from "../game_setup/game_start_functions";
import { BoardAndStatus } from "../common/types";
import { toggleCellFlag } from "../game_rules/flag_cell_functions";
import { clearNeighbors } from "../game_rules/open_neighbors_functions";
import { generateEmptyBoard } from "../game_setup/board_generation_functions";
import { processStep } from "../solver/solver_logic_functions";
import { boardToBoardWithoutMineInfo } from "../solver/solver_board_conversion_functions";
import { lenientOpenCell } from "../game_rules/lenient_open_cell_functions";

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
      triedFlaggingTooManyCells: false,
    },
    states: {
      idle: {
        on: {
          START: {
            target: "beforeFirstClick",
          },
        },
      },
      beforeFirstClick: {
        entry: ["initBoard", "setStartTime", "unsetEndTime", "unsetHint"],
        on: {
          CLICK: {
            target: "handlingFirstClick",
          },
          SHOW_HINT: { actions: ["setHint"] },
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
        entry: ["unsetHint"],
        on: {
          CLEAR_NEIGHBORS: {
            actions: ["unsetHint"],
            target: "handlingChange",
          },
          CLICK: {
            actions: ["unsetHint"],
            target: "handlingChange",
          },
          FLAG: {
            actions: ["flagCell", "unsetHint"],
          },
          SHOW_HINT: { actions: ["setHint"] },
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
      // Need to put up with this or else I get compilation errors because XState's types
      // are brittle.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setEndTime: assign((_) => ({ endTime: Date.now() })),
      setHint: assign((context) => ({
        hint: processStep(boardToBoardWithoutMineInfo(context)),
      })),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setStartTime: assign((_) => ({ startTime: Date.now() })),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      unsetEndTime: assign((_) => ({ endTime: undefined })),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      unsetHint: assign((_) => ({ hint: undefined })),
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
            lenientOpenCell({
              board: context,
              cell: event.cell,
              status: "playing",
            })
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
