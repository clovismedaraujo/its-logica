/**
 * Diagnóstico inicial
 *
 * Antes de praticar, o sistema faz uma sondagem curta (uma questão por tópico)
 * para *semear* o modelo do aluno — em vez de começar tudo em 0%.
 * É um recurso clássico de ITS: estimar o conhecimento prévio para personalizar
 * o ponto de partida.
 */

import { TOPICS } from "../data/topics";
import { QUESTIONS } from "../data/questions";
import { initModel } from "./model";
import type { Question, Model, DiagnosticResult } from "../types";

export interface DiagnosticItem {
  topicId: string;
  topicLabel: string;
  question: Question;
}

// Estimativa semeada a partir do diagnóstico (não é domínio — é ponto de partida)
export const SEED_CORRECT = 50; // acertou a sondagem → já tem uma base
export const SEED_WRONG = 15;   // errou → conhecimento inicial

/**
 * Monta o diagnóstico: uma questão conceitual básica por tópico.
 */
export function buildDiagnostic(): DiagnosticItem[] {
  const items: DiagnosticItem[] = [];
  for (const topic of TOPICS) {
    const qs = QUESTIONS[topic.id] ?? [];
    // Preferir questões conceituais básicas (sem código) para a sondagem
    const basics = qs.filter(q => q.diff === "basica" && !q.kind);
    const pool = basics.length ? basics : qs;
    if (!pool.length) continue;
    const q = pool[Math.floor(Math.random() * pool.length)];
    items.push({ topicId: topic.id, topicLabel: topic.label, question: q });
  }
  return items;
}

/**
 * Converte os resultados do diagnóstico em estimativas de proficiência.
 */
export function seedFromAnswers(results: DiagnosticResult[]): Model {
  const model = initModel(); // tudo em 0
  for (const r of results) {
    model[r.topicId] = r.correct ? SEED_CORRECT : SEED_WRONG;
  }
  return model;
}
