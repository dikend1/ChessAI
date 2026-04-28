export type GameStatus = "playing" | "check" | "checkmate" | "draw" | "resigned";
export type GameMode = "pvp" | "ai" | "multiplayer";

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  color: "w" | "b";
  captured?: string;
}

export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

export interface HintMove {
  from: string;
  to: string;
  san: string;
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
  updatedAt: number;
}

export interface JoinRoomResult {
  ok: boolean;
  error?: string;
  playerColor?: "w" | "b";
}

export interface GameState {
  fen: string;
  history: MoveRecord[];
  status: GameStatus;
  currentTurn: "Белые" | "Чёрные";
  gameMode: GameMode;
  aiLevel: number;
  isAiThinking: boolean;
  hintMove: HintMove | null;
  roomId: string | null;
  room: MultiplayerRoom | null;
  multiplayerError: string | null;
  playerColor: "w" | "b" | null;
  setGameMode: (mode: GameMode) => void;
  setAiLevel: (level: number) => void;
  onDrop: (from: string, to: string) => boolean;
  resetGame: () => void;
  undoMove: () => boolean;
  resignGame: () => void;
  getHint: () => void;
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string) => Promise<JoinRoomResult>;
  leaveRoom: () => void;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  city: string;
  wins: number;
  games: number;
  updatedAt: number;
}

export interface SavedGameRecord {
  id?: string;
  userId: string;
  userName: string;
  mode: GameMode;
  status: GameStatus;
  result: "win" | "loss" | "draw" | "resigned" | "completed";
  winnerColor: "w" | "b" | null;
  playerColor: "w" | "b" | null;
  finalFen: string;
  moves: MoveRecord[];
  moveCount: number;
  roomId: string | null;
  city: string;
  createdAt: number;
}
