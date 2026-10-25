// Operações matemáticas e formatação de valores em ETH utilizando BigInt em wei.
// Garante precisão arbitrária sem desvios de arredondamento de ponto flutuante (IEEE 754).
const DECIMALS = 18n;
const SCALE = 10n ** DECIMALS;

/** Converte uma representação decimal em string de ETH para seu valor em wei (BigInt). */
export function toWei(value: string): bigint {
  const v = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(v)) throw new Error(`Invalid ETH amount: ${value}`);
  const neg = v.startsWith("-");
  const [int, frac = ""] = v.replace("-", "").split(".");
  const fracPadded = (frac + "0".repeat(18)).slice(0, 18);
  const wei = BigInt(int) * SCALE + BigInt(fracPadded);
  return neg ? -wei : wei;
}

/** Converte uma quantia em wei (BigInt) para string decimal formatada em ETH. */
export function fromWei(wei: bigint): string {
  const neg = wei < 0n;
  const abs = neg ? -wei : wei;
  const int = abs / SCALE;
  const frac = (abs % SCALE).toString().padStart(18, "0").replace(/0+$/, "");
  return `${neg ? "-" : ""}${int}${frac ? "." + frac : ""}`;
}

/** Soma valores decimais de ETH preservando precisão exata em wei. */
export const ethAdd = (...vals: string[]) => fromWei(vals.reduce((a, v) => a + toWei(v), 0n));

/** Subtrai o valor `b` de `a` em ETH. */
export const ethSub = (a: string, b: string) => fromWei(toWei(a) - toWei(b));

/** Multiplica uma quantia decimal de ETH por uma quantidade inteira de itens. */
export const ethMul = (a: string, qty: number) => {
  if (!Number.isInteger(qty)) throw new Error("Quantity must be an integer");
  return fromWei(toWei(a) * BigInt(qty));
};

/** Multiplica uma quantia de ETH por basis points (1 bps = 0.01%, ex.: 1000 = 10%), arredondando para baixo em wei. */
export const ethBps = (a: string, bps: number) => fromWei((toWei(a) * BigInt(bps)) / 10000n);

/** Compara dois valores decimais em ETH. Retorna 0 se iguais, 1 se a > b, ou -1 se a < b. */
export const ethCmp = (a: string, b: string) => {
  const d = toWei(a) - toWei(b);
  return d === 0n ? 0 : d > 0n ? 1 : -1;
};

/** Formatação de exibição: casas decimais fixas truncadas (nunca arredonda cobrança para cima). */
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

/** Formata exibindo entre 2 e 4 casas decimais conforme a precisão significativa disponível. */
export function formatEthSmart(value: string): string {
  const [, f = ""] = value.replace("-", "").split(".");
  return formatEth(value, Math.min(4, Math.max(2, f.length)));
}
