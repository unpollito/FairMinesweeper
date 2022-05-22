import { GameBoard, GameCell, GameDifficulty } from "../common/types";
import { SolverStep } from "../solver/solver_types";

export interface GameStateMachineContext extends Omit<GameBoard, "status"> {
  endTime?: number;
  hint?: SolverStep;
  isShowingHint: boolean;
  solverWorker?: Worker;
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
  | { solverWorker: Worker; type: "SET_SOLVER_WORKER" }
  | { hint: SolverStep; type: "SET_HINT" }
  | { type: "SHOW_HINT" };
