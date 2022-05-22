import { GameBoard, GameCell } from "../common/types";

type BaseGameCellWithoutMineInfo = Omit<
  Omit<GameCell, "hasMine">,
  "numNeighborsWithMines"
>;

export interface OpenGameCellWithoutMineInfo
  extends BaseGameCellWithoutMineInfo {
  type: "open";
  numNeighborsWithMines: number;
}

interface NonOpenGameCellWithoutMineInfo extends BaseGameCellWithoutMineInfo {
  type: "closed" | "marked" | "exploded";
}

export type GameCellWithoutMineInfo =
  | OpenGameCellWithoutMineInfo
  | NonOpenGameCellWithoutMineInfo;

export interface GameBoardWithoutMineInfo extends Omit<GameBoard, "cells"> {
  cells: GameCellWithoutMineInfo[][];
}

export type RandomChoice = "corner" | "edge" | "middle";

export type SolverStep =
  | { cells: GameCellWithoutMineInfo[]; choice: RandomChoice; type: "random" }
  | SolverClearNeighborsStep
  | SolverMarkAroundSingleCellStep
  | SolverOpenCellsAfterPartitionStep
  | SolverMarkCellsAfterPartitionStep
  | { message: string; type: "error" };

export interface SolverMarkAroundSingleCellStep {
  around: GameCellWithoutMineInfo;
  cells: GameCellWithoutMineInfo[];
  isPartition: false;
  type: "mark";
}

export interface SolverClearNeighborsStep {
  around: GameCellWithoutMineInfo;
  cells: GameCellWithoutMineInfo[];
  isPartition: false;
  type: "clearNeighbors";
}

export interface SolverMarkCellsAfterPartitionStep {
  cells: GameCellWithoutMineInfo[];
  commonRegion: GameCellWithoutMineInfo[];
  isPartition: true;
  restrictedCell: GameCellWithoutMineInfo;
  restrictingCell: GameCellWithoutMineInfo;
  type: "mark";
}

export interface SolverOpenCellsAfterPartitionStep {
  cells: GameCellWithoutMineInfo[];
  commonRegion: GameCellWithoutMineInfo[];
  isPartition: true;
  restrictedCell: GameCellWithoutMineInfo;
  restrictingCell: GameCellWithoutMineInfo;
  type: "open";
}
