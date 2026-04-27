export type GameStatus = "playing" | "check" | "checkmate" | "draw";
export type GameMode = "pvp" | "ai" | "multiplayer";

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  color: "w" | "b";
}

export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

export interface MultiplayerRoom {
  id: string;
  hostId: string;
  guestId: string | null;
  hostName: string | null;
  guestName: string | null;
  fen: string;
  turn: "w" | "b";
  status: GameStatus;
  moves: MoveRecord[];
  createdAt: number;
}

export interface GameState {
  fen: string;
  history: MoveRecord[];
  status: GameStatus;
  currentTurn: "Белые" | "Чёрные";
  gameMode: GameMode;
  aiLevel: number;
  isAiThinking: boolean;
  roomId: string | null;
  playerColor: "w" | "b" | null;
  setGameMode: (mode: GameMode) => void;
  setAiLevel: (level: number) => void;
  onDrop: (from: string, to: string) => boolean;
  resetGame: () => void;
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string) => Promise<boolean>;
}