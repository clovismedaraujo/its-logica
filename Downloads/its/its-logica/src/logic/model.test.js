import { describe, it, expect } from "vitest";
import { initModel, isUnlocked, UNLOCK_THRESHOLD } from "./model";
import { TOPICS } from "../data/topics";

describe("initModel", () => {
  it("inicializa proficiência em 0 para todos os tópicos (P(L0) = 0)", () => {
    const model = initModel();
    TOPICS.forEach(t => {
      expect(model[t.id]).toBe(0);
    });
  });

  it("retorna um objeto com todos os tópicos", () => {
    const model = initModel();
    expect(Object.keys(model)).toHaveLength(TOPICS.length);
  });
});

describe("isUnlocked", () => {
  it("tópicos sem deps estão sempre desbloqueados", () => {
    const model = initModel();
    expect(isUnlocked("algoritmos", model)).toBe(true);
    expect(isUnlocked("variaveis", model)).toBe(true);
  });

  it("tópico com deps fica bloqueado se deps < threshold", () => {
    const model = initModel();
    expect(isUnlocked("entrada_saida", model)).toBe(false);
  });

  it("tópico com deps desbloqueia quando todas as deps atingem o threshold", () => {
    const model = { ...initModel(), algoritmos: UNLOCK_THRESHOLD, variaveis: UNLOCK_THRESHOLD };
    expect(isUnlocked("entrada_saida", model)).toBe(true);
  });

  it("tópico permanece bloqueado se apenas uma dep atingir o threshold", () => {
    const model = { ...initModel(), algoritmos: UNLOCK_THRESHOLD, variaveis: 0 };
    expect(isUnlocked("entrada_saida", model)).toBe(false);
  });

  it("condicionais requer operadores e variaveis no threshold", () => {
    const model = { ...initModel(), operadores: UNLOCK_THRESHOLD, variaveis: UNLOCK_THRESHOLD };
    expect(isUnlocked("condicionais", model)).toBe(true);
  });
});
