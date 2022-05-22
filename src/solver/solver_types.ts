import { GameBoard, GameCell } from "../common/types";

export type GameCellWithoutMineInfo = Omit<GameCell, "hasMine">;

export interface GameBoardWithoutMineInfo extends Omit<GameBoard, "cells"> {
  cells: GameCellWithoutMineInfo[][];
}

export type RandomChoice = "corner" | "edge" | "middle";

export type SolverStep =
  | { cells: GameCellWithoutMineInfo[]; choice: RandomChoice; type: "random" }
  | { cell: GameCellWithoutMineInfo; type: "open" }
  | SolverClearNeighborsStep
  | SolverMarkAroundSingleCellStep
  | { message: string; type: "error" };

export type SolverMarkAroundSingleCellStep = {
  around: GameCellWithoutMineInfo;
  cells: GameCellWithoutMineInfo[];
  type: "mark";
};
export type SolverClearNeighborsStep = {
  around: GameCellWithoutMineInfo;
  cells: GameCellWithoutMineInfo[];
  type: "clearNeighbors";
};
