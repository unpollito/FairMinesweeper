import {
  GameBoardWithoutMineInfo as Board,
  OpenGameCellWithoutMineInfo,
  SolverClearNeighborsStep,
  SolverFlagAroundSingleCellStep,
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
  const possibleFlagSteps: SolverFlagAroundSingleCellStep[] = [];
  for (const cell of frontier) {
    const neighbors = getCellNeighbors({ board, cell });
    const closedNeighbors = neighbors.filter(
      (neighbor) => neighbor.status === "closed"
    );
    const flaggedNeighbors = neighbors.filter(
      (neighbor) => neighbor.status === "flagged"
    );
    if (
      closedNeighbors.length + flaggedNeighbors.length ===
      cell.numNeighborsWithMines
    ) {
      possibleFlagSteps.push({
        around: cell,
        cells: closedNeighbors,
        reason: "singleCell",
        type: "flag",
      });
    }
    if (
      flaggedNeighbors.length === cell.numNeighborsWithMines &&
      closedNeighbors.length
    ) {
      possibleClearSteps.push({
        around: cell,
        cells: closedNeighbors,
        type: "clearNeighbors",
      });
    }
  }

  // Favor clearing cells over flagging them, and also favor the steps that change
  // the most cells in one go to make progress quicker.
  if (possibleClearSteps.length > 0) {
    possibleClearSteps.sort((a, b) => b.cells.length - a.cells.length);
    return possibleClearSteps[0];
  }
  possibleFlagSteps.sort((a, b) => b.cells.length - a.cells.length);
  return possibleFlagSteps[0];
};
