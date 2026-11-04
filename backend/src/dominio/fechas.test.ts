import { describe, expect, it } from "vitest";
import { limiteHasta } from "./fechas";

describe("limiteHasta", () => {
  it("incluye el día civil completo cuando hasta viene como fecha", () => {
    expect(limiteHasta("2026-11-02").toISOString()).toBe("2026-11-02T23:59:59.999Z");
  });

  it("respeta un instante que ya trae hora", () => {
    expect(limiteHasta("2026-11-02T15:00:00.000Z").toISOString()).toBe("2026-11-02T15:00:00.000Z");
  });
});
