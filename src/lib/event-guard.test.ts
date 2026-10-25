// Testes unitários para deduplicação e versão monotônica de eventos em tempo real.
import { describe, expect, it } from "vitest";
import { createEventGuard } from "./event-guard";

describe("createEventGuard", () => {
  it("aceita versões crescentes do mesmo recurso e rejeita eventId duplicado", () => {
    const fresh = createEventGuard();
    expect(
      fresh({ eventId: "ev_1", type: "nft.updated", resourceId: "golden-beat-207", version: 2 }),
    ).toBe(true);
    expect(
      fresh({ eventId: "ev_1", type: "nft.updated", resourceId: "golden-beat-207", version: 2 }),
    ).toBe(false);
    expect(
      fresh({ eventId: "ev_2", type: "nft.updated", resourceId: "golden-beat-207", version: 3 }),
    ).toBe(true);
  });

  it("rejeita eventos com versão igual ou inferior à última aplicada", () => {
    const fresh = createEventGuard();
    expect(
      fresh({ eventId: "ev_10", type: "order.updated", resourceId: "ord_1", version: 3 }),
    ).toBe(true);
    expect(
      fresh({ eventId: "ev_11", type: "order.updated", resourceId: "ord_1", version: 3 }),
    ).toBe(false);
    expect(
      fresh({ eventId: "ev_12", type: "order.updated", resourceId: "ord_1", version: 1 }),
    ).toBe(false);
  });

  it("isola controle de versão por tipo e por recurso", () => {
    const fresh = createEventGuard();
    expect(fresh({ eventId: "ev_a", type: "nft.updated", resourceId: "res_1", version: 5 })).toBe(
      true,
    );
    expect(fresh({ eventId: "ev_b", type: "order.updated", resourceId: "res_1", version: 1 })).toBe(
      true,
    );
    expect(fresh({ eventId: "ev_c", type: "nft.updated", resourceId: "res_2", version: 1 })).toBe(
      true,
    );
  });
});
