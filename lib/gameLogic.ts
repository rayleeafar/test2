import { Direction, Position, SnakeSegment, Food, GameBoard } from "@/types/game";

export const BOARD_WIDTH = 20;
export const BOARD_HEIGHT = 20;

export function createInitialSnake(): SnakeSegment[] {
  const startX = Math.floor(BOARD_WIDTH / 2);
  const startY = Math.floor(BOARD_HEIGHT / 2);
  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
}

export function generateFood(snake: SnakeSegment[]): Food {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT),
    };
  } while (isPositionOnSnake(position, snake));

  return { ...position, type: "NORMAL" };
}

export function isPositionOnSnake(position: Position, snake: SnakeSegment[]): boolean {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
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
