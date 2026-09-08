import { QUESTIONS } from "../data/questions";
import { ADVANCED_THRESHOLD, UNLOCK_THRESHOLD } from "./model";
import { getPedagogyAction } from "./pedagogy";
import type { Question, HistoryEntry, Model } from "../types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQueue(topicId: string, model: Model, history: HistoryEntry[]): Question[] {
  const qs: Question[] = QUESTIONS[topicId] ?? [];
  const pL = model[topicId] ?? 0;
  const answered = history.filter(h => h.topicId === topicId).map(h => h.qId);
  const wrongQIds = new Set(
    history.filter(h => h.topicId === topicId && !h.correct).map(h => h.qId)
  );

  const action = getPedagogyAction(pL);

  // Seleciona pool por ação pedagógica
  let pool: Question[];
  if (action === "regredir") {
    // P(L) < 30%: voltar ao básico independente de já ter respondido
    pool = qs.filter(q => q.diff === "basica");
    if (!pool.length) pool = qs;
  } else if (action === "reforçar") {
    // P(L) 30–60%: básica + intermediária, excluindo já acertadas
    const correctIds = new Set(history.filter(h => h.topicId === topicId && h.correct).map(h => h.qId));
    pool = qs.filter(q =>
      (q.diff === "basica" || q.diff === "intermediaria") && !correctIds.has(q.id)
    );
    if (!pool.length) pool = qs.filter(q => q.diff === "basica" || q.diff === "intermediaria");
  } else if (pL >= ADVANCED_THRESHOLD) {
    pool = qs.filter(q => q.diff === "avancada" && !answered.includes(q.id));
    if (!pool.length) pool = qs.filter(q => !answered.includes(q.id));
  } else {
    pool = qs.filter(q =>
      (q.diff === "intermediaria" || q.diff === "avancada") && !answered.includes(q.id)
    );
    if (!pool.length) pool = qs.filter(q => !answered.includes(q.id));
  }

  const finalPool = pool.length ? pool : qs;
  const shuffled = shuffle(finalPool);

  // Equívocos (erradas anteriormente) reaparecem a cada 3 questões
  const priority = shuffled.filter(q => wrongQIds.has(q.id));
  const rest = shuffled.filter(q => !wrongQIds.has(q.id));

  const result: Question[] = [];
  let pi = 0;
  for (let i = 0; i < rest.length; i++) {
    result.push(rest[i]);
    if ((i + 1) % 3 === 0 && pi < priority.length) result.push(priority[pi++]);
  }
  while (pi < priority.length) result.push(priority[pi++]);

  return result;
}

/**
 * Monta uma fila intercalada com questões de múltiplos tópicos desbloqueados.
 * Implementa o princípio de interleaving — prática intercalada entre tópicos.
 */
export function buildInterleavedQueue(model: Model, history: HistoryEntry[], unlockedTopics: string[]): Question[] {
  const queues = unlockedTopics
    .filter(id => (model[id] ?? 0) < UNLOCK_THRESHOLD) // apenas tópicos não dominados
    .map(id => buildQueue(id, model, history).slice(0, 5)); // 5 questões por tópico

  // Intercala: 1 de cada tópico em rodadas
  const result: Question[] = [];
  const maxLen = Math.max(0, ...queues.map(q => q.length));
  for (let i = 0; i < maxLen; i++) {
    for (const q of queues) {
      if (q[i]) result.push(q[i]);
    }
  }
  return result;
}
