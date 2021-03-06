import { GameCellWithoutMineInfo } from "../solver/solver_types";

export const cloneCells = <T extends GameCellWithoutMineInfo>(
  cells: T[][]
): T[][] => cells.map((row) => row.map((cell) => ({ ...cell })));

// Cloning cells around (5,5) with a radius 1 in a 10x10 board will just
// create a deep copy of the (4,4) x (6,6) area and a shallow copy for everything
// else. This is useful when we have operations that only affect a limited area,
// such as (for instance) flagging a cell, which has radius 0.
export const cloneCellsAround = <T extends GameCellWithoutMineInfo>({
  around,
  cells,
  radius,
}: {
  around: Pick<T, "rowIndex" | "columnIndex">;
  cells: T[][];
  radius: number;
}): T[][] =>
  cells.map((row, rowIndex) => {
    if (
      rowIndex < around.rowIndex - radius ||
      rowIndex > around.rowIndex + radius
    ) {
      return row;
    } else {
      return row.map((cell, colIndex) => {
        if (
          colIndex < around.columnIndex - radius ||
          colIndex > around.columnIndex + radius
        ) {
          return cell;
        } else {
          return { ...cell };
        }
      });
    }
  });
