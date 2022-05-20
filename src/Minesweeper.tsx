import React from "react";
import "./Minesweeper.css";
import { gameStateMachine } from "./state/game_state_machine";
import { useMachine } from "@xstate/react";
import { GameDifficulty } from "./common/types";
import { MinesweeperBoard } from "./MinesweeperBoard";

export const Minesweeper = (): React.ReactElement => {
  const [state, send] = useMachine(gameStateMachine);
  console.log(state);

  return (
    <div className={"minesweeper"}>
      <h1 className={"minesweeper__title"}>react-minesweeper</h1>
      <div className={"minesweeper__game"}>
        {state.matches("idle") ||
        state.matches("won") ||
        state.matches("lost") ? (
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
                : state.matches("won")
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
        {state.matches("idle") ? undefined : (
          <MinesweeperBoard
            board={state.context}
            onLeftClick={(cell) => send({ cell, type: "CLICK" })}
            onMiddleClick={(cell) => send({ cell, type: "CLEAR_NEIGHBORS" })}
            onRightClick={(cell) => send({ cell, type: "MARK" })}
          />
        )}
      </div>
    </div>
  );
};
