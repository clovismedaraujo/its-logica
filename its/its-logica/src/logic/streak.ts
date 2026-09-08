/**
 * Sequência de acertos (streak)
 *
 * Deriva do histórico — não precisa de estado novo:
 *   - current: acertos consecutivos contando do fim (zera no último erro)
 *   - best: maior sequência de acertos já alcançada na sessão
 */

import type { HistoryEntry } from "../types";

export interface Streak {
  current: number;
  best: number;
}

export function getStreak(history: HistoryEntry[]): Streak {
  // Sequência atual: acertos consecutivos a partir do fim
  let current = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].correct) current++;
    else break;
  }

  // Melhor sequência: maior corrida de acertos no histórico
  let best = 0;
  let run = 0;
  for (const h of history) {
    if (h.correct) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }

  return { current, best };
}

/**
 * Mensagem celebrativa para marcos de sequência (5, 10, 15...).
 * Retorna null fora dos marcos.
 */
export function streakMilestone(streak: number): string | null {
  if (streak >= 10 && streak % 5 === 0) return `🔥 Imparável! ${streak} acertos seguidos!`;
  if (streak === 10) return "🔥 Dez em sequência! Você está dominando!";
  if (streak === 5) return "🔥 Cinco seguidos! Mandou bem!";
  if (streak === 3) return "🔥 Três em sequência! Engatou!";
  return null;
}
