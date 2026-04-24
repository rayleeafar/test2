"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Direction,
  GameState,
  GameData,
  GameBoard,
  Position,
} from "@/types/game";
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  createInitialSnake,
  generateFood,
  generateObstacles,
  getNextPosition,
  isValidDirectionChange,
  isOutOfBounds,
  isSelfCollision,
  getInitialDirection,
  isPositionOnObstacle,
} from "@/lib/gameLogic";

const GAME_SPEED = 150;

export interface UseGameLoopReturn {
  gameData: GameData;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  setDirection: (direction: Direction) => void;
  score: number;
}

function createInitialGameData(): GameData {
  const snake = createInitialSnake();
  const obstacles = generateObstacles(snake);
  return {
    snake,
    food: generateFood(snake, obstacles),
    obstacles,
    direction: getInitialDirection(),
    nextDirection: getInitialDirection(),
    score: 0,
    gameState: "START",
    board: { width: BOARD_WIDTH, height: BOARD_HEIGHT },
  };
}

export function useGameLoop(): UseGameLoopReturn {
  const board: GameBoard = { width: BOARD_WIDTH, height: BOARD_HEIGHT };

  const [gameData, setGameData] = useState<GameData>(() => ({
    snake: createInitialSnake(),
    food: null,
    obstacles: [] as Position[],
    direction: getInitialDirection(),
    nextDirection: getInitialDirection(),
    score: 0,
    gameState: "START",
    board,
  }));

  useEffect(() => {
    setGameData(createInitialGameData());
  }, []);

  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const updateGame = useCallback(() => {
    setGameData((prev) => {
      if (prev.gameState !== "PLAYING") return prev;

      const newDirection = prev.nextDirection;
      const head = prev.snake[0];
      const newHead = getNextPosition(head, newDirection);

      if (
        isOutOfBounds(newHead, prev.board) ||
        isSelfCollision(newHead, prev.snake) ||
        isPositionOnObstacle(newHead, prev.obstacles)
      ) {
        return { ...prev, gameState: "GAME_OVER" };
      }

      const newSnake = [newHead, ...prev.snake];
      let newScore = prev.score;
      let newFood = prev.food;

      if (prev.food && newHead.x === prev.food.x && newHead.y === prev.food.y) {
        newScore += 10;
        newFood = generateFood(newSnake, prev.obstacles);
      } else {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        direction: newDirection,
        food: newFood,
        score: newScore,
      };
    });
  }, []);

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (gameData.gameState === "PLAYING") {
        if (timestamp - lastUpdateRef.current >= GAME_SPEED) {
          updateGame();
          lastUpdateRef.current = timestamp;
        }
        gameLoopRef.current = requestAnimationFrame(loop);
      }
    };

    if (gameData.gameState === "PLAYING") {
      gameLoopRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameData.gameState, updateGame]);

  const startGame = useCallback(() => {
    const snake = createInitialSnake();
    const obstacles = generateObstacles(snake);
    setGameData({
      snake,
      food: generateFood(snake, obstacles),
      obstacles,
      direction: getInitialDirection(),
      nextDirection: getInitialDirection(),
      score: 0,
      gameState: "PLAYING",
      board,
    });
    lastUpdateRef.current = 0;
  }, [board]);

  const pauseGame = useCallback(() => {
    setGameData((prev) => ({ ...prev, gameState: "PAUSED" }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameData((prev) => ({ ...prev, gameState: "PLAYING" }));
  }, []);

  const restartGame = useCallback(() => {
    const snake = createInitialSnake();
    const obstacles = generateObstacles(snake);
    setGameData({
      snake,
      food: generateFood(snake, obstacles),
      obstacles,
      direction: getInitialDirection(),
      nextDirection: getInitialDirection(),
      score: 0,
      gameState: "START",
      board,
    });
    lastUpdateRef.current = 0;
  }, [board]);

  const setDirection = useCallback((direction: Direction) => {
    setGameData((prev) => {
      if (prev.gameState !== "PLAYING") return prev;
      if (!isValidDirectionChange(prev.direction, direction)) return prev;
      return { ...prev, nextDirection: direction };
    });
  }, []);

  return {
    gameData,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    setDirection,
    score: gameData.score,
  };
}
