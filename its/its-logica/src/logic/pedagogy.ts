/**
 * Modelo Pedagógico
 *
 * Traduz o estado do aluno (BKT + rede semântica) em ações concretas:
 *   - Qual ação tomar (regredir, reforçar, avançar, desbloquear)
 *   - Que feedback contextual mostrar após uma resposta
 *   - Quais recomendações proativas oferecer
 */

import { TOPICS } from "../data/topics";
import { isUnlocked, UNLOCK_THRESHOLD } from "./model";
import type { Model, PedagogyAction, Recommendation } from "../types";

// ─── Decisão de ação ────────────────────────────────────────────────────────

export function getPedagogyAction(pL100: number): PedagogyAction {
  if (pL100 < 30) return "regredir";
  if (pL100 < 60) return "reforçar";
  if (pL100 < 85) return "avançar";
  return "desbloquear";
}

// ─── Feedback contextual ─────────────────────────────────────────────────────

export function getPedagogyFeedback(pL100: number, correct: boolean): string {
  if (correct) {
    if (pL100 < 40)  return "Acerto! Mas esse conceito ainda precisa de mais prática para se consolidar.";
    if (pL100 < 65)  return "Bom progresso! Você está desenvolvendo domínio desse conceito.";
    if (pL100 < 85)  return "Muito bem! Você demonstra domínio sólido desse tópico.";
    return "Perfeito! Você domina esse conceito com alta confiança.";
  } else {
    if (pL100 > 70) return "Parece um deslize — você normalmente domina esse conceito. Continue!";
    if (pL100 > 40) return "Esse conceito ainda está se consolidando. Revise e tente novamente.";
    return "Esse conceito precisa de mais atenção. Revise o material base antes de continuar.";
  }
}

// ─── Recomendações proativas ─────────────────────────────────────────────────

export function getRecommendations(model: Model): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const topic of TOPICS) {
    const pL = model[topic.id] ?? 0;
    if (!isUnlocked(topic.id, model)) continue;

    // 1. Usa conceito de outro tópico com P(L) baixo → revisar base
    for (const rel of topic.relations) {
      if (rel.type !== "usa_conceito") continue;
      const relPL = model[rel.target] ?? 0;
      const relTopic = TOPICS.find(t => t.id === rel.target);
      if (!relTopic) continue;

      if (pL < 60 && relPL < 50) {
        recs.push({
          type: "revisar_prereq",
          topicId: rel.target,
          label: relTopic.label,
          reason: `${topic.label} (${Math.round(pL)}%) usa conceitos de ${relTopic.label} (${Math.round(relPL)}%) — reforçar a base pode acelerar seu progresso.`,
          priority: (60 - pL) + (50 - relPL),
        });
      }
    }

    // 2. Tópico com P(L) médio-baixo → reforçar
    if (pL > 0 && pL < 45) {
      recs.push({
        type: "reforçar_conceito",
        topicId: topic.id,
        label: topic.label,
        reason: `${topic.label} (${Math.round(pL)}%) ainda não está consolidado. Mais prática vai ajudar.`,
        priority: 45 - pL,
      });
    }

    // 3. Tópico quase dominado → sugerir próximo
    if (pL >= UNLOCK_THRESHOLD) {
      for (const rel of topic.relations) {
        if (rel.type !== "requer") continue;
        const nextTopic = TOPICS.find(t => t.deps.includes(topic.id) && !isUnlocked(t.id, model));
        if (!nextTopic) continue;
        const nextPL = model[nextTopic.id] ?? 0;
        if (nextPL === 0) {
          recs.push({
            type: "proximo_topico",
            topicId: nextTopic.id,
            label: nextTopic.label,
            reason: `Você domina ${topic.label} (${Math.round(pL)}%). Que tal começar ${nextTopic.label}?`,
            priority: pL - UNLOCK_THRESHOLD,
          });
        }
      }
    }
  }

  // Remove duplicatas por topicId, mantém maior prioridade
  const seen = new Set<string>();
  return recs
    .sort((a, b) => b.priority - a.priority)
    .filter(r => {
      if (seen.has(r.topicId)) return false;
      seen.add(r.topicId);
      return true;
    })
    .slice(0, 3);
}

// ─── Propagação semântica ─────────────────────────────────────────────────────

/**
 * Após atualizar o tópico respondido via BKT, propaga uma influência suave
 * pelas relações "usa_conceito" da rede semântica.
 *
 * Se o aluno vai mal num tópico que usa conceito de outro,
 * o modelo reduz levemente a estimativa do tópico base (5% de influência).
 * Isso reflete que lacunas conceituais impactam tópicos dependentes.
 */
export function propagateSemanticInfluence(model: Model, changedTopicId: string): Model {
  const updated = { ...model };
  const pL_changed = updated[changedTopicId] / 100;
  const INFLUENCE = 0.05;

  for (const topic of TOPICS) {
    for (const rel of topic.relations) {
      if (rel.type === "usa_conceito" && rel.target === changedTopicId) {
        const pL_dep = updated[topic.id] / 100;
        // Se o tópico-base caiu abaixo de 0.5, aplica pressão descendente leve no dependente
        if (pL_changed < 0.5) {
          const adjustment = (pL_changed - 0.5) * INFLUENCE;
          updated[topic.id] = Math.min(100, Math.max(0, (pL_dep + adjustment) * 100));
        }
      }
    }
  }

  return updated;
}
