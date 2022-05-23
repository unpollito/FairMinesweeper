import { GameCellWithoutMineInfo, SolverStep } from "./solver_types";

export const getHintText = (hint: SolverStep): string => {
  if (hint.type === "clearNeighbors") {
    return (
      "The highlighted cell cannot have any more mines around it, " +
      "so it's safe to clear all its unflagged neighbors."
    );
  } else if (hint.type === "flag") {
    if (hint.reason === "partition") {
      return (
        `Cell ${cellToString(hint.restrictingCell)} ensures that there are ${
          hint.cells.length
        } ` +
        `mine(s) in {${hint.commonRegion.map(cellToString).join(", ")}}, so ` +
        `there must be mines in {${hint.cells.map(cellToString).join(", ")}}.`
      );
    } else if (hint.reason === "numberOfMines") {
      return (
        `Since there are ${hint.numberOfMines} mines left, there must be ` +
        `mines in {${hint.cells.map(cellToString).join(", ")}}.`
      );
    } else {
      return "All of the remaining neighbors of the highlighted cell must contain a mine.";
    }
  } else if (hint.type === "open") {
    return `Cell ${cellToString(hint.restrictingCell)} ensures that there are ${
      hint.cells.length
    } mine(s) in {${hint.commonRegion
      .map(cellToString)
      .join(", ")}}, so there cannot be any mines in {${hint.cells
      .map(cellToString)
      .join(", ")}}.`;
  } else if (hint.type === "random") {
    if (hint.choice === "corner") {
      return (
        "Let's go with a random pick - corner cells have the highest chance " +
        "of giving you an island."
      );
    } else if (hint.choice === "edge") {
      return (
        "Let's go with a random pick - cells on the edge have a decent chance " +
        "of giving you an island."
      );
    } else {
      return "Let's go with a random pick.";
    }
  } else {
    return "Sorry, could not get a hint. :-(";
  }
};

const cellToString = (cell: GameCellWithoutMineInfo): string =>
  `[${cell.rowIndex + 1}, ${cell.columnIndex + 1}]`;

export const getCellsToHighlight = (
  hint: SolverStep
): GameCellWithoutMineInfo[] => {
  if (hint.type === "clearNeighbors") {
    return [hint.around];
  } else if (hint.type === "flag") {
    if (hint.reason === "partition") {
      return [hint.restrictedCell];
    } else if (hint.reason === "singleCell") {
      return [hint.around];
    } else {
      return hint.cells;
    }
  } else if (hint.type === "open") {
    return [hint.restrictedCell];
  } else if (hint.type === "random") {
    return [hint.cells[0]];
  } else {
    return [];
  }
};
