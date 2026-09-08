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

export type QuestionKind = "conceito" | "trace" | "completar";

export interface Question {
  id: number;
  diff: Difficulty;
  text: string;
  opts: string[];
  correct: number;
  explain: string;
  wrongFeedback?: Record<number, string>;
  kind?: QuestionKind;   // ausente = "conceito" (compatibilidade)
  code?: string;         // trecho de código exibido em bloco monoespaçado
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

export interface DiagnosticResult {
  topicId: string;
  correct: boolean;
}

// ─── Camada de ensino (lições) ───────────────────────────────────────────────

export interface LessonSection {
  heading: string;
  body: string;
}

export interface WorkedExample {
  title: string;
  code: string;
  steps: string[]; // explicação passo a passo
}

export interface Lesson {
  topicId: string;
  intro: string;
  sections: LessonSection[];
  example?: WorkedExample;
  keyPoints: string[];
}

export interface Recommendation {
  type: "revisar_prereq" | "reforçar_conceito" | "proximo_topico";
  topicId: string;
  label: string;
  reason: string;
  priority: number;
}
