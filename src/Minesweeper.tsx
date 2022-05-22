import React, { useEffect, useRef, useState } from "react";
import "./Minesweeper.css";
import { gameStateMachine } from "./state/game_state_machine";
import { useMachine } from "@xstate/react";
import { GameBoard, GameDifficulty } from "./common/types";
import { MinesweeperBoard } from "./MinesweeperBoard";
import { secondsToFormattedString } from "./time/time_functions";
import { boardToBoardWithoutMineInfo } from "./solver/solver_board_conversion_functions";

export const Minesweeper = (): React.ReactElement => {
  const [state, send] = useMachine(gameStateMachine);
  const [gameTimeInSeconds, setGameTimeInSeconds] = useState(0);
  const timeIntervalHandle = useRef<number | undefined>(undefined);
  const solverWorker = useRef<Worker | undefined>(undefined);

  useEffect(() => {
    solverWorker.current = new Worker("solver_worker.js");

    solverWorker.current?.addEventListener("message", () => {
      // console.log(JSON.stringify(event.data));
    });

    return () => solverWorker.current?.terminate();
  }, []);

  useEffect(() => {
    if (
      state.context.startTime &&
      !timeIntervalHandle.current &&
      !state.context.endTime
    ) {
      setGameTimeInSeconds(0);
      timeIntervalHandle.current = window.setInterval(() => {
        setGameTimeInSeconds(
          Math.floor((Date.now() - (state.context?.startTime ?? 0)) / 1000)
        );
      }, 1000);
    } else if (
      (state.context.startTime && state.context.endTime) ||
      !state.context.startTime
    ) {
      window.clearInterval(timeIntervalHandle.current);
      timeIntervalHandle.current = undefined;
    }
  }, [state.context.startTime, state.context.endTime]);

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
          <>
            <MinesweeperBoard
              board={state.context}
              onLeftClick={(cell) => send({ cell, type: "CLICK" })}
              onMiddleClick={(cell) => send({ cell, type: "CLEAR_NEIGHBORS" })}
              onRightClick={(cell) => send({ cell, type: "MARK" })}
            />
            <div className={"minesweeper__game__footer"}>
              <p className="minesweeper__game__footer__left">
                Time: {secondsToFormattedString(gameTimeInSeconds)}
              </p>
              <p
                className={`minesweeper__game__footer__right ${
                  state.context.triedMarkingTooManyCells
                    ? "minesweeper__game__footer__right--too-many-cells"
                    : ""
                }`}
              >
                Mines remaining: {state.context.numFlagsLeft}
              </p>
              <button
                onClick={() => {
                  if (solverWorker.current) {
                    const board: GameBoard = {
                      cells: state.context.cells,
                      numFlagsLeft: state.context.numFlagsLeft,
                      numOpenedCells: state.context.numOpenedCells,
                      numTotalMines: state.context.numTotalMines,
                    };
                    solverWorker.current.postMessage(
                      boardToBoardWithoutMineInfo(board)
                    );
                  }
                }}
              >
                Hint
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
