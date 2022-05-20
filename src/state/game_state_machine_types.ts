import { GameBoard, GameCell, GameDifficulty } from "../common/types";

export interface GameStateMachineContext extends Omit<GameBoard, "status"> {
  triedMarkingTooManyCells: boolean;
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
  | { cell: GameCell; type: "MARK" }
  | { cell: GameCell; type: "CLICK" }
  | { cell: GameCell; type: "CLEAR_NEIGHBORS" };
