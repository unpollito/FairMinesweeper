import { GameBoard, GameCell } from "./common/types";
import React from "react";
import "./MinesweeperBoard.css";

type CellFn = (cell: GameCell) => void;

export const MinesweeperBoard = ({
  board,
  onLeftClick,
  onMiddleClick,
  onRightClick,
}: {
  board: GameBoard;
  onLeftClick: CellFn;
  onMiddleClick: CellFn;
  onRightClick: CellFn;
}): React.ReactElement => (
  <div className={"board"}>
    {board.cells.map((row, rowIndex) => (
      <div className={"board__row"} key={rowIndex}>
        {row.map((cell, cellIndex) => (
          <div
            className={`board__row__cell ${
              cell.status === "marked" || cell.status === "closed"
                ? "board__row__cell--closed"
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
            {cell.status === "marked"
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
