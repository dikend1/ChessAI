import { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  isPro: boolean;
  onUpgrade: () => void;
}

export default function ProPanel({ isPro, onUpgrade }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpgrade = () => {
    onUpgrade();
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full border border-board-accent/40 bg-board-accent/10 px-4 py-2
                     text-xs font-bold uppercase tracking-[0.14em] text-board-accent
                     transition-all duration-200 hover:bg-board-accent hover:text-[#1a1a2e]"
        >
          {isPro ? "Pro" : "Upgrade"}
        </button>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative z-[10000] w-full max-w-lg rounded-2xl border border-board-accent/30 bg-[#0b1020] p-5 text-[#e9edf8] shadow-2xl shadow-yellow-500/10">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-3 text-3xl leading-none text-slate-400 transition-colors hover:text-white"
              aria-label="Закрыть"
            >
              ×
            </button>

            <div className="flex items-center gap-4 pr-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
                <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path
                    d="M9 36h30M12 32l-3-19 9 8 6-12 6 12 9-8-3 19H12z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-yellow-400">
                  Chess AI Pro
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Больше анализа, тренировки и быстрый рост
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border-2 border-yellow-500/60 bg-[#1b1c26] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">Pro</p>
                  <p className="mt-2 text-4xl font-bold">
                    $4.99<span className="text-lg font-normal text-slate-400">/мес</span>
                  </p>
                </div>
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase text-black">
                  Топ
                </span>
              </div>

              <ul className="mt-5 grid gap-3 text-sm text-slate-100">
                {[
                  "Безлимитный AI Coach",
                  "Расширенный разбор ошибок",
                  "Глубокая аналитика партий",
                  "Приоритетные онлайн-комнаты",
                ].map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="text-yellow-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleUpgrade}
              className="mt-5 w-full rounded-xl bg-yellow-400 px-5 py-4 text-base font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(250,204,21,0.35)] transition hover:brightness-110"
            >
              Upgrade to Pro
            </button>

            <p className="mt-3 text-center text-xs text-slate-600">
              Можно отменить в любой момент
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
