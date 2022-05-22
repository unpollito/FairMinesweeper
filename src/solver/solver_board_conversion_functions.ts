import { GameBoard } from "../common/types";
import {
  GameBoardWithoutMineInfo,
  GameCellWithoutMineInfo,
  OpenGameCellWithoutMineInfo,
} from "./solver_types";

export const boardToBoardWithoutMineInfo = (
  board: GameBoard
): GameBoardWithoutMineInfo => ({
  ...board,
  cells: board.cells.map((row) =>
    row.map((cell) => {
      const { numNeighborsWithMines, hasMine, ...result } = cell;
      if (result.status === "open") {
        (result as OpenGameCellWithoutMineInfo).numNeighborsWithMines;
      }
      return result as GameCellWithoutMineInfo;
    })
  ),
});
