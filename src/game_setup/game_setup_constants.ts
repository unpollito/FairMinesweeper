import { GameDifficulty, GameProps } from "../common/types";

export const GAME_MODES: Record<GameDifficulty, GameProps> = {
  easy: { width: 9, height: 9, numMines: 10 },
  medium: { width: 16, height: 16, numMines: 40 },
  hard: { width: 30, height: 16, numMines: 99 },
};
