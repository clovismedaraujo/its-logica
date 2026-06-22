import { TOPICS } from "../data/topics";
import { QUESTIONS } from "../data/questions";
import type { Model, HistoryEntry, Difficulty, Misconception } from "../types";

export const GAIN: Record<Difficulty, number> = { basica: 10, intermediaria: 15, avancada: 20 };
export const LOSS = 5;
export const UNLOCK_THRESHOLD = 70;
export const ADVANCED_THRESHOLD = 90;

export function initModel(): Model {
  return Object.fromEntries(TOPICS.map(t => [t.id, 0]));
}

export function isUnlocked(topicId: string, model: Model): boolean {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) return false;
  return topic.deps.every(dep => (model[dep] ?? 0) >= UNLOCK_THRESHOLD);
}

export function getMisconceptions(history: HistoryEntry[]): Misconception[] {
  const wrong = history.filter(h => !h.correct);

  const counts: Record<string, { entry: HistoryEntry; count: number }> = {};
  for (const h of wrong) {
    const key = `${h.topicId}::${h.qId}::${h.chosen}`;
    if (!counts[key]) counts[key] = { entry: h, count: 0 };
    counts[key].count++;
  }

  return Object.values(counts)
    .map(({ entry, count }) => {
      const qs = QUESTIONS[entry.topicId] ?? [];
      const q = qs.find(q => q.id === entry.qId);
      if (!q) return null;
      return {
        topicId: entry.topicId,
        qId: entry.qId,
        questionText: q.text,
        chosenText: q.opts[entry.chosen] ?? "?",
        correctText: q.opts[q.correct] ?? "?",
        count,
      } satisfies Misconception;
    })
    .filter((m): m is Misconception => m !== null)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
