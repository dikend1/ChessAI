# Chess AI

Chess AI Command Center is a web chess app with authentication, Stockfish AI, online rooms, a city leaderboard, saved game history, and a Claude-powered AI Coach for post-game analysis.

## Screenshots

Place the screenshots in `docs/screenshots/` with these names:

![Auth screen](docs/screenshots/auth-screen.png)

![Main game screen](docs/screenshots/game-screen.png)

![Profile menu](docs/screenshots/profile-menu.png)

![Pro upgrade modal](docs/screenshots/pro-modal.png)

## Features

- Email/password authentication
- Google authentication
- Player profile menu with city, games, wins, moves, mode, AI level, and Pro status
- Local player-vs-player chess
- Player-vs-AI chess powered by Stockfish
- Online multiplayer rooms through Firebase Realtime Database
- Room validation for missing, occupied, and already-started rooms
- Board orientation for black/white players
- Move history with white/black columns
- Hint, undo, and resign controls under the board
- Fixed Almaty city leaderboard
- Completed game archive saved to Firebase
- AI Coach after checkmate or draw through Claude API
- Pro upgrade modal UI
- Dark command-center UI

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- chess.js
- react-chessboard
- Stockfish worker
- Firebase Authentication
- Firebase Realtime Database
- Claude API through a serverless API route

## Project Structure

```txt
frontend/chess-app/
  api/
    ai-coach.js              # Serverless Claude API endpoint
  src/
    components/              # UI components
    hooks/                   # Auth, chess, multiplayer, leaderboard, archive logic
    lib/                     # Firebase and AI Coach client helpers
    types/                   # Shared TypeScript types
    App.tsx                  # Main app layout and wiring
    main.tsx                 # React entry point
    index.css                # Tailwind and app-level styles
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create local env file:

```bash
cp .env.example .env
```

Start development server:

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```txt
http://localhost:5173
```

## Environment Variables

Create `frontend/chess-app/.env`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

For AI Coach, configure these only on the server/deploy provider:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-sonnet-4-5
```

Do not expose `ANTHROPIC_API_KEY` in client-side code.

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication.
3. Enable Email/Password sign-in provider.
4. Enable Google sign-in provider.
5. Create a Realtime Database.
6. Copy Firebase web app config into `.env`.
7. Make sure `VITE_FIREBASE_DATABASE_URL` points to your Realtime Database URL.

The app uses these Realtime Database paths:

```txt
rooms/{roomId}
leaderboards/cities/almaty/{userId}
users/{userId}/games/{gameId}
```

For local MVP testing, your database rules must allow authenticated users to read/write these paths.

## Claude AI Coach Setup

The frontend sends finished game data to:

```txt
/api/ai-coach
```

The API route calls Claude with `ANTHROPIC_API_KEY` and returns a short Russian chess analysis.

AI Coach becomes available after:

- checkmate
- draw

It uses:

- final FEN
- move list
- game mode
- game status

## Available Scripts

Run development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Preview production build:

```bash
npm run preview
```

## Multiplayer Flow

1. Player A creates a room.
2. Player A copies the room ID.
3. Player B opens the app in another browser/account.
4. Player B pastes the room ID and joins.
5. White moves first.
6. Moves are synced through Firebase Realtime Database.

The app blocks joining if:

- room does not exist
- room is already occupied
- game has already started

## Leaderboard

The leaderboard is fixed to:

```txt
Almaty, Kazakhstan
```

It tracks:

- total games
- wins
- latest update time

Wins are counted only after a user wins by checkmate. Games are counted after completed results.

## Game Archive

Completed games are saved under:

```txt
users/{userId}/games/{gameId}
```

Saved data includes:

- final FEN
- moves
- mode
- status
- result
- player color
- room ID
- city
- created timestamp

## Notes

- Stockfish runs in a browser worker.
- AI hints and undo are disabled in multiplayer.
- Pro is currently a local UI state stored in localStorage.
- Payment is not connected yet.
- AI Coach requires a deployed serverless API route or compatible local API setup.
