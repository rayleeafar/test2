"use client";

import React from "react";
import { GameData, SnakeSegment, Food } from "@/types/game";

interface GameBoardProps {
  gameData: GameData;
}

export function GameBoard({ gameData }: GameBoardProps) {
  const { board, snake, food } = gameData;
  const cells: React.ReactNode[] = [];

  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      let cellClass = "w-full h-full rounded-sm";
      let content = null;

      const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
      const isSnakeBody = snake.slice(1).some((s) => s.x === x && s.y === y);
      const isFood = food?.x === x && food?.y === y;

      if (isSnakeHead) {
        cellClass += " bg-green-400 shadow-lg shadow-green-400/50";
      } else if (isSnakeBody) {
        cellClass += " bg-green-600";
      } else if (isFood) {
        cellClass += " bg-red-500 rounded-full animate-pulse";
        content = <div className="w-2/3 h-2/3 bg-red-300 rounded-full mx-auto my-auto" />;
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
