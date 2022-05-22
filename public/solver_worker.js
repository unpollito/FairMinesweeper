(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/common/cell_neighbor_functions.ts
  var getCellNeighbors = ({
    board,
    cell: { columnIndex, rowIndex }
  }) => {
    var _a, _b, _c, _d, _e, _f;
    return [
      (_a = board.cells[rowIndex - 1]) == null ? void 0 : _a[columnIndex - 1],
      (_b = board.cells[rowIndex - 1]) == null ? void 0 : _b[columnIndex],
      (_c = board.cells[rowIndex - 1]) == null ? void 0 : _c[columnIndex + 1],
      board.cells[rowIndex][columnIndex - 1],
      board.cells[rowIndex][columnIndex + 1],
      (_d = board.cells[rowIndex + 1]) == null ? void 0 : _d[columnIndex - 1],
      (_e = board.cells[rowIndex + 1]) == null ? void 0 : _e[columnIndex],
      (_f = board.cells[rowIndex + 1]) == null ? void 0 : _f[columnIndex + 1]
    ].filter((cell) => !!cell);
  };

  // src/solver/solver_helper_functions.ts
  var getFrontier = (board) => board.cells.map((row) => row.map((cell) => {
    if (cell.status === "open" || cell.status === "marked") {
      if (getCellNeighbors({ board, cell }).some((cell2) => cell2.status !== "open" && cell2.status !== "marked")) {
        return cell;
      }
    }
    return void 0;
  }).filter((a) => !!a)).reduce((a, b) => [...a, ...b], []);
  var getBoardCorners = (board) => [
    board.cells[0][0],
    board.cells[board.cells.length - 1][0],
    board.cells[0][board.cells[0].length - 1],
    board.cells[board.cells.length - 1][board.cells[0].length - 1]
  ];
  var getBoardEdges = (board) => {
    const result = [];
    for (let rowIndex = 1; rowIndex < board.cells.length - 1; rowIndex++) {
      result.push(board.cells[rowIndex][0]);
      result.push(board.cells[rowIndex][board.cells[0].length - 1]);
    }
    for (let columnIndex = 1; columnIndex < board.cells[0].length - 1; columnIndex++) {
      result.push(board.cells[0][columnIndex]);
      result.push(board.cells[board.cells.length - 1][columnIndex]);
    }
    return result;
  };
  var getBoardMiddleCells = (board) => board.cells.filter((row, rowIndex) => rowIndex > 0 && rowIndex < board.cells.length - 1).map((row) => row.filter((cell, columnIndex) => columnIndex > 0 && columnIndex < row.length - 1)).reduce((a, b) => [...a, ...b], []);

  // src/solver/solver_random_choice_functions.ts
  var getRandomChoice = (board) => {
    const filterChoosableCells = (cell) => canChooseRandomCell({ board, cell });
    const choosableCorners = getBoardCorners(board).filter(filterChoosableCells);
    if (choosableCorners.length) {
      return { cells: choosableCorners, choice: "corner" };
    }
    const choosableEdges = getBoardEdges(board).filter(filterChoosableCells);
    if (choosableEdges.length) {
      return { cells: choosableEdges, choice: "edge" };
    }
    const choosableMiddleCells = getBoardMiddleCells(board).filter(filterChoosableCells);
    return { cells: choosableMiddleCells, choice: "middle" };
  };
  var canChooseRandomCell = ({
    board,
    cell
  }) => cell.status === "closed" && getCellNeighbors({ board, cell }).every((neighbor) => neighbor.status === "closed" || neighbor.status === "marked");

  // src/solver/solver_solve_cell_functions.ts
  var trySolvingSomeCell = ({
    board,
    frontier
  }) => {
    const possibleClearSteps = [];
    const possibleMarkSteps = [];
    for (const cell of frontier) {
      if (cell.status === "open") {
        const neighbors = getCellNeighbors({ board, cell });
        const closedNeighbors = neighbors.filter((neighbor) => neighbor.status === "closed");
        const markedNeighbors = neighbors.filter((neighbor) => neighbor.status === "marked");
        if (closedNeighbors.length + markedNeighbors.length === cell.numNeighborsWithMines) {
          possibleMarkSteps.push({
            around: cell,
            cells: closedNeighbors,
            type: "mark"
          });
        }
        if (markedNeighbors.length === cell.numNeighborsWithMines && closedNeighbors.length) {
          possibleClearSteps.push({
            around: cell,
            cells: closedNeighbors,
            type: "clearNeighbors"
          });
        }
      }
    }
    if (possibleClearSteps.length > 0) {
      possibleClearSteps.sort((a, b) => b.cells.length - a.cells.length);
      return possibleClearSteps[0];
    }
    possibleMarkSteps.sort((a, b) => b.cells.length - a.cells.length);
    return possibleMarkSteps[0];
  };

  // src/solver/solver_logic_functions.ts
  var processStep = (board) => {
    const frontier = getFrontier(board);
    const solveCellStep = trySolvingSomeCell({ board, frontier });
    if (solveCellStep) {
      return solveCellStep;
    }
    const randomChoice = getRandomChoice(board);
    if (randomChoice.cells.length > 0) {
      return __spreadProps(__spreadValues({}, randomChoice), { type: "random" });
    } else {
      return { message: "Don't know how to proceed", type: "error" };
    }
  };

  // src/solver/solver_worker.ts
  onmessage = function(event) {
    const step = processStep(event.data);
    console.log(JSON.stringify(step));
    postMessage(step);
  };
})();
