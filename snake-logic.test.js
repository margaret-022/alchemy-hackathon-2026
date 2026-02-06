const assert = require("assert");
const { createState, queueDirection, step, placeFood } = require("./snake-logic");

function testMovementAdvancesHead() {
  const state = createState(1, 5);
  state.snake = [{ x: 2, y: 2 }];
  state.food = { x: 4, y: 4 };
  queueDirection(state, "right");
  const result = step(state);
  assert.strictEqual(result.status, "running");
  assert.deepStrictEqual(state.snake[0], { x: 3, y: 2 });
  assert.strictEqual(state.snake.length, 1);
}

function testFoodGrowthAndScore() {
  const state = createState(2, 5);
  state.snake = [{ x: 1, y: 1 }];
  state.food = { x: 2, y: 1 };
  queueDirection(state, "right");
  const result = step(state);
  assert.strictEqual(result.ate, true);
  assert.strictEqual(state.score, 1);
  assert.strictEqual(state.snake.length, 2);
  assert.notDeepStrictEqual(state.food, null);
}

function testSelfCollisionEndsGame() {
  const state = createState(3, 5);
  state.snake = [
    { x: 2, y: 2 },
    { x: 2, y: 3 },
    { x: 1, y: 3 },
    { x: 1, y: 2 },
    { x: 1, y: 1 },
  ];
  state.direction = "left";
  state.nextDirection = "left";
  const result = step(state);
  assert.strictEqual(result.status, "over");
  assert.strictEqual(result.reason, "self");
}

function testFoodPlacementAvoidsSnake() {
  const state = createState(4, 3);
  state.snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ];
  const food = placeFood(state);
  assert.deepStrictEqual(food, { x: 2, y: 2 });
}

function run() {
  testMovementAdvancesHead();
  testFoodGrowthAndScore();
  testSelfCollisionEndsGame();
  testFoodPlacementAvoidsSnake();
  console.log("Snake logic tests passed.");
}

run();
