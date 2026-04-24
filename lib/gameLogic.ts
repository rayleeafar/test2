import { Direction, Position, SnakeSegment, Food, FoodType, GameBoard } from "@/types/game";

export const BOARD_WIDTH = 20;
export const BOARD_HEIGHT = 20;

const OBSTACLE_COUNT = 8;
const OBSTACLE_DENSITY = 0.15;

export function createInitialSnake(): SnakeSegment[] {
  const startX = Math.floor(BOARD_WIDTH / 2);
  const startY = Math.floor(BOARD_HEIGHT / 2);
  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
}

function getSnakeSpawnArea(): Position[] {
  const startX = Math.floor(BOARD_WIDTH / 2);
  const startY = Math.floor(BOARD_HEIGHT / 2);
  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
    { x: startX + 1, y: startY },
    { x: startX, y: startY - 1 },
    { x: startX, y: startY + 1 },
  ];
}

export function isPositionInSpawnArea(position: Position): boolean {
  return getSnakeSpawnArea().some(
    (spawn) => spawn.x === position.x && spawn.y === position.y
  );
}

export function generateObstacles(snake: SnakeSegment[]): Position[] {
  const maxObstacles = Math.floor(BOARD_WIDTH * BOARD_HEIGHT * OBSTACLE_DENSITY);
  const targetObstacles = Math.min(OBSTACLE_COUNT, maxObstacles);
  const obstacles: Position[] = [];
  const spawnArea = getSnakeSpawnArea();
  const occupied = new Set(spawnArea.map((p) => `${p.x},${p.y}`));

  let attempts = 0;
  const maxAttempts = 1000;

  while (obstacles.length < targetObstacles && attempts < maxAttempts) {
    attempts++;
    const position: Position = {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT),
    };

    const key = `${position.x},${position.y}`;
    if (occupied.has(key)) continue;

    obstacles.push(position);
    occupied.add(key);

    if (!isBoardValid(snake, obstacles)) {
      obstacles.pop();
      occupied.delete(key);
    }
  }

  return obstacles;
}

function isBoardValid(snake: SnakeSegment[], obstacles: Position[]): boolean {
  const head = snake[0];
  const reachable = floodFillReachable(head, obstacles);

  const totalCells = BOARD_WIDTH * BOARD_HEIGHT;
  const blockedCells = obstacles.length + snake.length;
  const expectedReachable = totalCells - blockedCells;

  return reachable.size === expectedReachable;
}

function floodFillReachable(start: Position, obstacles: Position[]): Set<string> {
  const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));
  const visited = new Set<string>();
  const queue: Position[] = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.x},${current.y}`;

    if (visited.has(key)) continue;
    if (obstacleSet.has(key)) continue;
    if (
      current.x < 0 ||
      current.x >= BOARD_WIDTH ||
      current.y < 0 ||
      current.y >= BOARD_HEIGHT
    ) {
      continue;
    }

    visited.add(key);

    queue.push({ x: current.x + 1, y: current.y });
    queue.push({ x: current.x - 1, y: current.y });
    queue.push({ x: current.x, y: current.y + 1 });
    queue.push({ x: current.x, y: current.y - 1 });
  }

  return visited;
}

const FOOD_TYPE_WEIGHTS: { type: FoodType; weight: number }[] = [
  { type: "NORMAL", weight: 50 },
  { type: "SPEED", weight: 15 },
  { type: "BONUS", weight: 20 },
  { type: "GHOST", weight: 15 },
];

function getRandomFoodType(): FoodType {
  const totalWeight = FOOD_TYPE_WEIGHTS.reduce((sum, ft) => sum + ft.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { type, weight } of FOOD_TYPE_WEIGHTS) {
    random -= weight;
    if (random <= 0) {
      return type;
    }
  }

  return "NORMAL";
}

export function generateFood(snake: SnakeSegment[], obstacles: Position[]): Food {
  let position: Position;
  const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));

  do {
    position = {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT),
    };
  } while (
    isPositionOnSnake(position, snake) ||
    obstacleSet.has(`${position.x},${position.y}`)
  );

  return { ...position, type: getRandomFoodType() };
}

export function isPositionOnSnake(position: Position, snake: SnakeSegment[]): boolean {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}

export function isPositionOnObstacle(position: Position, obstacles: Position[]): boolean {
  return obstacles.some((obs) => obs.x === position.x && obs.y === position.y);
}

export function getNextPosition(head: Position, direction: Direction): Position {
  switch (direction) {
    case "UP":
      return { x: head.x, y: head.y - 1 };
    case "DOWN":
      return { x: head.x, y: head.y + 1 };
    case "LEFT":
      return { x: head.x - 1, y: head.y };
    case "RIGHT":
      return { x: head.x + 1, y: head.y };
  }
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  const opposites: Record<Direction, Direction> = {
    UP: "DOWN",
    DOWN: "UP",
    LEFT: "RIGHT",
    RIGHT: "LEFT",
  };
  return opposites[current] !== next;
}

export function isOutOfBounds(position: Position, board: GameBoard): boolean {
  return position.x < 0 || position.x >= board.width || position.y < 0 || position.y >= board.height;
}

export function isSelfCollision(position: Position, snake: SnakeSegment[]): boolean {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}

export function getInitialDirection(): Direction {
  return "RIGHT";
}
