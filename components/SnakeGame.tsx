"use client";

import { useEffect, useCallback, useState } from "react";
import { useGameLoop } from "@/hooks/useGameLoop";
import { GameBoard } from "./GameBoard";
import { Direction, LeaderboardEntry } from "@/types/game";
import { formatDate } from "@/lib/leaderboard";

function EffectIndicator({ activeEffect, effectEndTime }: { activeEffect: string; effectEndTime: number | null }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!effectEndTime || activeEffect === "NONE") {
      setTimeLeft(0);
      return;
    }

    const updateTimeLeft = () => {
      const remaining = Math.max(0, Math.ceil((effectEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 100);

    return () => clearInterval(interval);
  }, [activeEffect, effectEndTime]);

  if (activeEffect === "NONE" || timeLeft === 0) return null;

  const effectConfig = {
    SPEED: { label: "SPEED", color: "text-yellow-400", bg: "bg-yellow-400/20" },
    GHOST: { label: "GHOST", color: "text-cyan-400", bg: "bg-cyan-400/20" },
  };

  const config = effectConfig[activeEffect as keyof typeof effectConfig];
  if (!config) return null;

  return (
    <div className={`px-3 py-1 rounded-full ${config.bg} ${config.color} font-bold text-sm animate-pulse`}>
      {config.label}: {timeLeft}s
    </div>
  );
}

function BeanLegend() {
  const beans = [
    { type: "NORMAL", color: "bg-red-500", icon: "●", label: "+10" },
    { type: "SPEED", color: "bg-yellow-500", icon: "⚡", label: "+15 Speed" },
    { type: "BONUS", color: "bg-purple-500", icon: "★", label: "+50" },
    { type: "GHOST", color: "bg-cyan-500", icon: "👻", label: "+20 Ghost" },
  ] as const;

  return (
    <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
      {beans.map((bean) => (
        <div key={bean.type} className="flex items-center gap-1">
          <div className={`w-4 h-4 ${bean.color} rounded-full flex items-center justify-center text-[10px]`}>
            {bean.icon}
          </div>
          <span>{bean.label}</span>
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-md mt-4">
      <h3 className="text-lg font-bold text-white mb-2 text-center">Leaderboard</h3>
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-400 font-medium">#</th>
              <th className="px-3 py-2 text-left text-gray-400 font-medium">Score</th>
              <th className="px-3 py-2 text-right text-gray-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(0, 5).map((entry, index) => (
              <tr key={entry.id} className="border-t border-gray-700/50">
                <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                <td className="px-3 py-2 text-green-400 font-bold">{entry.score}</td>
                <td className="px-3 py-2 text-right text-gray-400 text-xs">
                  {formatDate(entry.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SnakeGame() {
  const { gameData, startGame, pauseGame, resumeGame, restartGame, setDirection, score, leaderboard } = useGameLoop();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          setDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          setDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          setDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          setDirection("RIGHT");
          break;
        case " ":
          e.preventDefault();
          if (gameData.gameState === "PLAYING") {
            pauseGame();
          } else if (gameData.gameState === "PAUSED") {
            resumeGame();
          } else if (gameData.gameState === "START") {
            startGame();
          }
          break;
      }
    },
    [setDirection, gameData.gameState, pauseGame, resumeGame, startGame]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDPadPress = (direction: Direction) => {
    setDirection(direction);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Snake Game</h1>
        <p className="text-gray-400">Score: <span className="text-green-400 font-bold text-xl">{score}</span></p>
        <div className="mt-2">
          <EffectIndicator activeEffect={gameData.activeEffect} effectEndTime={gameData.effectEndTime} />
        </div>
      </div>

      <div className="w-full max-w-md">
        <GameBoard gameData={gameData} />
      </div>

      {gameData.gameState === "START" && (
        <div className="text-center">
          <button
            onClick={startGame}
            className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-xl transition-colors"
          >
            Start Game
          </button>
          <p className="text-gray-500 mt-4 text-sm">Use arrow keys or WASD to move</p>
          <Leaderboard entries={leaderboard} />
        </div>
      )}

      {gameData.gameState === "PAUSED" && (
        <div className="text-center">
          <p className="text-yellow-400 text-xl font-bold mb-4">PAUSED</p>
          <button
            onClick={resumeGame}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors"
          >
            Resume
          </button>
        </div>
      )}

      {gameData.gameState === "GAME_OVER" && (
        <div className="text-center">
          <p className="text-red-500 text-2xl font-bold mb-2">GAME OVER</p>
          <p className="text-gray-400 mb-4">Final Score: {score}</p>
          <button
            onClick={restartGame}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
          >
            Play Again
          </button>
          <Leaderboard entries={leaderboard} />
        </div>
      )}

      {gameData.gameState === "PLAYING" && (
        <button
          onClick={pauseGame}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Pause
        </button>
      )}

      <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
        <div />
        <button
          onClick={() => handleDPadPress("UP")}
          className="w-14 h-14 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg flex items-center justify-center text-2xl transition-colors"
        >
          ↑
        </button>
        <div />
        <button
          onClick={() => handleDPadPress("LEFT")}
          className="w-14 h-14 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg flex items-center justify-center text-2xl transition-colors"
        >
          ←
        </button>
        <button
          onClick={() => handleDPadPress("DOWN")}
          className="w-14 h-14 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg flex items-center justify-center text-2xl transition-colors"
        >
          ↓
        </button>
        <button
          onClick={() => handleDPadPress("RIGHT")}
          className="w-14 h-14 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg flex items-center justify-center text-2xl transition-colors"
        >
          →
        </button>
      </div>

      <div className="hidden md:block text-gray-500 text-sm">
        <p>Controls: Arrow keys or WASD to move, Space to pause</p>
      </div>

      <BeanLegend />
    </div>
  );
}
