import {
  BoardAndStatus,
  GameBoard,
  GameCell,
  GameDifficulty,
} from "../common/types";
import { GAME_MODES } from "./game_setup_constants";
import { getRandomInteger } from "../common/random_util_functions";
import { cloneCells } from "../common/board_cloning_functions";
import { openCell } from "../game_rules/game_rules_functions";
import { getCellNeighbors } from "../common/cell_neighbor_functions";

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
  numFlagsLeft: GAME_MODES[difficulty].numMines,
  numOpenedCells: 0,
  numTotalMines: GAME_MODES[difficulty].numMines,
});

export const fillBoardAfterFirstClick = ({
  board: oldBoard,
  cell: clickedCell,
}: {
  board: GameBoard;
  cell: GameCell;
}): BoardAndStatus => {
  const board = { ...oldBoard, cells: cloneCells(oldBoard.cells) };
  const candidateCells = board.cells
    .map((row) =>
      row.filter(
        (cell) =>
          cell.rowIndex !== clickedCell.rowIndex ||
          cell.columnIndex !== clickedCell.columnIndex
      )
    )
    .reduce((a, b) => [...a, ...b], []);
  if (board.numFlagsLeft > candidateCells.length) {
    throw new Error("The board is too small for this number of mines");
  }

  for (let i = 0; i < board.numFlagsLeft; i++) {
    const minedCellIndex = getRandomInteger(0, candidateCells.length);
    const minedCell = candidateCells[minedCellIndex];
    candidateCells.splice(minedCellIndex, 1);
    minedCell.hasMine = true;
    getCellNeighbors({
      board,
      cell: minedCell,
    }).forEach((cell) => cell.numNeighborsWithMines++);
  }

  return openCell({
    board,
    cell: board.cells[clickedCell.rowIndex][clickedCell.columnIndex],
    status: "playing",
  });
};
