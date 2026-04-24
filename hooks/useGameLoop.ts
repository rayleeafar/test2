"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Direction,
  GameState,
  GameData,
  GameBoard,
  Position,
  ActiveEffect,
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
  getFoodEffect,
  getEffectSpeedMultiplier,
} from "@/lib/gameLogic";
import { loadLeaderboard, saveScore } from "@/lib/leaderboard";
import { LeaderboardEntry } from "@/types/game";

const BASE_GAME_SPEED = 150;

export interface UseGameLoopReturn {
  gameData: GameData;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  setDirection: (direction: Direction) => void;
  score: number;
  leaderboard: LeaderboardEntry[];
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
    activeEffect: "NONE",
    effectEndTime: null,
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
    activeEffect: "NONE",
    effectEndTime: null,
  }));

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const scoreSavedRef = useRef(false);

  useEffect(() => {
    setGameData(createInitialGameData());
    setLeaderboard(loadLeaderboard());
  }, []);

  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const activeEffectRef = useRef<{ effect: ActiveEffect; endTime: number | null }>({
    effect: "NONE",
    endTime: null,
  });

  const getCurrentSpeed = useCallback(() => {
    const multiplier = getEffectSpeedMultiplier(activeEffectRef.current.effect);
    return BASE_GAME_SPEED * multiplier;
  }, []);

  const updateGame = useCallback(() => {
    setGameData((prev) => {
      if (prev.gameState !== "PLAYING") return prev;

      const now = Date.now();
      let currentEffect = prev.activeEffect;
      let effectEndTime = prev.effectEndTime;

      if (effectEndTime && now >= effectEndTime) {
        currentEffect = "NONE";
        effectEndTime = null;
        activeEffectRef.current = { effect: "NONE", endTime: null };
      }

      const newDirection = prev.nextDirection;
      const head = prev.snake[0];
      const newHead = getNextPosition(head, newDirection);

      const isGhostMode = currentEffect === "GHOST";
      const hitObstacle = isPositionOnObstacle(newHead, prev.obstacles);

      if (
        isOutOfBounds(newHead, prev.board) ||
        isSelfCollision(newHead, prev.snake) ||
        (!isGhostMode && hitObstacle)
      ) {
        if (!scoreSavedRef.current && prev.score > 0) {
          scoreSavedRef.current = true;
          setTimeout(() => {
            saveScore(prev.score);
            setLeaderboard(loadLeaderboard());
          }, 0);
        }
        return { ...prev, gameState: "GAME_OVER" };
      }

      const newSnake = [newHead, ...prev.snake];
      let newScore = prev.score;
      let newFood = prev.food;
      let newEffect = currentEffect;
      let newEffectEndTime = effectEndTime;

      if (prev.food && newHead.x === prev.food.x && newHead.y === prev.food.y) {
        const foodEffect = getFoodEffect(prev.food.type);
        newScore += foodEffect.score;
        newFood = generateFood(newSnake, prev.obstacles);

        if (prev.food.type === "SPEED") {
          newEffect = "SPEED";
          newEffectEndTime = now + foodEffect.durationMs;
          activeEffectRef.current = { effect: "SPEED", endTime: newEffectEndTime };
        } else if (prev.food.type === "GHOST") {
          newEffect = "GHOST";
          newEffectEndTime = now + foodEffect.durationMs;
          activeEffectRef.current = { effect: "GHOST", endTime: newEffectEndTime };
        }
      } else {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        direction: newDirection,
        food: newFood,
        score: newScore,
        activeEffect: newEffect,
        effectEndTime: newEffectEndTime,
      };
    });
  }, []);

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (gameData.gameState === "PLAYING") {
        const currentSpeed = getCurrentSpeed();
        if (timestamp - lastUpdateRef.current >= currentSpeed) {
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
  }, [gameData.gameState, updateGame, getCurrentSpeed]);

  const startGame = useCallback(() => {
    const snake = createInitialSnake();
    const obstacles = generateObstacles(snake);
    activeEffectRef.current = { effect: "NONE", endTime: null };
    scoreSavedRef.current = false;
    setGameData({
      snake,
      food: generateFood(snake, obstacles),
      obstacles,
      direction: getInitialDirection(),
      nextDirection: getInitialDirection(),
      score: 0,
      gameState: "PLAYING",
      board,
      activeEffect: "NONE",
      effectEndTime: null,
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
    activeEffectRef.current = { effect: "NONE", endTime: null };
    scoreSavedRef.current = false;
    setGameData({
      snake,
      food: generateFood(snake, obstacles),
      obstacles,
      direction: getInitialDirection(),
      nextDirection: getInitialDirection(),
      score: 0,
      gameState: "START",
      board,
      activeEffect: "NONE",
      effectEndTime: null,
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
    leaderboard,
  };
}
