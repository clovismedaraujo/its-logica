export type Difficulty = "basica" | "intermediaria" | "avancada";

export type RelationType = "requer" | "usa_conceito" | "relacionado";

export interface Relation {
  type: RelationType;
  target: string;
}

export interface Topic {
  id: string;
  label: string;
  level: 1 | 2 | 3 | 4 | 5;
  deps: string[]; // mantido para compatibilidade (= relações "requer")
  relations: Relation[];
}

export interface Question {
  id: number;
  diff: Difficulty;
  text: string;
  opts: string[];
  correct: number;
  explain: string;
  wrongFeedback?: Record<number, string>;
}

export interface HistoryEntry {
  topicId: string;
  qId: number;
  correct: boolean;
  delta: number;
  chosen: number;
}

export type Model = Record<string, number>; // valor = P(L) * 100, i.e. 0–100

export interface LevelColor {
  bg: string;
  border: string;
  text: string;
  label: string;
}

export interface Misconception {
  topicId: string;
  qId: number;
  questionText: string;
  chosenText: string;
  correctText: string;
  count: number;
}

export type PedagogyAction = "regredir" | "reforçar" | "avançar" | "desbloquear";

export interface Recommendation {
  type: "revisar_prereq" | "reforçar_conceito" | "proximo_topico";
  topicId: string;
  label: string;
  reason: string;
  priority: number;
}
