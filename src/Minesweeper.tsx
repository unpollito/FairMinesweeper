import React from "react";
import "./Minesweeper.css";
import { gameStateMachine } from "./state/game_state_machine";
import { useMachine } from "@xstate/react";
import { GameDifficulty } from "./common/types";
import { MinesweeperBoard } from "./MinesweeperBoard";

export const Minesweeper = (): React.ReactElement => {
  const [state, send] = useMachine(gameStateMachine);
  const board = state.context.board;

  console.log(state);

  return (
    <div className={"minesweeper"}>
      <h1 className={"minesweeper__title"}>react-minesweeper</h1>
      <div className={"minesweeper__game"}>
        {state.matches("idle") ||
        board?.status === "won" ||
        board?.status === "lost" ? (
          <div
            className={`minesweeper__game__menu ${
              state.matches("idle")
                ? ""
                : "minesweeper__game__menu--translucent"
            }`}
          >
            <h2 className={"minesweeper__game__menu__title"}>
              {state.matches("idle")
                ? "Difficulty"
                : board?.status === "won"
                ? "You won! Replay?"
                : "You lost! Replay?"}
            </h2>
            {(["easy", "medium", "hard"] as GameDifficulty[]).map(
              (difficulty) => (
                <button
                  className={"minesweeper__game__menu__button"}
                  key={difficulty}
                  onClick={() => send({ difficulty, type: "START" })}
                >
                  {difficulty.substring(0, 1).toUpperCase() +
                    difficulty.substring(1)}
                </button>
              )
            )}
          </div>
        ) : undefined}
        {board && state.matches("playing") ? (
          <MinesweeperBoard
            board={board}
            onLeftClick={(cell) => send({ cell, type: "CLICK" })}
            onMiddleClick={(cell) => send({ cell, type: "CLEAR_NEIGHBORS" })}
            onRightClick={(cell) => send({ cell, type: "MARK" })}
          />
        ) : undefined}
      </div>
    </div>
  );
};
