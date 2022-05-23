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
    if (cell.status === "open") {
      if (getCellNeighbors({ board, cell }).some((cell2) => cell2.status !== "open" && cell2.status !== "flagged")) {
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
  var splitClosedMinesByFrontierNeighborhood = ({
    board,
    frontier
  }) => {
    const frontierClosedNeighborsMap = {};
    frontier.forEach((cell) => getCellNeighbors({ board, cell }).forEach((neighbor) => {
      if (neighbor.status === "closed") {
        if (!frontierClosedNeighborsMap[neighbor.rowIndex]) {
          frontierClosedNeighborsMap[neighbor.rowIndex] = {};
        }
        frontierClosedNeighborsMap[neighbor.rowIndex][neighbor.columnIndex] = neighbor;
      }
    }));
    const frontierNeighbors = [];
    const nonFrontierNeighbors = [];
    board.cells.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
      var _a;
      if (cell.status === "closed") {
        if ((_a = frontierClosedNeighborsMap[rowIndex]) == null ? void 0 : _a[columnIndex]) {
          frontierNeighbors.push(cell);
        } else {
          nonFrontierNeighbors.push(cell);
        }
      }
    }));
    return { frontierNeighbors, nonFrontierNeighbors };
  };

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
  }) => cell.status === "closed" && getCellNeighbors({ board, cell }).every((neighbor) => neighbor.status === "closed" || neighbor.status === "flagged");

  // src/solver/solver_solve_cell_functions.ts
  var trySolvingSomeCell = ({
    board,
    frontier
  }) => {
    const possibleClearSteps = [];
    const possibleFlagSteps = [];
    for (const cell of frontier) {
      const neighbors = getCellNeighbors({ board, cell });
      const closedNeighbors = neighbors.filter((neighbor) => neighbor.status === "closed");
      const flaggedNeighbors = neighbors.filter((neighbor) => neighbor.status === "flagged");
      if (closedNeighbors.length + flaggedNeighbors.length === cell.numNeighborsWithMines) {
        possibleFlagSteps.push({
          around: cell,
          cells: closedNeighbors,
          reason: "singleCell",
          type: "flag"
        });
      }
      if (flaggedNeighbors.length === cell.numNeighborsWithMines && closedNeighbors.length) {
        possibleClearSteps.push({
          around: cell,
          cells: closedNeighbors,
          type: "clearNeighbors"
        });
      }
    }
    if (possibleClearSteps.length > 0) {
      possibleClearSteps.sort((a, b) => b.cells.length - a.cells.length);
      return possibleClearSteps[0];
    }
    possibleFlagSteps.sort((a, b) => b.cells.length - a.cells.length);
    return possibleFlagSteps[0];
  };

  // src/solver/solver_partition_functions.ts
  var trySolvingSomePartition = ({
    board,
    frontier
  }) => {
    var _a;
    const partitionMap = {};
    frontier.forEach((cell) => {
      const neighbors = getCellNeighbors({ board, cell });
      const flaggedNeighbors = neighbors.filter((neighbor) => neighbor.status === "flagged");
      const restrictableCells = neighbors.filter((neighbor) => neighbor.status === "closed");
      const numMinesInRestrictableNeighbors = cell.numNeighborsWithMines - flaggedNeighbors.length;
      if (!partitionMap[cell.rowIndex]) {
        partitionMap[cell.rowIndex] = {};
      }
      partitionMap[cell.rowIndex][cell.columnIndex] = {
        affectedCells: restrictableCells,
        numMines: numMinesInRestrictableNeighbors,
        originCell: cell
      };
    });
    for (const cell of frontier) {
      const cellPartition = partitionMap[cell.rowIndex][cell.columnIndex];
      const neighbors = getCellNeighbors({ board, cell });
      for (const neighbor of neighbors) {
        const neighborPartition = (_a = partitionMap[neighbor.rowIndex]) == null ? void 0 : _a[neighbor.columnIndex];
        const neighborComesAfterCell = neighbor.rowIndex > cell.rowIndex || neighbor.rowIndex === cell.rowIndex && neighbor.columnIndex > cell.columnIndex;
        if (!!neighborPartition && neighborComesAfterCell) {
          const intersectionCells = cellPartition.affectedCells.filter((cell2) => neighborPartition.affectedCells.includes(cell2));
          if (intersectionCells.length > 0) {
            const cellMinusNeighborCells = cellPartition.affectedCells.filter((cell2) => !neighborPartition.affectedCells.includes(cell2));
            const neighborMinusCellCells = neighborPartition.affectedCells.filter((cell2) => !cellPartition.affectedCells.includes(cell2));
            const minMinesInIntersection = Math.max(neighborPartition.numMines - neighborMinusCellCells.length, cellPartition.numMines - cellMinusNeighborCells.length);
            const maxMinesInIntersection = Math.min(neighbor.numNeighborsWithMines, cell.numNeighborsWithMines, intersectionCells.length);
            if (minMinesInIntersection === maxMinesInIntersection) {
              if (cellMinusNeighborCells.length > 0) {
                const numMinesInCellMinusNeighborPartition = cellPartition.numMines - minMinesInIntersection;
                if (numMinesInCellMinusNeighborPartition === cellMinusNeighborCells.length || numMinesInCellMinusNeighborPartition === 0) {
                  const base = {
                    cells: cellMinusNeighborCells,
                    commonRegion: intersectionCells,
                    restrictedCell: cell,
                    restrictingCell: neighbor
                  };
                  return numMinesInCellMinusNeighborPartition === 0 ? __spreadProps(__spreadValues({}, base), {
                    type: "open"
                  }) : __spreadProps(__spreadValues({}, base), {
                    reason: "partition",
                    type: "flag"
                  });
                }
              }
              if (neighborMinusCellCells.length > 0) {
                const numMinesInNeighborMinusCellPartition = neighborPartition.numMines - minMinesInIntersection;
                if (numMinesInNeighborMinusCellPartition === neighborMinusCellCells.length || numMinesInNeighborMinusCellPartition === 0) {
                  const base = {
                    cells: neighborMinusCellCells,
                    commonRegion: intersectionCells,
                    restrictedCell: neighbor,
                    restrictingCell: cell
                  };
                  return numMinesInNeighborMinusCellPartition === 0 ? __spreadProps(__spreadValues({}, base), {
                    type: "open"
                  }) : __spreadProps(__spreadValues({}, base), {
                    reason: "partition",
                    type: "flag"
                  });
                }
              }
            }
          }
        }
      }
    }
    return void 0;
  };

  // src/common/board_cloning_functions.ts
  var cloneCellsAround = ({
    around,
    cells,
    radius
  }) => cells.map((row, rowIndex) => {
    if (rowIndex < around.rowIndex - radius || rowIndex > around.rowIndex + radius) {
      return row;
    } else {
      return row.map((cell, colIndex) => {
        if (colIndex < around.columnIndex - radius || colIndex > around.columnIndex + radius) {
          return cell;
        } else {
          return __spreadValues({}, cell);
        }
      });
    }
  });

  // src/solver/solve_number_of_mines_functions.ts
  var trySolvingBasedOnNumberOfMines = ({
    board,
    frontier
  }) => {
    const { frontierNeighbors, nonFrontierNeighbors } = splitClosedMinesByFrontierNeighborhood({ board, frontier });
    const solutions = solveMineLocations({
      board,
      frontier,
      frontierNeighbors,
      maxSolutions: 2,
      nonFrontierNeighbors
    });
    if (solutions.length !== 1) {
      return void 0;
    }
    let solutionToUse = solutions[0];
    if (solutionToUse.length + nonFrontierNeighbors.length === board.numFlagsLeft) {
      solutionToUse = [...solutionToUse, ...nonFrontierNeighbors];
    }
    return {
      cells: solutionToUse,
      numberOfMines: board.numFlagsLeft,
      reason: "numberOfMines",
      type: "flag"
    };
  };
  var solveMineLocations = ({
    board,
    frontier,
    frontierNeighbors,
    maxSolutions,
    nonFrontierNeighbors
  }) => {
    if (frontierNeighbors.length + nonFrontierNeighbors.length < board.numFlagsLeft) {
      return [];
    }
    if (board.numFlagsLeft === 0 || frontierNeighbors.length === 0) {
      if (checkCellListMineOffset({ board, cells: frontier }).every((entry) => entry === 0)) {
        return [[]];
      } else {
        return [];
      }
    }
    const solutions = [];
    const frontierNeighborCell = frontierNeighbors[0];
    const solutionsWithoutMineInCurrentCell = solveMineLocations({
      board,
      frontier,
      frontierNeighbors: frontierNeighbors.slice(1),
      maxSolutions: maxSolutions - solutions.length,
      nonFrontierNeighbors
    });
    solutionsWithoutMineInCurrentCell.forEach((solution) => {
      solutions.push(solution);
    });
    if (solutions.length < maxSolutions && board.numFlagsLeft > 0) {
      const clonedBoardCells = cloneCellsAround({
        around: frontierNeighborCell,
        cells: board.cells,
        radius: 0
      });
      clonedBoardCells[frontierNeighborCell.rowIndex][frontierNeighborCell.columnIndex].status = "flagged";
      const clonedBoard = __spreadProps(__spreadValues({}, board), {
        cells: clonedBoardCells,
        numFlagsLeft: board.numFlagsLeft - 1
      });
      const neighbors = getCellNeighbors({
        board: clonedBoard,
        cell: frontierNeighborCell
      });
      let someNeighborHasTooManyMinedNeighbors = false;
      neighbors.forEach((neighbor) => {
        if (neighbor.status === "open" && checkCellMineOffset({
          board: clonedBoard,
          cell: neighbor
        }) > 0) {
          someNeighborHasTooManyMinedNeighbors = true;
        }
      });
      if (!someNeighborHasTooManyMinedNeighbors) {
        solveMineLocations({
          board: clonedBoard,
          frontier,
          frontierNeighbors: frontierNeighbors.slice(1),
          maxSolutions: maxSolutions - solutions.length,
          nonFrontierNeighbors
        }).forEach((solution) => {
          solutions.push([frontierNeighborCell, ...solution]);
        });
      }
    }
    return solutions;
  };
  var checkCellListMineOffset = ({
    board,
    cells
  }) => cells.map((cell) => checkCellMineOffset({ board, cell }));
  var checkCellMineOffset = ({
    board,
    cell
  }) => {
    const neighbors = getCellNeighbors({
      board,
      cell
    });
    const actualNumNeighborsWithMines = neighbors.filter((neighbor) => neighbor.status === "flagged").length;
    return actualNumNeighborsWithMines - cell.numNeighborsWithMines;
  };

  // src/solver/solver_logic_functions.ts
  var processStep = (board) => {
    const frontier = getFrontier(board);
    if (frontier.length > 0) {
      const solveCellStep = trySolvingSomeCell({ board, frontier });
      if (solveCellStep) {
        return solveCellStep;
      }
      const solvePartitionStep = trySolvingSomePartition({ board, frontier });
      if (solvePartitionStep) {
        return solvePartitionStep;
      }
      const solveNumberOfMinesStep = trySolvingBasedOnNumberOfMines({
        board,
        frontier
      });
      if (solveNumberOfMinesStep) {
        return solveNumberOfMinesStep;
      }
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
    postMessage(step);
  };
})();
