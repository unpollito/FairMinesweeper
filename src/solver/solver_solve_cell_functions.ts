import {
  GameBoardWithoutMineInfo as Board,
  OpenGameCellWithoutMineInfo,
  SolverClearNeighborsStep,
  SolverMarkAroundSingleCellStep,
  SolverStep,
} from "./solver_types";
import { getCellNeighbors } from "../common/cell_neighbor_functions";

export const trySolvingSomeCell = ({
  board,
  frontier,
}: {
  board: Board;
  frontier: OpenGameCellWithoutMineInfo[];
}): SolverStep | undefined => {
  const possibleClearSteps: SolverClearNeighborsStep[] = [];
  const possibleMarkSteps: SolverMarkAroundSingleCellStep[] = [];
  for (const cell of frontier) {
    const neighbors = getCellNeighbors({ board, cell });
    const closedNeighbors = neighbors.filter(
      (neighbor) => neighbor.status === "closed"
    );
    const markedNeighbors = neighbors.filter(
      (neighbor) => neighbor.status === "marked"
    );
    if (
      closedNeighbors.length + markedNeighbors.length ===
      cell.numNeighborsWithMines
    ) {
      possibleMarkSteps.push({
        around: cell,
        cells: closedNeighbors,
        isPartition: false,
        type: "mark",
      });
    }
    if (
      markedNeighbors.length === cell.numNeighborsWithMines &&
      closedNeighbors.length
    ) {
      possibleClearSteps.push({
        around: cell,
        cells: closedNeighbors,
        isPartition: false,
        type: "clearNeighbors",
      });
    }
  }

  // Favor clearing cells over marking them, and also favor the steps that change
  // the most cells in one go to make progress quicker.
  if (possibleClearSteps.length > 0) {
    possibleClearSteps.sort((a, b) => b.cells.length - a.cells.length);
    return possibleClearSteps[0];
  }
  possibleMarkSteps.sort((a, b) => b.cells.length - a.cells.length);
  return possibleMarkSteps[0];
};
