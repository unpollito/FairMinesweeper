import { assign, AssignAction, createMachine, DoneInvokeEvent } from "xstate";
import {
  GameStateMachineContext,
  GameStateMachineEvent,
  GameStateMachineState,
} from "./game_state_machine_types";
import { handleFirstClick } from "../game_setup/game_start_functions";
import { openCell } from "../game_rules/open_single_cell_functions";
import { BoardAndStatus } from "../common/types";
import { toggleCellMark } from "../game_rules/mark_cell_functions";
import { clearNeighbors } from "../game_rules/open_neighbors_functions";
import { generateEmptyBoard } from "../game_setup/board_generation_functions";

export const assignBoardAfterChange: AssignAction<
  GameStateMachineContext,
  DoneInvokeEvent<BoardAndStatus>
> = assign((_, event) => ({
  triedMarkingTooManyCells: false,
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
      triedMarkingTooManyCells: false,
    },
    states: {
      idle: {
        on: {
          START: {
            actions: ["initBoard"],
            target: "beforeFirstClick",
          },
        },
      },
      beforeFirstClick: {
        on: {
          CLICK: {
            target: "handlingFirstClick",
          },
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
        on: {
          CLEAR_NEIGHBORS: { target: "handlingChange" },
          CLICK: { target: "handlingChange" },
          MARK: { actions: ["markCell"] },
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
        on: {
          START: {
            actions: ["initBoard"],
            target: "beforeFirstClick",
          },
        },
      },
      lost: {
        on: {
          START: {
            actions: ["initBoard"],
            target: "beforeFirstClick",
          },
        },
      },
    },
  },
  {
    actions: {
      initBoard: assign((context, event) => {
        if (event.type !== "START") {
          throw new Error("tried to initBoard with wrong event type");
        }
        return {
          ...generateEmptyBoard(event.difficulty),
          triedMarkingTooManyCells: false,
        };
      }),
      markCell: assign((context, event) => {
        if (event.type !== "MARK") {
          throw new Error("tried to initBoard with wrong event type");
        }
        const result = toggleCellMark({ board: context, cell: event.cell });
        return {
          triedMarkingTooManyCells: result.triedMarkingTooManyCells,
          ...result.board,
        };
      }),
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
