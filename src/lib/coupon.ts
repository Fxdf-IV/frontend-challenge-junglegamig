// Regras puras de validação de cupom promocional e cálculo de desconto e total em ETH.
import { ethAdd, ethBps, ethSub } from "./eth";

/** Definição de um cupom promocional no catálogo. */
export interface CouponDefinition {
  bps: number;
  label: string;
  expired?: boolean;
}

/** Resultado da validação de um código de cupom. */
export type CouponLookupResult =
  | { ok: true; coupon?: { code: string; bps: number; label: string } }
  | { ok: false; code: "COUPON_INVALID" | "COUPON_EXPIRED"; message: string };

/**
 * Normaliza e valida um código de cupom contra o catálogo de cupons configurado.
 */
export function resolveCoupon(
  rawCode: string | undefined,
  catalog: Record<string, CouponDefinition>,
): CouponLookupResult {
  const normalized = rawCode?.trim().toUpperCase();
  if (!normalized) return { ok: true, coupon: undefined };
  const entry = catalog[normalized];
  if (!entry) {
    return { ok: false, code: "COUPON_INVALID", message: "Cupom inválido" };
  }
  if (entry.expired) {
    return { ok: false, code: "COUPON_EXPIRED", message: "Este cupom expirou" };
  }
  return {
    ok: true,
    coupon: { code: normalized, bps: entry.bps, label: entry.label },
  };
}

/**
 * Calcula desconto em basis points e total final em ETH (subtotal - desconto + taxa de rede).
 */
export function calculateQuoteTotals(
  subtotal: string,
  couponBps: number | undefined,
  networkFee: string,
): { discount: string; total: string } {
  const discount = couponBps ? ethBps(subtotal, couponBps) : "0";
  const total = ethAdd(ethSub(subtotal, discount), networkFee);
  return { discount, total };
}
