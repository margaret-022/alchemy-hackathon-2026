// Deterministic Snake game logic with no DOM dependencies.
(function (globalThisScope, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    globalThisScope.SnakeLogic = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const GRID_DEFAULT = 15;
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  function createRng(seed = Date.now()) {
    let value = seed % 2147483647;
    if (value <= 0) value += 2147483646;
    return function next() {
      value = (value * 16807) % 2147483647;
      return value / 2147483647;
    };
  }

  function clonePoint(point) {
    return { x: point.x, y: point.y };
  }

  function createState(seed = Date.now(), gridSize = GRID_DEFAULT) {
    const rng = createRng(seed);
    const start = Math.floor(gridSize / 2);
    const state = {
      seed,
      rng,
      gridSize,
      snake: [{ x: start, y: start }],
      direction: "right",
      nextDirection: "right",
      food: null,
      score: 0,
      status: "idle",
    };
    state.food = placeFood(state);
    return state;
  }

  function isOpposite(current, next) {
    return (
      (current === "up" && next === "down") ||
      (current === "down" && next === "up") ||
      (current === "left" && next === "right") ||
      (current === "right" && next === "left")
    );
  }

  function queueDirection(state, requested) {
    if (!DIRECTIONS[requested]) return state.nextDirection;
    if (isOpposite(state.direction, requested)) return state.nextDirection;
    state.nextDirection = requested;
    return state.nextDirection;
  }

  function placeFood(state) {
    const { gridSize, snake, rng } = state;
    const openCells = [];
    for (let y = 0; y < gridSize; y += 1) {
      for (let x = 0; x < gridSize; x += 1) {
        const occupied = snake.some((segment) => segment.x === x && segment.y === y);
        if (!occupied) openCells.push({ x, y });
      }
    }
    if (!openCells.length) return null;
    const index = Math.floor(rng() * openCells.length);
    return clonePoint(openCells[index]);
  }

  function step(state) {
    if (state.status === "over") {
      return { status: "over" };
    }
    state.direction = state.nextDirection;
    const delta = DIRECTIONS[state.direction];
    const head = state.snake[0];
    const nextHead = { x: head.x + delta.x, y: head.y + delta.y };

    const hitWall =
      nextHead.x < 0 ||
      nextHead.y < 0 ||
      nextHead.x >= state.gridSize ||
      nextHead.y >= state.gridSize;
    const hitSelf = state.snake.some(
      (segment) => segment.x === nextHead.x && segment.y === nextHead.y
    );
    if (hitWall || hitSelf) {
      state.status = "over";
      return { status: "over", reason: hitWall ? "wall" : "self" };
    }

    const ateFood = state.food && state.food.x === nextHead.x && state.food.y === nextHead.y;
    state.snake.unshift(nextHead);
    if (ateFood) {
      state.score += 1;
      state.food = placeFood(state);
    } else {
      state.snake.pop();
    }

    if (!state.food) {
      state.status = "over";
      return { status: "over", reason: "filled" };
    }

    state.status = "running";
    return { status: "running", ate: ateFood };
  }

  return {
    DIRECTIONS,
    createRng,
    createState,
    queueDirection,
    placeFood,
    step,
  };
});
