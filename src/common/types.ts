export interface GameProps {
  width: number;
  height: number;
  numMines: number;
}

export type GameDifficulty = "easy" | "medium" | "hard";

export type GameCellStatus = "closed" | "flagged" | "open" | "exploded";

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
  numFlagsLeft: number;
  numOpenedCells: number;
  numTotalMines: number;
}

export interface BoardAndCellAndStatus {
  board: GameBoard;
  cell: GameCell;
  status: GameStatus;
}

export type BoardAndStatus = Pick<BoardAndCellAndStatus, "board" | "status">;
