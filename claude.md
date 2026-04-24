# Snake Game Project

## Overview
A polished client-side Snake game built with Next.js. Features randomized obstacle layouts, multiple special bean types, persistent local leaderboard, and responsive controls for desktop and mobile.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React hooks (useState, useEffect, useCallback)
- **Storage**: localStorage for leaderboard persistence

## Architecture
- Client-side game using React hooks for state management
- Game loop driven by `requestAnimationFrame` with controlled tick rate
- Grid-based board representation (20x20 cells)
- Modular component structure separating game logic from UI

## Directory Layout
```
/workspace/test2/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main game page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── GameBoard.tsx      # Game grid rendering
│   ├── SnakeGame.tsx      # Main game container
│   └── DPad.tsx           # Mobile touch controls
├── hooks/                 # Custom React hooks
│   └── useGameLoop.ts     # Game tick management
├── types/                 # TypeScript types
│   └── game.ts            # Game type definitions
├── lib/                   # Utility functions
│   └── gameLogic.ts       # Game state logic
├── public/                # Static assets
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Code Conventions
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Types**: Explicit TypeScript types for all game entities
- **Imports**: React hooks first, then components, then utilities
- **Error Handling**: Graceful fallbacks for localStorage operations
- **CSS**: Tailwind utility classes, no custom CSS unless necessary

## Testing Strategy
- Manual testing for game mechanics
- Responsive design tested via browser dev tools
- localStorage persistence verified across page reloads
