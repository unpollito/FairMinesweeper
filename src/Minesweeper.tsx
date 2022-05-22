import React, { useEffect, useRef, useState } from "react";
import "./Minesweeper.css";
import { gameStateMachine } from "./state/game_state_machine";
import { useMachine } from "@xstate/react";
import { GameDifficulty } from "./common/types";
import { MinesweeperBoard } from "./MinesweeperBoard";
import { secondsToFormattedString } from "./time/time_functions";
import { SolverStep } from "./solver/solver_types";
import { HintSection } from "./HintSection";

export const Minesweeper = (): React.ReactElement => {
  const [state, send] = useMachine(gameStateMachine);
  const [gameTimeInSeconds, setGameTimeInSeconds] = useState(0);
  const timeIntervalHandle = useRef<number | undefined>(undefined);

  useEffect(() => {
    const solverWorker = new Worker("solver_worker.js");

    send({ solverWorker, type: "SET_SOLVER_WORKER" });

    solverWorker.addEventListener(
      "message",
      (event: MessageEvent<SolverStep>) => {
        if (event.data.type !== "error") {
          send({ hint: event.data, type: "SET_HINT" });
        }
      }
    );

    return () => {
      solverWorker.terminate();
    };
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
              hint={
                state.context.isShowingHint ? state.context.hint : undefined
              }
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
            </div>
            <HintSection
              hint={
                state.context.isShowingHint ? state.context.hint : undefined
              }
              onRequestHint={() => send({ type: "SHOW_HINT" })}
            />
          </>
        )}
      </div>
    </div>
  );
};
