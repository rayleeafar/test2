"use client";

import React from "react";
import { GameData, SnakeSegment, Food, FoodType } from "@/types/game";

interface GameBoardProps {
  gameData: GameData;
}

function getFoodStyles(type: FoodType): { bg: string; content: React.ReactNode } {
  switch (type) {
    case "NORMAL":
      return {
        bg: "bg-red-500 rounded-full animate-pulse",
        content: <div className="w-2/3 h-2/3 bg-red-300 rounded-full mx-auto my-auto" />,
      };
    case "SPEED":
      return {
        bg: "bg-yellow-500 rounded-full animate-pulse",
        content: (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-yellow-900">
            ⚡
          </div>
        ),
      };
    case "BONUS":
      return {
        bg: "bg-purple-500 rounded-full animate-pulse",
        content: (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
            ★
          </div>
        ),
      };
    case "GHOST":
      return {
        bg: "bg-cyan-500 rounded-full animate-pulse",
        content: (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-cyan-900">
            👻
          </div>
        ),
      };
  }
}

export function GameBoard({ gameData }: GameBoardProps) {
  const { board, snake, food, obstacles } = gameData;
  const cells: React.ReactNode[] = [];
  const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));

  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      let cellClass = "w-full h-full rounded-sm";
      let content = null;

      const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
      const isSnakeBody = snake.slice(1).some((s) => s.x === x && s.y === y);
      const isFood = food?.x === x && food?.y === y;
      const isObstacle = obstacleSet.has(`${x},${y}`);

      if (isSnakeHead) {
        cellClass += " bg-green-400 shadow-lg shadow-green-400/50";
      } else if (isSnakeBody) {
        cellClass += " bg-green-600";
      } else if (isFood && food) {
        const foodStyles = getFoodStyles(food.type);
        cellClass += ` ${foodStyles.bg}`;
        content = foodStyles.content;
      } else if (isObstacle) {
        cellClass += " bg-gray-700 border-2 border-gray-600";
        content = <div className="w-full h-full bg-gray-800 rounded-sm" />;
      } else {
        cellClass += " bg-gray-800/50";
      }

      cells.push(
        <div
          key={`${x}-${y}`}
          className={cellClass}
          style={{
            gridColumn: x + 1,
            gridRow: y + 1,
          }}
        >
          {content}
        </div>
      );
    }
  }

  return (
    <div
      className="relative bg-gray-900 border-4 border-gray-700 rounded-lg overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${board.width}, 1fr)`,
        gridTemplateRows: `repeat(${board.height}, 1fr)`,
        gap: "1px",
        aspectRatio: `${board.width} / ${board.height}`,
      }}
    >
      {cells}
    </div>
  );
}
