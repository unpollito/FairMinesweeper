import { GameBoard, GameCell } from "./common/types";
import React from "react";
import "./MinesweeperBoard.css";
import { SolverStep } from "./solver/solver_types";
import { getCellToHighlight } from "./solver/solver_hint_functions";

type CellFn = (cell: GameCell) => void;

export const MinesweeperBoard = ({
  board,
  hint,
  onLeftClick,
  onMiddleClick,
  onRightClick,
}: {
  board: GameBoard;
  hint?: SolverStep;
  onLeftClick: CellFn;
  onMiddleClick: CellFn;
  onRightClick: CellFn;
}): React.ReactElement => {
  const cellToHighlight = hint && getCellToHighlight(hint);
  return (
    <div className={"board"}>
      {board.cells.map((row, rowIndex) => (
        <div className={"board__row"} key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <div
              className={`board__row__cell ${
                cell.status === "flagged" || cell.status === "closed"
                  ? "board__row__cell--closed"
                  : ""
              } ${
                cell.rowIndex === cellToHighlight?.rowIndex &&
                cell.columnIndex === cellToHighlight?.columnIndex
                  ? "board__row__cell--highlighted"
                  : ""
              }`}
              key={cellIndex}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  onMiddleClick(cell);
                } else if (e.button === 2) {
                  onRightClick(cell);
                }
              }}
              onClick={() => onLeftClick(cell)}
              onContextMenu={(e) => e.preventDefault()}
            >
              {cell.status === "flagged"
                ? "🚩"
                : cell.status === "exploded"
                ? "💥"
                : cell.status === "open" && cell.numNeighborsWithMines
                ? cell.numNeighborsWithMines
                : ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
