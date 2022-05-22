import {
  GameBoardWithoutMineInfo as Board,
  GameCellWithoutMineInfo as Cell,
  OpenGameCellWithoutMineInfo as OpenCell,
  SolverFlagCellsAfterPartitionStep,
  SolverOpenCellsAfterPartitionStep,
} from "./solver_types";
import { getCellNeighbors } from "../common/cell_neighbor_functions";
// Partitioning is what I call the process of looking at the restrictions imposed by each cell,
// figuring out how these affect other cells and splitting (partitioning) the restrictions into
// separate sets. Ideally we arrive to cell sets where we know that there cannot be any mine
// (which we can then open) or where all cells contain mines (which we can flag).
//
// Example (numbers mean open cells with that number of mined neighbors, ? means closed cells):
//
//   111
//   ???
//
// In the above example, the top left cell introduces the restriction that there must be exactly
// 1 mine in the bottom left and bottom middle cells. The top middle cell has a restriction that
// there is exactly 1 mine in the bottom left, bottom middle and bottom right cells. So we can
// split this restriction into two parts: one for the bottom left and the bottom middle, and
// another for the bottom right. Since we already had a restriction from the left cell that
// there was a mine in the bottom left or bottom middle, the remaining cell (bottom right) cannot
// have a mine, thus we can open it.
//
// Another example:
//
//   121
//   ???
//
// In this example, again, top left introduces the restriction that there can be only 1 mine in
// the bottom left and bottom middle. Top middle introduces the restriction that there are 2 mines
// between bottom left, bottom middle and middle right. So we can split this into two restrictions:
// 1 mine in bottom left and bottom middle (from the top left restriction), and the remaining mine
// must be in the bottom right. So we can flag bottom right as having a mine.
interface CellRestrictionPartition {
  affectedCells: Cell[];
  numMines: number;
  originCell: OpenCell;
}

export const trySolvingSomePartition = ({
  board,
  frontier,
}: {
  board: Board;
  frontier: OpenCell[];
}):
  | SolverOpenCellsAfterPartitionStep
  | SolverFlagCellsAfterPartitionStep
  | undefined => {
  const partitionMap: Record<
    number,
    Record<number, CellRestrictionPartition>
  > = {};

  // First build the original partition for each cell, e.g., all the neighboring closed cells.
  frontier.forEach((cell) => {
    const neighbors = getCellNeighbors({ board, cell });
    const flaggedNeighbors = neighbors.filter(
      (neighbor) => neighbor.status === "flagged"
    );
    const restrictableCells = neighbors.filter(
      (neighbor) => neighbor.status === "closed"
    );
    const numMinesInRestrictableNeighbors =
      cell.numNeighborsWithMines - flaggedNeighbors.length;
    if (!partitionMap[cell.rowIndex]) {
      partitionMap[cell.rowIndex] = {};
    }
    partitionMap[cell.rowIndex][cell.columnIndex] = {
      affectedCells: restrictableCells,
      numMines: numMinesInRestrictableNeighbors,
      originCell: cell,
    };
  });

  // Then compare each cell against its neighbors to see which restrictions we can get.
  for (const cell of frontier) {
    const cellPartition = partitionMap[cell.rowIndex][cell.columnIndex];
    const neighbors = getCellNeighbors({ board, cell });
    for (const neighbor of neighbors) {
      const neighborPartition =
        partitionMap[neighbor.rowIndex]?.[neighbor.columnIndex];
      // Prevent comparing the partitions of (B,A) and (A,B); only check each pair once.
      const neighborComesAfterCell =
        neighbor.rowIndex > cell.rowIndex ||
        (neighbor.rowIndex === cell.rowIndex &&
          neighbor.columnIndex > cell.columnIndex);
      if (!!neighborPartition && neighborComesAfterCell) {
        const intersectionCells = cellPartition.affectedCells.filter((cell) =>
          neighborPartition.affectedCells.includes(cell)
        );
        if (intersectionCells.length > 0) {
          const cellMinusNeighborCells = cellPartition.affectedCells.filter(
            (cell) => !neighborPartition.affectedCells.includes(cell)
          );
          const neighborMinusCellCells = neighborPartition.affectedCells.filter(
            (cell) => !cellPartition.affectedCells.includes(cell)
          );
          const minMinesInIntersection = Math.max(
            neighborPartition.numMines - neighborMinusCellCells.length,
            cellPartition.numMines - cellMinusNeighborCells.length
          );
          const maxMinesInIntersection = Math.min(
            (neighbor as OpenCell).numNeighborsWithMines,
            cell.numNeighborsWithMines,
            intersectionCells.length
          );
          if (minMinesInIntersection === maxMinesInIntersection) {
            if (cellMinusNeighborCells.length > 0) {
              const numMinesInCellMinusNeighborPartition =
                cellPartition.numMines - minMinesInIntersection;
              if (
                numMinesInCellMinusNeighborPartition ===
                  cellMinusNeighborCells.length ||
                numMinesInCellMinusNeighborPartition === 0
              ) {
                return {
                  cells: cellMinusNeighborCells,
                  commonRegion: intersectionCells,
                  isPartition: true,
                  restrictedCell: cell,
                  restrictingCell: neighbor,
                  type:
                    numMinesInCellMinusNeighborPartition === 0
                      ? "open"
                      : "flag",
                };
              }
            }

            if (neighborMinusCellCells.length > 0) {
              const numMinesInNeighborMinusCellPartition =
                neighborPartition.numMines - minMinesInIntersection;
              if (
                numMinesInNeighborMinusCellPartition ===
                  neighborMinusCellCells.length ||
                numMinesInNeighborMinusCellPartition === 0
              ) {
                return {
                  cells: neighborMinusCellCells,
                  commonRegion: intersectionCells,
                  isPartition: true,
                  restrictedCell: neighbor,
                  restrictingCell: cell,
                  type:
                    numMinesInNeighborMinusCellPartition === 0
                      ? "open"
                      : "flag",
                };
              }
            }
          }
        }
      }
    }
  }
  return undefined;
};
