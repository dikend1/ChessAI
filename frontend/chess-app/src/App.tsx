import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import MoveHistory from "./components/MoveHistory";
import AiControls from "./components/AiControls";
import AuthButton from "./components/AuthButton";
import MultiplayerControls from "./components/MultiplayerControls";
import { useChessGame } from "./hooks/useChessGame";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, loading, signIn, logOut } = useAuth();

  const {
    fen, history, status, onDrop, resetGame, currentTurn,
    gameMode, aiLevel, isAiThinking, roomId, playerColor,
    setGameMode, setAiLevel, createRoom, joinRoom,
  } = useChessGame({ userId: user?.uid ?? "guest" });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        <p className="animate-pulse font-display text-2xl text-board-accent">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] px-4 py-10 font-body">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 bg-[#16213e]/80 p-8 text-center shadow-2xl backdrop-blur-xl">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-board-muted">
              Добро пожаловать
            </p>
            <h1 className="font-display text-5xl tracking-tight text-board-accent">
              Chess AI
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-board-muted">
              Войди через Google, чтобы играть онлайн, создавать комнаты и сохранять свой профиль.
            </p>

            <div className="mt-8 flex justify-center">
              <AuthButton user={user} onSignIn={signIn} onSignOut={logOut} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center p-6 font-body">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-board-accent tracking-tight">
            Chess AI
          </h1>
          <p className="text-board-muted text-xs tracking-widest uppercase">
            Play & Learn
          </p>
        </div>
        <AuthButton user={user} onSignIn={signIn} onSignOut={logOut} />
      </header>

      {/* Main */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <Board fen={fen} onDrop={onDrop} status={status} isAIThinking={isAiThinking} />

        <div className="w-full lg:w-56 space-y-4">
          <AiControls
            gameMode={gameMode}
            aiLevel={aiLevel}
            isAiThinking={isAiThinking}
            onSetMode={setGameMode}
            onSetLevel={setAiLevel}
          />

          {gameMode === "multiplayer" || !roomId ? (
            <MultiplayerControls
              roomId={roomId}
              playerColor={playerColor}
              onCreateRoom={createRoom}
              onJoinRoom={joinRoom}
            />
          ) : null}

          <GameInfo
            status={status}
            currentTurn={currentTurn}
            onReset={resetGame}
          />
          <MoveHistory history={history} />
        </div>
      </div>
    </div>
  );
}