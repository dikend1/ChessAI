interface Props {
  canUndo: boolean;
  canHint: boolean;
  canResign: boolean;
  onHint: () => void;
  onUndo: () => void;
  onResign: () => void;
}

function ToolbarIcon({ children }: { children: string }) {
  return <span className="text-lg leading-none">{children}</span>;
}

export default function GameToolbar({
  canUndo,
  canHint,
  canResign,
  onHint,
  onUndo,
  onResign,
}: Props) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <button
        onClick={onHint}
        disabled={!canHint}
        className="rounded-xl border border-board-accent/35 bg-board-accent/10 px-3 py-3 text-sm font-semibold text-board-accent transition hover:bg-board-accent hover:text-[#101423] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-board-accent/10 disabled:hover:text-board-accent"
      >
        <span className="flex items-center justify-center gap-2">
          <ToolbarIcon>?</ToolbarIcon>
          Подсказка
        </span>
      </button>

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="rounded-xl border border-board-accent/20 bg-[var(--page)] px-3 py-3 text-sm font-semibold text-board-muted transition hover:border-board-accent/50 hover:text-app disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-board-accent/20 disabled:hover:text-board-muted"
      >
        <span className="flex items-center justify-center gap-2">
          <ToolbarIcon>↶</ToolbarIcon>
          Отмена
        </span>
      </button>

      <button
        onClick={onResign}
        disabled={!canResign}
        className="rounded-xl border border-rose-400/45 bg-rose-500/10 px-3 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rose-500/10"
      >
        <span className="flex items-center justify-center gap-2">
          <ToolbarIcon>⚑</ToolbarIcon>
          Сдаться
        </span>
      </button>
    </div>
  );
}
