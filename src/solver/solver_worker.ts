import { GameBoardWithoutMineInfo as Board } from "./solver_types";
import { processStep } from "./solver_logic_functions";

onmessage = function (event: MessageEvent<Board>) {
  try {
    const step = processStep(event.data);
    postMessage(step);
  } catch (e) {
    console.error(e);
    console.error((e as Error)?.stack);
    postMessage({
      error:
        typeof (e as Error)?.toString === "function"
          ? (e as Error).toString() + "\r\n" + (e as Error).stack
          : "unknown error",
      type: "error",
    });
  }
};
