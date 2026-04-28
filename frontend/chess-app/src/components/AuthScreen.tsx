import { useState } from "react";

interface Props {
  onGoogleSignIn: () => Promise<void>;
  onEmailSignIn: (input: { email: string; password: string }) => Promise<void>;
  onEmailRegister: (input: {
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<void>;
}

type AuthMode = "login" | "register";

function GoogleIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function AuthScreen({ onGoogleSignIn, onEmailSignIn, onEmailRegister }: Props) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await onEmailRegister({ email, password, displayName });
      } else {
        await onEmailSignIn({ email, password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await onGoogleSignIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google вход не сработал.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page min-h-screen px-4 py-10 font-body text-white">
      <div className="mx-auto flex min-h-[86vh] w-full max-w-5xl flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Chess AI Command Center</p>
          <h1 className="mt-3 font-display text-5xl text-board-accent">Chess AI</h1>
        </div>

        <div className="w-full max-w-3xl rounded-lg border border-blue-900/80 bg-[#111728]/95 p-6 shadow-2xl shadow-black/40 sm:p-10">
          <div className="mb-8 grid grid-cols-2 rounded-xl border border-blue-900/50 bg-[#0b1020] p-1">
            <button
              onClick={() => setMode("login")}
              className={`rounded-lg py-3 text-sm font-bold uppercase tracking-[0.2em] transition ${
                mode === "login" ? "bg-board-accent text-black" : "text-slate-400 hover:text-white"
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-lg py-3 text-sm font-bold uppercase tracking-[0.2em] transition ${
                mode === "register" ? "bg-board-accent text-black" : "text-slate-400 hover:text-white"
              }`}
            >
              Регистрация
            </button>
          </div>

          <div className="space-y-6">
            {isRegister && (
              <label className="block">
                <span className="mb-3 block text-sm font-bold uppercase tracking-[0.22em] text-slate-400">
                  Имя
                </span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Commander"
                  className="auth-input"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-3 block text-sm font-bold uppercase tracking-[0.22em] text-slate-400">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="commander@chess.kz"
                className="auth-input"
              />
            </label>

            <label className="block">
              <span className="mb-3 block text-sm font-bold uppercase tracking-[0.22em] text-slate-400">
                Пароль
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="auth-input"
              />
            </label>

            {error && (
              <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !email || !password}
              className="w-full rounded-lg bg-board-accent px-5 py-5 text-2xl font-bold uppercase tracking-[0.18em] text-black shadow-[0_0_28px_rgba(226,185,111,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "..." : isRegister ? "Создать аккаунт" : "Войти"}
            </button>
          </div>

          <div className="my-8 flex items-center gap-6 text-slate-500">
            <div className="h-px flex-1 bg-blue-900/70" />
            <span className="text-sm uppercase tracking-[0.25em]">или</span>
            <div className="h-px flex-1 bg-blue-900/70" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-4 rounded-lg border border-blue-800 px-5 py-5 text-xl font-bold uppercase tracking-[0.18em] text-slate-100 transition hover:border-board-accent hover:bg-board-accent/10 disabled:opacity-50"
          >
            <GoogleIcon />
            Войти через Google
          </button>
        </div>
      </div>
    </div>
  );
}
