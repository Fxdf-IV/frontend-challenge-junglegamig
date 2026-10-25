// Testes unitários para validação de cupons e cálculo de desconto/total da cotação.
import { describe, expect, it } from "vitest";
import { COUPONS } from "@/mocks/fixtures";
import { calculateQuoteTotals, resolveCoupon } from "./coupon";

describe("coupon rules", () => {
  it("aceita cupom válido ignorando espaços e caixa baixa", () => {
    const res = resolveCoupon("  kurio10 ", COUPONS);
    expect(res).toEqual({
      ok: true,
      coupon: { code: "KURIO10", bps: 1000, label: "10% de desconto de lançamento" },
    });
  });

  it("rejeita cupom inexistente e cupom expirado com códigos distintos", () => {
    expect(resolveCoupon("NAOEXISTE", COUPONS)).toEqual({
      ok: false,
      code: "COUPON_INVALID",
      message: "Cupom inválido",
    });
    expect(resolveCoupon("verao25", COUPONS)).toEqual({
      ok: false,
      code: "COUPON_EXPIRED",
      message: "Este cupom expirou",
    });
  });

  it("calcula desconto em basis points e soma taxa de rede sem ponto flutuante", () => {
    expect(calculateQuoteTotals("0.99", 1000, "0.0042")).toEqual({
      discount: "0.099",
      total: "0.8952",
    });
    expect(calculateQuoteTotals("0.99", undefined, "0.0042")).toEqual({
      discount: "0",
      total: "0.9942",
    });
  });
});
