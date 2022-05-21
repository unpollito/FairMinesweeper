import { BoardAndStatus, GameBoard, GameCell } from "../common/types";
import { openCell } from "../game_rules/open_cell_functions";
import { fillBoardAfterFirstClick } from "./board_filling_functions";

export const handleFirstClick = ({
  board: oldBoard,
  cell: clickedCell,
}: {
  board: GameBoard;
  cell: GameCell;
}): BoardAndStatus => {
  const { board: newBoard, status: newStatus } = fillBoardAfterFirstClick({
    board: oldBoard,
    cell: clickedCell,
  });
  return openCell({
    board: newBoard,
    cell: newBoard.cells[clickedCell.rowIndex][clickedCell.columnIndex],
    status: newStatus,
  });
};
