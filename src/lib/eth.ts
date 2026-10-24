/**
 * ETH amounts travel as decimal strings ("1.19") and are computed as bigint wei
 * to avoid floating point drift. Quantities are integers.
 */
const DECIMALS = 18n;
const SCALE = 10n ** DECIMALS;

export function toWei(value: string): bigint {
  const v = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(v)) throw new Error(`Invalid ETH amount: ${value}`);
  const neg = v.startsWith("-");
  const [int, frac = ""] = v.replace("-", "").split(".");
  const fracPadded = (frac + "0".repeat(18)).slice(0, 18);
  const wei = BigInt(int) * SCALE + BigInt(fracPadded);
  return neg ? -wei : wei;
}

export function fromWei(wei: bigint): string {
  const neg = wei < 0n;
  const abs = neg ? -wei : wei;
  const int = abs / SCALE;
  const frac = (abs % SCALE).toString().padStart(18, "0").replace(/0+$/, "");
  return `${neg ? "-" : ""}${int}${frac ? "." + frac : ""}`;
}

export const ethAdd = (...vals: string[]) => fromWei(vals.reduce((a, v) => a + toWei(v), 0n));
export const ethSub = (a: string, b: string) => fromWei(toWei(a) - toWei(b));
export const ethMul = (a: string, qty: number) => {
  if (!Number.isInteger(qty)) throw new Error("Quantity must be an integer");
  return fromWei(toWei(a) * BigInt(qty));
};
/** Multiply by basis points (e.g. 1000 = 10%), rounding down to wei. */
export const ethBps = (a: string, bps: number) => fromWei((toWei(a) * BigInt(bps)) / 10000n);
export const ethCmp = (a: string, b: string) => {
  const d = toWei(a) - toWei(b);
  return d === 0n ? 0 : d > 0n ? 1 : -1;
};

/** Presentation: fixed decimals, truncated (never rounds up a charge). */
export function formatEth(value: string, decimals = 2): string {
  const wei = toWei(value);
  const neg = wei < 0n;
  const abs = neg ? -wei : wei;
  const unit = 10n ** (DECIMALS - BigInt(decimals));
  const truncated = (abs / unit) * unit;
  let s = fromWei(truncated);
  const [i, f = ""] = s.split(".");
  s = decimals > 0 ? `${i}.${f.padEnd(decimals, "0")}` : i;
  return `${neg ? "-" : ""}${s} ETH`;
}

/** Shows up to 4 decimals but at least 2, without losing visible precision. */
export function formatEthSmart(value: string): string {
  const [, f = ""] = value.replace("-", "").split(".");
  return formatEth(value, Math.min(4, Math.max(2, f.length)));
}
