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
// 1 mine in the bottom left and bottom center cells. The top center cell has a restriction that
// there is exactly 1 mine in the bottom left, bottom center and bottom right cells. So we can
// split this restriction into two parts: one for the bottom left and the bottom center, and
// another for the bottom right. Since we already had a restriction from the left cell that
// there was a mine in the bottom left or bottom center, the remaining cell (bottom right) cannot
// have a mine, thus we can open it.
//
// Another example:
//
//   121
//   ???
//
// In this example, again, top left introduces the restriction that there can be only 1 mine in
// the bottom left and bottom center. Top center introduces the restriction that there are 2 mines
// between bottom left, bottom center and center right. So we can split this into two restrictions:
// 1 mine in bottom left and bottom center (from the top left restriction), and the remaining mine
// must be in the bottom right. So we can flag bottom right as having a mine.
//
// One more example with two restrictions:
//
// ???
// 12?
// 01?
//
// In this example, middle left introduces the restriction that there can only be 1 mine in the
// top right or top center columns, which means that for the other 3 neighbors of middle center
// (that is, the right column), there can only be 1 mine. But then you look at the restriction
// introduced by bottom center, which says that there can only be 1 mine in middle right or
// bottom right. Thus top right cannot contain a mine.
interface CellRestrictionPartition {
  affectedCells: Cell[];
  numMines: number;
  originCells: OpenCell[];
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
  // First build the original partition for each cell, e.g., all the neighboring closed cells.
  const partitions: CellRestrictionPartition[] = frontier.map((cell) => {
    const neighbors = getCellNeighbors({ board, cell });
    const flaggedNeighbors = neighbors.filter(
      (neighbor) => neighbor.status === "flagged"
    );
    const restrictableCells = neighbors.filter(
      (neighbor) => neighbor.status === "closed"
    );
    const numMinesInRestrictableNeighbors =
      cell.numNeighborsWithMines - flaggedNeighbors.length;
    return {
      affectedCells: restrictableCells,
      numMines: numMinesInRestrictableNeighbors,
      originCells: [cell],
    };
  });

  return performRecursivePartitionCheck(partitions);
};

const performRecursivePartitionCheck = (
  partitions: CellRestrictionPartition[],
  alreadyCheckedPartitions: Map<
    CellRestrictionPartition,
    Set<CellRestrictionPartition>
  > = new Map()
):
  | SolverOpenCellsAfterPartitionStep
  | SolverFlagCellsAfterPartitionStep
  | undefined => {
  for (const [partitionAIndex, partitionA] of partitions.entries()) {
    for (const [partitionBPartialIndex, partitionB] of partitions
      .slice(partitionAIndex + 1)
      .entries()) {
      const wasThisPairChecked = alreadyCheckedPartitions
        .get(partitionA)
        ?.has(partitionB);
      if (!wasThisPairChecked) {
        markPairAsChecked({ alreadyCheckedPartitions, partitionA, partitionB });

        const partitionBIndex = partitionAIndex + 1 + partitionBPartialIndex;
        const intersectionCells = partitionA.affectedCells.filter((cell) =>
          partitionB.affectedCells.includes(cell)
        );
        if (intersectionCells.length > 0) {
          const aMinusBCells = partitionA.affectedCells.filter(
            (cell) => !intersectionCells.includes(cell)
          );
          const bMinusACells = partitionB.affectedCells.filter(
            (cell) => !intersectionCells.includes(cell)
          );
          const maxBoundsForCellsInPartitionA = partitionA.originCells.map(
            (originCell) =>
              originCell.numNeighborsWithMines -
              partitions
                .filter(
                  (partition) =>
                    partition.originCells.includes(originCell) &&
                    partition !== partitionA
                )
                .map((partition) => partition.numMines)
                .reduce((a, b) => a + b, 0)
          );
          const maxBoundsForCellsInPartitionB = partitionB.originCells.map(
            (originCell) =>
              originCell.numNeighborsWithMines -
              partitions
                .filter(
                  (partition) =>
                    partition.originCells.includes(originCell) &&
                    partition !== partitionB
                )
                .map((partition) => partition.numMines)
                .reduce((a, b) => a + b, 0)
          );
          const minMinesInIntersection = Math.max(
            partitionA.numMines - aMinusBCells.length,
            partitionB.numMines - bMinusACells.length
          );
          const maxMinesInIntersection = Math.min.apply(this, [
            intersectionCells.length,
            ...maxBoundsForCellsInPartitionA,
            ...maxBoundsForCellsInPartitionB,
          ]);

          if (minMinesInIntersection === maxMinesInIntersection) {
            const numMinesInIntersection = minMinesInIntersection;
            const numMinesInAMinusBPartition =
              partitionA.numMines - minMinesInIntersection;
            const numMinesInBMinusAPartition =
              partitionB.numMines - minMinesInIntersection;

            if (aMinusBCells.length > 0) {
              if (
                numMinesInAMinusBPartition === aMinusBCells.length ||
                numMinesInAMinusBPartition === 0
              ) {
                const base = {
                  cells: aMinusBCells,
                  commonRegion: intersectionCells,
                  restrictedCells: partitionA.originCells,
                  restrictingCells: partitionB.originCells,
                };
                return numMinesInAMinusBPartition === 0
                  ? {
                      ...base,
                      numMinesInCommonRegion: numMinesInIntersection,
                      type: "open",
                    }
                  : {
                      ...base,
                      reason: "partition",
                      type: "flag",
                    };
              }
            }
            if (bMinusACells.length > 0) {
              if (
                numMinesInBMinusAPartition === bMinusACells.length ||
                numMinesInBMinusAPartition === 0
              ) {
                const base = {
                  cells: bMinusACells,
                  commonRegion: intersectionCells,
                  restrictedCells: partitionB.originCells,
                  restrictingCells: partitionA.originCells,
                };
                return numMinesInBMinusAPartition === 0
                  ? {
                      ...base,
                      numMinesInCommonRegion: numMinesInIntersection,
                      type: "open",
                    }
                  : {
                      ...base,
                      reason: "partition",
                      type: "flag",
                    };
              }
            }

            let newPartitions = partitions.slice();
            newPartitions.splice(partitionBIndex, 1);
            newPartitions.splice(partitionAIndex, 1);
            const intersectionOriginCells = [
              ...partitionA.originCells,
              ...partitionB.originCells,
            ];
            intersectionOriginCells.filter(
              (cell, cellIndex) =>
                !intersectionOriginCells.slice(cellIndex + 1).includes(cell)
            );
            newPartitions = [
              {
                affectedCells: intersectionCells,
                numMines: numMinesInIntersection,
                originCells: intersectionOriginCells,
              },
              {
                affectedCells: aMinusBCells,
                numMines: numMinesInAMinusBPartition,
                originCells: partitionA.originCells,
              },
              {
                affectedCells: bMinusACells,
                numMines: numMinesInBMinusAPartition,
                originCells: partitionB.originCells,
              },
              ...newPartitions,
            ];
            return performRecursivePartitionCheck(
              newPartitions,
              alreadyCheckedPartitions
            );
          }
        }
      }
    }
  }
};

const markPairAsChecked = ({
  alreadyCheckedPartitions,
  partitionA,
  partitionB,
}: {
  alreadyCheckedPartitions: Map<
    CellRestrictionPartition,
    Set<CellRestrictionPartition>
  >;
  partitionA: CellRestrictionPartition;
  partitionB: CellRestrictionPartition;
}): void => {
  let aSet = alreadyCheckedPartitions.get(partitionA);
  if (!aSet) {
    aSet = new Set<CellRestrictionPartition>();
    alreadyCheckedPartitions.set(partitionA, aSet);
  }
  aSet.add(partitionB);

  let bSet = alreadyCheckedPartitions.get(partitionB);
  if (!bSet) {
    bSet = new Set<CellRestrictionPartition>();
    alreadyCheckedPartitions.set(partitionB, bSet);
  }
  bSet.add(partitionA);
};
