import { GameBoard, GameDifficulty } from "../common/types";
import { GAME_MODES } from "./game_setup_constants";

export const generateEmptyBoard = (difficulty: GameDifficulty): GameBoard => ({
  cells: [...Array(GAME_MODES[difficulty].height).keys()].map((_, row) =>
    [...Array(GAME_MODES[difficulty].width).keys()].map((_, column) => ({
      rowIndex: row,
      columnIndex: column,
      hasMine: false,
      numNeighborsWithMines: 0,
      status: "closed",
    }))
  ),
  numMinesLeft: GAME_MODES[difficulty].numMines,
  status: "waiting",
});
