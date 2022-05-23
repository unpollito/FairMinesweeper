import { GameBoard, GameCell, GameDifficulty } from "../common/types";
import { SolverStep } from "../solver/solver_types";

export interface GameStateMachineContext extends Omit<GameBoard, "status"> {
  endTime?: number;
  hint?: SolverStep;
  startTime?: number;
  triedFlaggingTooManyCells: boolean;
}

export interface GameStateMachineState {
  context: GameStateMachineContext;
  value:
    | "idle"
    | "beforeFirstClick"
    | "handlingFirstClick"
    | "playing"
    | "handlingChange"
    | "won"
    | "lost";
}

export type GameStateMachineEvent =
  | {
      difficulty: GameDifficulty;
      type: "START";
    }
  | { cell: GameCell; type: "FLAG" }
  | { cell: GameCell; type: "CLICK" }
  | { cell: GameCell; type: "CLEAR_NEIGHBORS" }
  | { type: "SHOW_HINT" };
