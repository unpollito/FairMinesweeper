export interface GameProps {
  width: number;
  height: number;
  numMines: number;
}

export type GameDifficulty = "easy" | "medium" | "hard";

export type GameCellStatus = "closed" | "marked" | "open" | "exploded";

export interface GameCell {
  rowIndex: number;
  columnIndex: number;
  hasMine: boolean;
  numNeighborsWithMines: number;
  status: GameCellStatus;
}

export type GameStatus = "waiting" | "playing" | "won" | "lost";

export interface GameBoard {
  cells: GameCell[][];
  numMinesLeft: number;
  status: GameStatus;
}

export interface BoardAndPosition {
  board: GameBoard;
  columnIndex: number;
  rowIndex: number;
}
