import { GameBoard, GameCell } from "../common/types";

type BaseGameCellWithoutMineInfo = Omit<
  Omit<GameCell, "hasMine">,
  "numNeighborsWithMines"
>;

export interface OpenGameCellWithoutMineInfo
  extends BaseGameCellWithoutMineInfo {
  status: "open";
  numNeighborsWithMines: number;
}

interface NonOpenGameCellWithoutMineInfo extends BaseGameCellWithoutMineInfo {
  status: "closed" | "flagged" | "exploded";
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
  | SolverFlagBasedOnTotalNumberOfMines
  | { error: string; type: "error" };

export interface SolverFlagAroundSingleCellStep {
  around: GameCellWithoutMineInfo;
  cells: GameCellWithoutMineInfo[];
  reason: "singleCell";
  type: "flag";
}

export interface SolverFlagBasedOnTotalNumberOfMines {
  cells: GameCellWithoutMineInfo[];
  numberOfMines: number;
  reason: "numberOfMines";
  type: "flag";
}

export interface SolverClearNeighborsStep {
  around: GameCellWithoutMineInfo;
  cells: GameCellWithoutMineInfo[];
  type: "clearNeighbors";
}

export interface SolverFlagCellsAfterPartitionStep {
  cells: GameCellWithoutMineInfo[];
  commonRegion: GameCellWithoutMineInfo[];
  numMinesInCommonRegion: number;
  reason: "partition";
  restrictedCells: GameCellWithoutMineInfo[];
  restrictingCells: GameCellWithoutMineInfo[];
  type: "flag";
}

export interface SolverOpenCellsAfterPartitionStep {
  cells: GameCellWithoutMineInfo[];
  commonRegion: GameCellWithoutMineInfo[];
  numMinesInCommonRegion: number;
  restrictedCells: GameCellWithoutMineInfo[];
  restrictingCells: GameCellWithoutMineInfo[];
  type: "open";
}
