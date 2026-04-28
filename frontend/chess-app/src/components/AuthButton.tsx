import { useState } from "react";
import type { User } from "../types/chess";

interface Props {
  user: User | null;
  onSignOut: () => void;
  stats: {
    city: string;
    games: number;
    wins: number;
    moves: number;
    mode: string;
    aiLevel: number;
    isPro: boolean;
  };
}

export default function AuthButton({ user, onSignOut, stats }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (user) {
    const fallbackName = user.displayName || user.email || "Player";
    const initials = fallbackName.slice(0, 1).toUpperCase();

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen((current) => !current)}
          className="flex items-center gap-3 rounded-xl border border-board-accent/20 bg-[var(--surface)] px-3 py-2 transition hover:border-board-accent/50"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="h-9 w-9 rounded-full border border-board-accent/50"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-board-accent/50 bg-board-accent/15 text-sm font-bold text-board-accent">
              {initials}
            </div>
          )}
          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-32 truncate text-sm font-medium text-app">{fallbackName}</p>
            <p className="text-[11px] uppercase tracking-widest text-board-muted">Профиль</p>
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-14 z-40 w-80 rounded-2xl border border-board-accent/20 bg-[#111827] p-4 text-app shadow-2xl">
            <div className="flex items-center gap-3 border-b border-board-accent/10 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-board-accent/50 bg-board-accent/15 text-base font-bold text-board-accent">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{fallbackName}</p>
                <p className="truncate text-xs text-board-muted">{user.email}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#0b1020] p-3">
                <p className="text-xl font-bold text-board-accent">{stats.wins}</p>
                <p className="text-[10px] uppercase tracking-widest text-board-muted">побед</p>
              </div>
              <div className="rounded-xl bg-[#0b1020] p-3">
                <p className="text-xl font-bold text-board-accent">{stats.games}</p>
                <p className="text-[10px] uppercase tracking-widest text-board-muted">игр</p>
              </div>
              <div className="rounded-xl bg-[#0b1020] p-3">
                <p className="text-xl font-bold text-board-accent">{stats.moves}</p>
                <p className="text-[10px] uppercase tracking-widest text-board-muted">ходов</p>
              </div>
              <div className="rounded-xl bg-[#0b1020] p-3">
                <p className="text-xl font-bold text-board-accent">{stats.aiLevel}</p>
                <p className="text-[10px] uppercase tracking-widest text-board-muted">AI</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-board-accent/10 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-board-muted">Город</span>
                <span>{stats.city}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-board-muted">Режим</span>
                <span>{stats.mode.toUpperCase()}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-board-muted">Подписка</span>
                <span className={stats.isPro ? "text-board-accent" : ""}>
                  {stats.isPro ? "Pro" : "Free"}
                </span>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="mt-4 w-full rounded-xl border border-board-muted/30 px-3 py-2 text-sm text-board-muted transition hover:border-white/40 hover:text-app"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
