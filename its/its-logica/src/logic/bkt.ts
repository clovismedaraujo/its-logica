/**
 * Bayesian Knowledge Tracing (BKT)
 *
 * Estima P(L) — probabilidade de o aluno dominar um tópico —
 * com base no histórico de acertos e erros.
 *
 * Parâmetros por tópico:
 *   pL0 — probabilidade inicial de conhecer o tópico (prior)
 *   pT  — taxa de aprendizado: chance de aprender após cada tentativa
 *   pG  — probabilidade de acertar por chute (guess)
 *   pS  — probabilidade de errar mesmo sabendo (slip)
 */

export interface BKTParams {
  pL0: number;
  pT: number;
  pG: number;
  pS: number;
}

// Parâmetros calibrados por tópico
// pG = 0.25 para todos (4 alternativas → 1/4 de chance de chute)
export const TOPIC_BKT: Record<string, BKTParams> = {
  algoritmos:    { pL0: 0.0, pT: 0.04, pG: 0.25, pS: 0.08 },
  variaveis:     { pL0: 0.0, pT: 0.04, pG: 0.25, pS: 0.09 },
  entrada_saida: { pL0: 0.0, pT: 0.04, pG: 0.25, pS: 0.10 },
  operadores:    { pL0: 0.0, pT: 0.04, pG: 0.25, pS: 0.10 },
  condicionais:  { pL0: 0.0, pT: 0.03, pG: 0.25, pS: 0.10 },
  repeticao:     { pL0: 0.0, pT: 0.03, pG: 0.25, pS: 0.11 },
  funcoes:       { pL0: 0.0, pT: 0.03, pG: 0.25, pS: 0.12 },
  vetores:       { pL0: 0.0, pT: 0.03, pG: 0.25, pS: 0.12 },
};

const DEFAULT_BKT: BKTParams = { pL0: 0.10, pT: 0.10, pG: 0.25, pS: 0.10 };

export function getBKTParams(topicId: string): BKTParams {
  return TOPIC_BKT[topicId] ?? DEFAULT_BKT;
}

/**
 * Atualiza P(L) dado uma observação (acerto ou erro).
 *
 * 1. Posterior: P(L | obs) via Bayes
 * 2. Transição: adiciona oportunidade de aprendizado
 *
 * Retorna valor em 0–100 (P * 100) para compatibilidade com o restante do sistema.
 */
export function bktUpdate(currentValue: number, correct: boolean, topicId: string): number {
  const pL = currentValue / 100; // converte para probabilidade 0–1
  const { pT, pG, pS } = getBKTParams(topicId);

  // Posterior bayesiano
  const pLgivenObs = correct
    ? (pL * (1 - pS)) / (pL * (1 - pS) + (1 - pL) * pG)
    : (pL * pS)       / (pL * pS       + (1 - pL) * (1 - pG));

  // Transição só em acertos — erros atualizam a crença mas não adicionam aprendizado
  const pLnext = correct
    ? pLgivenObs + (1 - pLgivenObs) * pT
    : pLgivenObs;

  return Math.min(100, Math.max(0, pLnext * 100));
}

/**
 * Inicializa P(L) de um tópico com o prior P(L0).
 */
export function bktInitial(topicId: string): number {
  return (getBKTParams(topicId).pL0) * 100;
}

/**
 * Calcula o delta entre o valor atual e o novo após BKT update.
 * Usado apenas para exibição do feedback de proficiência.
 */
export function bktDelta(currentValue: number, correct: boolean, topicId: string): number {
  const next = bktUpdate(currentValue, correct, topicId);
  return Math.round(next - currentValue);
}
