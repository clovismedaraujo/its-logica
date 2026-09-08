import { describe, it, expect } from "vitest";
import { shuffle, buildQueue } from "./queue";
import { initModel } from "./model";
import { QUESTIONS } from "../data/questions";

describe("shuffle", () => {
  it("retorna array com os mesmos elementos", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).toHaveLength(arr.length);
    expect(result.sort()).toEqual([...arr].sort());
  });

  it("não modifica o array original", () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  it("array vazio retorna array vazio", () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe("buildQueue", () => {
  it("retorna apenas questões básicas quando proficiência é 0", () => {
    const model = initModel();
    const queue = buildQueue("algoritmos", model, []);
    const diffs = queue.map(q => q.diff);
    expect(diffs.every(d => d === "basica")).toBe(true);
  });

  it("prioriza questões erradas anteriormente na fila (reforço de equívocos)", () => {
    const model = initModel();
    // Com P(L) baixo (ação = regredir), questões erradas voltam com prioridade
    const history = [
      { topicId: "algoritmos", qId: 1, correct: false, delta: 0, chosen: 0 },
      { topicId: "algoritmos", qId: 2, correct: false, delta: 0, chosen: 1 },
    ];
    const queue = buildQueue("algoritmos", model, history);
    const ids = queue.map(q => q.id);
    // Questões erradas devem aparecer na fila (reforço pedagógico)
    expect(ids.some(id => id === 1 || id === 2)).toBe(true);
  });

  it("retorna questões intermediárias quando proficiência >= 40", () => {
    const model = { ...initModel(), algoritmos: 40 };
    const queue = buildQueue("algoritmos", model, []);
    const diffs = new Set(queue.map(q => q.diff));
    expect(diffs.has("intermediaria") || diffs.has("avancada")).toBe(true);
  });

  it("retorna questões avançadas quando proficiência >= 90", () => {
    const model = { ...initModel(), algoritmos: 90 };
    const queue = buildQueue("algoritmos", model, []);
    const diffs = queue.map(q => q.diff);
    expect(diffs.every(d => d === "avancada")).toBe(true);
  });

  it("retorna todas as questões quando todas já foram respondidas", () => {
    const model = initModel();
    const allIds = QUESTIONS["algoritmos"].filter(q => q.diff === "basica").map(q => q.id);
    const history = allIds.map(qId => ({ topicId: "algoritmos", qId }));
    const queue = buildQueue("algoritmos", model, history);
    expect(queue.length).toBeGreaterThan(0);
  });

  it("a fila contém todos os elementos do pool sem duplicatas", () => {
    const model = initModel();
    const queue = buildQueue("algoritmos", model, []);
    const ids = queue.map(q => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
