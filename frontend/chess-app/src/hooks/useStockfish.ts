import { useEffect, useRef, useCallback } from 'react'
import stockfishWorkerUrl from "stockfish/bin/stockfish-18-asm.js?url";

interface UseStockfishProps {
  onBestMove: (move: string) => void
  difficulty?: number
}

export function useStockfish({ onBestMove, difficulty = 10 }: UseStockfishProps) {
  const engineRef = useRef<Worker | null>(null)
  const isReadyRef = useRef(false);
  const pendingGoRef = useRef<{ fen: string; level?: number } | null>(null);

  const getDepth = useCallback((level = difficulty) => {
    const safeLevel = Number.isFinite(level) ? level : difficulty;
    return Math.max(1, Math.round(safeLevel * 0.75));
  }, [difficulty]);

  useEffect(() => {
    const engine = new Worker(stockfishWorkerUrl);

    engine.onmessage = (e: MessageEvent) => {
      const msg: string = e.data
      
      if (msg === "readyok") {
        isReadyRef.current = true;
        if (pendingGoRef.current) {
          const { fen, level } = pendingGoRef.current;
          pendingGoRef.current = null;
          const depth = getDepth(level);
          engine.postMessage(`position fen ${fen}`);
          engine.postMessage(`go depth ${depth}`);
        }
      }

      if (msg.startsWith('bestmove')) {
        const move = msg.split(' ')[1]
        if (move && move !== '(none)') {
          onBestMove(move)
        }
      }
    }
    engine.onerror = (error) => {
      console.error("Stockfish worker error:", error);
    };

    isReadyRef.current = false;
    engine.postMessage('uci')
    engine.postMessage('isready')
    engineRef.current = engine

    return () => {
      isReadyRef.current = false;
      pendingGoRef.current = null;
      engine.terminate();
    }
  }, [getDepth, onBestMove])

  const getBestMove = useCallback((fen: string, level?: number) => {
    const depth = getDepth(level);

    if (!isReadyRef.current) {
      pendingGoRef.current = { fen, level };
      return;
    }

    engineRef.current?.postMessage(`position fen ${fen}`);
    engineRef.current?.postMessage(`go depth ${depth}`);
  }, [getDepth]);

  return { getBestMove }
}
