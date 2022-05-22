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
  type: "closed" | "flagged" | "exploded";
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
  | SolverFlagAroundSingleCellStep
  | SolverOpenCellsAfterPartitionStep
  | SolverFlagCellsAfterPartitionStep
  | { message: string; type: "error" };

export interface SolverFlagAroundSingleCellStep {
  around: GameCellWithoutMineInfo;
  cells: GameCellWithoutMineInfo[];
  isPartition: false;
  type: "flag";
}

export interface SolverClearNeighborsStep {
  around: GameCellWithoutMineInfo;
  cells: GameCellWithoutMineInfo[];
  isPartition: false;
  type: "clearNeighbors";
}

export interface SolverFlagCellsAfterPartitionStep {
  cells: GameCellWithoutMineInfo[];
  commonRegion: GameCellWithoutMineInfo[];
  isPartition: true;
  restrictedCell: GameCellWithoutMineInfo;
  restrictingCell: GameCellWithoutMineInfo;
  type: "flag";
}

export interface SolverOpenCellsAfterPartitionStep {
  cells: GameCellWithoutMineInfo[];
  commonRegion: GameCellWithoutMineInfo[];
  isPartition: true;
  restrictedCell: GameCellWithoutMineInfo;
  restrictingCell: GameCellWithoutMineInfo;
  type: "open";
}
