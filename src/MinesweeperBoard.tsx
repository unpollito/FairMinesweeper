import { GameBoard, GameCell } from "./common/types";
import React from "react";
import "./MinesweeperBoard.css";
import { SolverStep } from "./solver/solver_types";
import { getCellsToHighlight } from "./solver/solver_hint_functions";

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
  const cellsToHighlight = hint ? getCellsToHighlight(hint) : [];
  return (
    <table className={"board"}>
      <tbody>
        <tr className="board__column-indicators">
          <td className="board__column-indicators__entry" />
          {board.cells[0].map((_, columnIndex) => (
            <td className="board__column-indicators__entry" key={columnIndex}>
              {columnIndex + 1}
            </td>
          ))}
          <td className="board__column-indicators__entry" />
        </tr>
        {board.cells.map((row, rowIndex) => (
          <tr className={"board__row"} key={rowIndex}>
            <td className="board__column-indicators__entry">{rowIndex + 1}</td>
            {row.map((cell, cellIndex) => (
              <td
                className={`board__row__cell ${
                  cell.status === "flagged" || cell.status === "closed"
                    ? "board__row__cell--closed"
                    : ""
                } ${
                  cellsToHighlight.some(
                    (current) =>
                      current.rowIndex === cell.rowIndex &&
                      current.columnIndex === cell.columnIndex
                  )
                    ? "board__row__cell--highlighted"
                    : ""
                } ${
                  cell.status === "flagged" || cell.status === "exploded"
                    ? "board__row__cell--has-icon"
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
              </td>
            ))}
            <td className="board__column-indicators__entry" key={rowIndex}>
              {rowIndex + 1}
            </td>
          </tr>
        ))}
        <tr className="board__column-indicators">
          <td className="board__column-indicators__entry" />
          {board.cells[0].map((_, columnIndex) => (
            <td className="board__column-indicators__entry" key={columnIndex}>
              {columnIndex + 1}
            </td>
          ))}
          <td className="board__column-indicators__entry" />
        </tr>
      </tbody>
    </table>
  );
};
