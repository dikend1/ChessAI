import { useEffect, useRef } from "react";
import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import GameToolbar from "./components/GameToolbar";
import MoveHistory from "./components/MoveHistory";
import AiControls from "./components/AiControls";
import AiCoach from "./components/AiCoach";
import AuthButton from "./components/AuthButton";
import AuthScreen from "./components/AuthScreen";
import Leaderboard from "./components/Leaderboard";
import MultiplayerControls from "./components/MultiplayerControls";
import ProPanel from "./components/ProPanel";
import { useChessGame } from "./hooks/useChessGame";
import { useAuth } from "./hooks/useAuth";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { useProFeatures } from "./hooks/useProFeatures";
import { useGameArchive } from "./hooks/useGameArchive";

export default function App() {
  const {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logOut,
  } = useAuth();
  const { isPro, upgradeToPro } = useProFeatures();
  const { cityName, entries, isLoading: isLeaderboardLoading, submitResult } = useLeaderboard();
  const { saveGame } = useGameArchive();
  const submittedResultRef = useRef("");
  const savedGameRef = useRef("");

  const {
    fen, history, status, onDrop, resetGame, currentTurn,
    gameMode, aiLevel, isAiThinking, hintMove, roomId, room, multiplayerError, playerColor,
    setGameMode, setAiLevel, createRoom, joinRoom, leaveRoom,
    undoMove, resignGame, getHint,
  } = useChessGame({
    userId: user?.uid ?? "guest",
    userName: user?.displayName || user?.email || "Игрок",
  });
  const currentLeaderboardEntry = entries.find((entry) => entry.userId === user?.uid);
  const modeLabel = gameMode === "multiplayer" ? "ONLINE" : gameMode.toUpperCase();
  const isGameOver = status === "checkmate" || status === "draw" || status === "resigned";
  const canUseGameActions = !isGameOver && !isAiThinking && gameMode !== "multiplayer";

  useEffect(() => {
    if (!user || (status !== "checkmate" && status !== "draw" && status !== "resigned")) return;

    const loser = fen.split(" ")[1];
    const winner = loser === "w" ? "b" : "w";
    const userWon = (gameMode === "ai" && winner === "w")
      || (gameMode === "multiplayer" && winner === playerColor);
    const resultKey = `${user.uid}-${status}-${history.length}-${fen}`;

    if (submittedResultRef.current === resultKey) return;

    submittedResultRef.current = resultKey;
    void submitResult({
      userId: user.uid,
      name: user.displayName || "Игрок",
      won: status === "checkmate" && userWon,
    });
  }, [fen, gameMode, history.length, playerColor, status, submitResult, user]);

  useEffect(() => {
    if (!user || history.length === 0) return;
    if (status !== "checkmate" && status !== "draw" && status !== "resigned") return;

    const resultKey = `${user.uid}-${status}-${history.length}-${fen}`;
    if (savedGameRef.current === resultKey) return;

    const loser = fen.split(" ")[1];
    const winnerColor = status === "checkmate" ? (loser === "w" ? "b" : "w") : null;
    const archivePlayerColor = playerColor ?? (gameMode === "ai" ? "w" : null);
    const result = status === "draw"
      ? "draw"
      : status === "resigned"
        ? "resigned"
        : archivePlayerColor
          ? winnerColor === archivePlayerColor ? "win" : "loss"
          : "completed";

    savedGameRef.current = resultKey;
    void saveGame({
      userId: user.uid,
      userName: user.displayName || user.email || "Игрок",
      mode: gameMode,
      status,
      result,
      winnerColor,
      playerColor: archivePlayerColor,
      finalFen: fen,
      moves: history,
      moveCount: history.length,
      roomId,
      city: cityName,
    });
  }, [cityName, fen, gameMode, history, playerColor, roomId, saveGame, status, user]);

  if (loading) {
    return (
      <div className="app-page flex min-h-screen items-center justify-center">
        <p className="animate-pulse font-display text-2xl text-board-accent">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onGoogleSignIn={signInWithGoogle}
        onEmailSignIn={signInWithEmail}
        onEmailRegister={registerWithEmail}
      />
    );
  }

  return (
    <div className="app-page min-h-screen font-body">
      <header className="border-b border-board-accent/15 bg-[var(--surface-soft)] px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-board-accent/40 bg-board-accent/10 text-2xl text-board-accent">
              ♔
            </div>
            <div>
              <h1 className="font-display text-3xl text-board-accent tracking-tight">
                Chess AI
              </h1>
              <p className="text-board-muted text-xs tracking-widest uppercase">
                Command Center
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ProPanel
              isPro={isPro}
              onUpgrade={upgradeToPro}
            />
            <AuthButton
              user={user}
              onSignOut={logOut}
              stats={{
                city: cityName,
                games: currentLeaderboardEntry?.games ?? 0,
                wins: currentLeaderboardEntry?.wins ?? 0,
                moves: history.length,
                mode: gameMode,
                aiLevel,
                isPro,
              }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 xl:grid-cols-[280px_minmax(520px,1fr)_340px]">
        <aside className="space-y-4 xl:order-1">
          <section className="app-card rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-board-muted">Матч</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-board-accent/15 bg-[var(--page)] p-3">
                <p className="text-lg font-semibold text-app">{history.length}</p>
                <p className="text-[10px] uppercase tracking-widest text-board-muted">ходов</p>
              </div>
              <div className="rounded-xl border border-board-accent/15 bg-[var(--page)] p-3">
                <p className="truncate text-lg font-semibold text-app">{modeLabel}</p>
                <p className="text-[10px] uppercase tracking-widest text-board-muted">режим</p>
              </div>
              <div className="rounded-xl border border-board-accent/15 bg-[var(--page)] p-3">
                <p className="text-lg font-semibold text-board-accent">{aiLevel}</p>
                <p className="text-[10px] uppercase tracking-widest text-board-muted">AI</p>
              </div>
            </div>
          </section>

          <GameInfo
            status={status}
            currentTurn={currentTurn}
            onReset={resetGame}
          />
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
              room={room}
              multiplayerError={multiplayerError}
              playerColor={playerColor}
              onCreateRoom={createRoom}
              onJoinRoom={joinRoom}
              onLeaveRoom={leaveRoom}
            />
          ) : null}
        </aside>

        <section className="space-y-4 xl:order-2">
          <div className="app-card rounded-3xl p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-board-muted">Live board</p>
                <h2 className="font-display text-2xl text-board-accent">Партия</h2>
              </div>
              <span className="rounded-full border border-board-accent/30 px-3 py-1 text-xs uppercase tracking-widest text-board-accent">
                {isAiThinking ? "AI думает" : "Ready"}
              </span>
            </div>
            <div className="flex justify-center">
              <Board
                fen={fen}
                history={history}
                gameMode={gameMode}
                playerColor={playerColor}
                onDrop={onDrop}
                status={status}
                isAIThinking={isAiThinking}
                orientation={playerColor === "b" ? "black" : "white"}
                hintMove={hintMove}
              />
            </div>
            <GameToolbar
              canHint={canUseGameActions}
              canUndo={canUseGameActions && history.length > 0}
              canResign={!isGameOver}
              onHint={getHint}
              onUndo={undoMove}
              onResign={resignGame}
            />
          </div>
        </section>

        <aside className="space-y-4 xl:order-3">
          <Leaderboard
            cityName={cityName}
            entries={entries}
            isLoading={isLeaderboardLoading}
          />

          <AiCoach
            finalFen={fen}
            gameMode={gameMode}
            history={history}
            status={status}
          />
          <MoveHistory history={history} />
        </aside>
      </main>

      <footer className="border-t border-board-accent/15 bg-[var(--surface-soft)] px-5 py-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col justify-between gap-2 border-board-accent/10 pt-4 text-xs text-board-muted sm:flex-row">
            <span>Chess AI Command Center</span>
            <span>Профиль, тренировки, AI Coach и онлайн-партии</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
