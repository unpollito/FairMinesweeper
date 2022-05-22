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
      // INTENDED: this is a convenient way to leave these out.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { numNeighborsWithMines, hasMine, ...result } = cell;
      if (result.status === "open") {
        (result as OpenGameCellWithoutMineInfo).numNeighborsWithMines =
          cell.numNeighborsWithMines;
      }
      return result as GameCellWithoutMineInfo;
    })
  ),
});
