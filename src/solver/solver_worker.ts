import { GameBoardWithoutMineInfo as Board } from "./solver_types";
import { processStep } from "./solver_logic_functions";

onmessage = function (event: MessageEvent<Board>) {
  const step = processStep(event.data);
  postMessage(step);
};
