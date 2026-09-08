import type { Topic, LevelColor } from "../types";

export const TOPICS: Topic[] = [
  {
    id: "algoritmos",
    label: "Algoritmos",
    level: 1,
    deps: [],
    relations: [],
  },
  {
    id: "variaveis",
    label: "Variáveis e tipos",
    level: 1,
    deps: [],
    relations: [
      { type: "relacionado", target: "algoritmos" },
    ],
  },
  {
    id: "entrada_saida",
    label: "Entrada e saída",
    level: 2,
    deps: ["algoritmos", "variaveis"],
    relations: [
      { type: "requer", target: "algoritmos" },
      { type: "requer", target: "variaveis" },
      { type: "usa_conceito", target: "algoritmos" },
    ],
  },
  {
    id: "operadores",
    label: "Operadores",
    level: 2,
    deps: ["variaveis"],
    relations: [
      { type: "requer", target: "variaveis" },
      { type: "usa_conceito", target: "algoritmos" },
    ],
  },
  {
    id: "condicionais",
    label: "Condicionais",
    level: 3,
    deps: ["operadores", "variaveis"],
    relations: [
      { type: "requer", target: "operadores" },
      { type: "requer", target: "variaveis" },
      { type: "usa_conceito", target: "algoritmos" },
      { type: "usa_conceito", target: "entrada_saida" },
    ],
  },
  {
    id: "repeticao",
    label: "Laços de repetição",
    level: 4,
    deps: ["condicionais"],
    relations: [
      { type: "requer", target: "condicionais" },
      { type: "usa_conceito", target: "operadores" },
      { type: "usa_conceito", target: "variaveis" },
    ],
  },
  {
    id: "funcoes",
    label: "Funções",
    level: 5,
    deps: ["repeticao"],
    relations: [
      { type: "requer", target: "repeticao" },
      { type: "usa_conceito", target: "variaveis" },
      { type: "usa_conceito", target: "entrada_saida" },
      { type: "usa_conceito", target: "algoritmos" },
      { type: "relacionado", target: "vetores" },
    ],
  },
  {
    id: "vetores",
    label: "Vetores e matrizes",
    level: 5,
    deps: ["repeticao", "variaveis"],
    relations: [
      { type: "requer", target: "repeticao" },
      { type: "requer", target: "variaveis" },
      { type: "usa_conceito", target: "operadores" },
      { type: "usa_conceito", target: "entrada_saida" },
      { type: "relacionado", target: "funcoes" },
    ],
  },
];

export const LEVEL_COLORS: Record<number, LevelColor> = {
  1: { bg: "#E6F1FB", border: "#185FA5", text: "#0C447C", label: "Nível 1 — Base" },
  2: { bg: "#EAF3DE", border: "#3B6D11", text: "#27500A", label: "Nível 2 — Primeiros passos" },
  3: { bg: "#FAEEDA", border: "#854F0B", text: "#633806", label: "Nível 3 — Núcleo lógico" },
  4: { bg: "#FAECE7", border: "#993C1D", text: "#712B13", label: "Nível 4 — Repetição" },
  5: { bg: "#EEEDFE", border: "#534AB7", text: "#3C3489", label: "Nível 5 — Avançado" },
};
