import { useState, useCallback, useMemo } from "react";
import { initModel } from "../logic/model";
import { propagateSemanticInfluence, getRecommendations } from "../logic/pedagogy";
import type { Model, HistoryEntry, Recommendation } from "../types";

interface Feedback {
  correct: boolean;
  delta: number;
}

interface AnswerPayload {
  topicId: string;
  qId: number;
  correct: boolean;
  delta: number;
  chosen: number;
}

export function useProgress() {
  const [model, setModel] = useState<Model>(initModel);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastFeedback, setLastFeedback] = useState<Feedback | null>(null);

  const handleAnswer = useCallback(({ topicId, qId, correct, delta, chosen }: AnswerPayload) => {
    setModel(prev => {
      const next = {
        ...prev,
        [topicId]: Math.max(0, Math.min(100, (prev[topicId] ?? 0) + delta)),
      };
      return propagateSemanticInfluence(next, topicId);
    });
    setHistory(prev => [...prev, { topicId, qId, correct, delta, chosen }]);
    setLastFeedback({ correct, delta });
    setTimeout(() => setLastFeedback(null), 2500);
  }, []);

  const recommendations = useMemo<Recommendation[]>(
    () => getRecommendations(model),
    [model]
  );

  return { model, history, lastFeedback, handleAnswer, recommendations };
}
