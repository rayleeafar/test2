export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type GameState = "START" | "PLAYING" | "PAUSED" | "GAME_OVER";

export type CellType = "EMPTY" | "SNAKE" | "FOOD" | "OBSTACLE";

export interface Position {
  x: number;
  y: number;
}

export interface SnakeSegment extends Position {}

export type FoodType = "NORMAL" | "SPEED" | "BONUS" | "GHOST";

export type ActiveEffect = "NONE" | "SPEED" | "GHOST";

export interface Food extends Position {
  type: FoodType;
}

export interface GameBoard {
  width: number;
  height: number;
}

export interface GameData {
  snake: SnakeSegment[];
  food: Food | null;
  obstacles: Position[];
  direction: Direction;
  nextDirection: Direction;
  score: number;
  gameState: GameState;
  board: GameBoard;
  activeEffect: ActiveEffect;
  effectEndTime: number | null;
}

export interface LeaderboardEntry {
  score: number;
  timestamp: number;
  id: string;
}
