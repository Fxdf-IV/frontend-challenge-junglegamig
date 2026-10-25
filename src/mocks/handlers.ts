// Handlers REST que mantêm o estado determinístico do marketplace de demonstração.
import { delay, http, HttpResponse, type DefaultBodyType, type HttpResponseResolver } from "msw";
import type {
  ApiErrorBody,
  Cart,
  EditionKind,
  Network,
  Nft,
  NftListResponse,
  Order,
  Quote,
  QuoteIssue,
  ScenarioId,
  Session,
  User,
  Wallet,
} from "@/api/types";
import { ethAdd, ethBps, ethCmp, ethMul, ethSub } from "@/lib/eth";
import { validateProfileMetadata } from "@/lib/profile-metadata";
import {
  COLLECTION_LABELS,
  COUPONS,
  NETWORK_FEES,
  NETWORK_LABELS,
  type UserRecord,
} from "./fixtures";
import { cartFor, db, refreshCart, resetDb, save, sha256 } from "./db";
import { dropConnections, emitNftUpdated, emitOrderUpdated, replay } from "./realtime";

const API = "/api";
const SESSION_TTL = 30 * 60_000;
const SHORT_TTL = 20_000;

type ErrCode = ApiErrorBody["error"]["code"];
function err(
  status: number,
  code: ErrCode,
  message: string,
  extra: Partial<ApiErrorBody["error"]> = {},
) {
  return HttpResponse.json<ApiErrorBody>({ error: { code, message, ...extra } }, { status });
}

/** Wraps every resolver with configurable latency and failure scenarios. */
function withScenario<P extends Record<string, string>, B extends DefaultBodyType>(
  resolver: HttpResponseResolver<P, B>,
  opts: { kind?: "read" | "write"; dev?: boolean } = {},
): HttpResponseResolver<P, B> {
  return async (info) => {
    const s = db();
    if (opts.dev) return resolver(info);
    const n = ++s.counters.requests;
    const sc = s.scenario;
    if (sc === "slow") await delay(1800);
    else if (sc === "jitter") await delay(100 + ((n * 7919) % 1400));
    else await delay(120 + ((n * 31) % 180));
    if (sc === "offline") return HttpResponse.error();
    if (sc === "flaky" && n % 3 === 0)
      return err(503, "UNAVAILABLE", "Serviço temporariamente indisponível");
    return resolver(info);
  };
}

function userPublic(u: UserRecord): User {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    username: u.username,
    avatar: u.avatar,
    bio: u.bio,
    ensName: u.ensName,
    walletNickname: u.walletNickname,
  };
}

/** Returns the user id for the bearer token or an error response. */
function auth(request: Request): { userId: string } | { res: Response } {
  const h = request.headers.get("authorization");
  const token = h?.startsWith("Bearer ") ? h.slice(7) : undefined;
  if (!token) return { res: err(401, "UNAUTHORIZED", "Faça login para continuar") };
  const sess = db().sessions[token];
  if (!sess) return { res: err(401, "SESSION_EXPIRED", "Sua sessão expirou") };
  if (sess.expiresAt < Date.now()) {
    delete db().sessions[token];
    save();
    return { res: err(401, "SESSION_EXPIRED", "Sua sessão expirou") };
  }
  return { userId: sess.userId };
}

function newSession(userId: string): Session {
  const token = `tok_${crypto.randomUUID()}`;
  const ttl = db().scenario === "session-expired" ? SHORT_TTL : SESSION_TTL;
  const expiresAt = Date.now() + ttl;
  db().sessions[token] = { userId, expiresAt };
  save();
  const u = db().users.find((x) => x.id === userId)!;
  return { token, expiresAt: new Date(expiresAt).toISOString(), user: userPublic(u) };
}

function cartKey(request: Request): string | null {
  const a = auth(request);
  if ("userId" in a) return `user:${a.userId}`;
  const guest = request.headers.get("x-cart-id");
  return guest && /^guest_[\w-]{6,}$/.test(guest) ? guest : null;
}

function bumpNft(nft: Nft) {
  nft.version += 1;
  nft.price = nft.editions.reduce(
    (m, e) => (ethCmp(e.price, m) < 0 ? e.price : m),
    nft.editions[0].price,
  );
  emitNftUpdated(nft);
}

async function buildQuote(
  cart: Cart,
  couponCode: string | undefined,
  network: Network,
): Promise<Quote | Response> {
  refreshCart(cart);
  const s = db();
  const issues: QuoteIssue[] = [];
  const lines = cart.items.map((it) => {
    const nft = s.nfts.find((n) => n.id === it.nftId)!;
    const ed = nft.editions.find((e) => e.kind === it.edition)!;
    if (ed.available === 0)
      issues.push({
        nftId: it.nftId,
        edition: it.edition,
        code: "SOLD_OUT",
        message: `${nft.name} (${it.edition}) esgotou`,
      });
    else if (ed.available < it.quantity)
      issues.push({
        nftId: it.nftId,
        edition: it.edition,
        code: "INSUFFICIENT",
        message: `${nft.name}: apenas ${ed.available} disponível(is)`,
      });
    return {
      nftId: it.nftId,
      edition: it.edition,
      name: nft.name,
      image: nft.image,
      quantity: it.quantity,
      unitPrice: ed.price,
      lineTotal: ethMul(ed.price, it.quantity),
      available: ed.available,
    };
  });
  const subtotal = lines.length ? ethAdd(...lines.map((l) => l.lineTotal)) : "0";
  let coupon: Quote["coupon"];
  if (couponCode) {
    const c = COUPONS[couponCode.trim().toUpperCase()];
    if (!c)
      return err(422, "COUPON_INVALID", "Cupom inválido", { fields: { coupon: "Cupom inválido" } });
    if (c.expired)
      return err(422, "COUPON_EXPIRED", "Este cupom expirou", {
        fields: { coupon: "Este cupom expirou" },
      });
    coupon = { code: couponCode.trim().toUpperCase(), bps: c.bps, label: c.label };
  }
  const discount = coupon ? ethBps(subtotal, coupon.bps) : "0";
  const networkFee = lines.length ? NETWORK_FEES[network] : "0";
  const total = ethAdd(ethSub(subtotal, discount), networkFee);
  const fingerprint = JSON.stringify({
    lines: lines.map((l) => [l.nftId, l.edition, l.quantity, l.unitPrice]),
    coupon: coupon?.code,
    networkFee,
    network,
  });
  const id = `q_${(await sha256(fingerprint)).slice(0, 16)}`;
  return {
    id,
    lines,
    coupon,
    subtotal,
    discount,
    networkFee,
    total,
    issues,
    network,
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  };
}

function publicOrder(o: DbOrder): Order {
  const { userId: _u, resolveAt: _r, outcome: _o, ...rest } = o;
  return rest;
}
type DbOrder = ReturnType<typeof db>["orders"][string];

/** Finaliza um pedido pendente uma vez e aplica os efeitos confirmados ou recusados. */
export function resolveOrder(id: string) {
  const s = db();
  const o = s.orders[id];
  if (!o || o.status !== "pending" || o.resolveAt > Date.now()) return;
  if (o.outcome === "confirmed") {
    // re-check availability at settlement
    const short = o.lines.find((l) => {
      const ed = s.nfts.find((n) => n.id === l.nftId)?.editions.find((e) => e.kind === l.edition);
      return !ed || ed.available < l.quantity;
    });
    if (short) {
      o.status = "declined";
      o.declineReason = `Disponibilidade insuficiente para ${short.name}`;
    } else {
      o.status = "confirmed";
      o.txHash = `0x${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`;
      o.explorerUrl = `https://etherscan.io/tx/${o.txHash}`;
      const cart = cartFor(`user:${o.userId}`);
      for (const l of o.lines) {
        const nft = s.nfts.find((n) => n.id === l.nftId)!;
        const ed = nft.editions.find((e) => e.kind === l.edition)!;
        ed.available -= l.quantity;
        bumpNft(nft);
        const ci = cart.items.find((c) => c.nftId === l.nftId && c.edition === l.edition);
        if (ci) {
          ci.quantity -= l.quantity;
          if (ci.quantity <= 0) cart.items = cart.items.filter((c) => c !== ci);
        }
      }
      cart.version++;
    }
  } else {
    o.status = "declined";
    o.declineReason = "Pagamento recusado pela carteira";
  }
  o.version += 1;
  o.updatedAt = new Date().toISOString();
  save();
  emitOrderUpdated(publicOrder(o), o.userId);
}

/** Agenda a resolução das compras pendentes persistidas no mock. */
export function schedulePendingOrders() {
  for (const o of Object.values(db().orders)) {
    if (o.status === "pending")
      setTimeout(() => resolveOrder(o.id), Math.max(0, o.resolveAt - Date.now()) + 10);
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[a-z0-9_.]{3,20}$/;
const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const EVM = /^0x[0-9a-fA-F]{40}$/;
const SOL = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function validateWallet(body: Partial<Wallet>) {
  const fields: Record<string, string> = {};
  if (!body.label || body.label.trim().length < 2)
    fields.label = "Informe um nome com ao menos 2 caracteres";
  if (!body.network || !(body.network in NETWORK_LABELS)) fields.network = "Selecione a rede";
  if (!body.provider || !["metamask", "walletconnect", "coinbase"].includes(body.provider))
    fields.provider = "Selecione o tipo de carteira";
  if (!body.address) fields.address = "Informe o endereço";
  else if (body.network === "solana" ? !SOL.test(body.address) : !EVM.test(body.address))
    fields.address = "Endereço inválido para a rede selecionada";
  return fields;
}

/** Rotas REST simuladas consumidas pelo cliente HTTP da aplicação. */
export const handlers = [
  // ---------- NFTs ----------
  http.get(
    `${API}/nfts`,
    withScenario(({ request }) => {
      const s = db();
      if (s.scenario === "server-error")
        return err(500, "UNAVAILABLE", "Falha ao carregar o catálogo");
      const u = new URL(request.url);
      const q = u.searchParams.get("q")?.toLowerCase().trim() ?? "";
      const collections = u.searchParams.getAll("collection");
      const networks = u.searchParams.getAll("network");
      const min = u.searchParams.get("min");
      const max = u.searchParams.get("max");
      const sort = u.searchParams.get("sort") ?? "recent";
      const tab = u.searchParams.get("tab") ?? "all";
      const page = Math.max(1, Number(u.searchParams.get("page") ?? 1) || 1);
      const pageSize = Math.min(48, Math.max(1, Number(u.searchParams.get("pageSize") ?? 9) || 9));
      const base = s.scenario === "empty" ? [] : s.nfts;
      const matchText = (n: Nft) =>
        !q ||
        n.name.toLowerCase().includes(q) ||
        n.creator.toLowerCase().includes(q) ||
        n.collectionName.toLowerCase().includes(q);
      const matchPrice = (n: Nft) =>
        (!min || ethCmp(n.price, min) >= 0) && (!max || ethCmp(n.price, max) <= 0);
      const matchTab = (n: Nft) => tab !== "new" || n.isNew;
      const pre = base.filter((n) => matchText(n) && matchPrice(n) && matchTab(n));
      let items = pre.filter(
        (n) =>
          (!collections.length || collections.includes(n.collection)) &&
          (!networks.length || networks.includes(n.network)),
      );
      const facetC = Object.entries(COLLECTION_LABELS).map(([value, label]) => ({
        value,
        label,
        count: pre.filter(
          (n) => n.collection === value && (!networks.length || networks.includes(n.network)),
        ).length,
      }));
      const facetN = Object.entries(NETWORK_LABELS).map(([value, label]) => ({
        value,
        label,
        count: pre.filter(
          (n) => n.network === value && (!collections.length || collections.includes(n.collection)),
        ).length,
      }));
      items = [...items].sort((a, b) => {
        if (tab === "trending" && sort === "recent") return b.trending - a.trending;
        if (sort === "price-asc") return ethCmp(a.price, b.price);
        if (sort === "price-desc") return ethCmp(b.price, a.price);
        if (sort === "name") return a.name.localeCompare(b.name);
        return b.listedAt.localeCompare(a.listedAt);
      });
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const res: NftListResponse = {
        items: items.slice((page - 1) * pageSize, page * pageSize),
        page,
        pageSize,
        total,
        totalPages,
        facets: {
          collections: facetC,
          networks: facetN,
          priceRange: { min: "0.02", max: "12.30" },
        },
      };
      return HttpResponse.json(res);
    }),
  ),
  http.get(
    `${API}/nfts/:id`,
    withScenario(({ params }) => {
      const nft = db().nfts.find((n) => n.id === params.id);
      if (!nft) return err(404, "NOT_FOUND", "NFT não encontrado");
      return HttpResponse.json(nft);
    }),
  ),

  // ---------- Auth ----------
  http.post(
    `${API}/auth/register`,
    withScenario(async ({ request }) => {
      const b = (await request.json()) as {
        displayName?: string;
        email?: string;
        username?: string;
        password?: string;
      };
      const fields: Record<string, string> = {};
      if (!b.displayName || b.displayName.trim().length < 2)
        fields.displayName = "Informe seu nome";
      if (!b.email || !EMAIL.test(b.email)) fields.email = "E-mail inválido";
      if (!b.username || !USERNAME.test(b.username))
        fields.username = "Use 3–20 letras minúsculas, números, _ ou .";
      if (!b.password || !PASSWORD.test(b.password))
        fields.password = "Mínimo 8 caracteres com letras e números";
      if (Object.keys(fields).length)
        return err(422, "VALIDATION", "Verifique os campos", { fields });
      const s = db();
      const conflict: Record<string, string> = {};
      if (s.users.some((u) => u.email.toLowerCase() === b.email!.toLowerCase()))
        conflict.email = "Este e-mail já está cadastrado";
      if (s.users.some((u) => u.username === b.username))
        conflict.username = "Este nome de usuário já está em uso";
      if (Object.keys(conflict).length)
        return err(409, "CONFLICT", "Conta já existente", { fields: conflict });
      const id = `u_${crypto.randomUUID().slice(0, 8)}`;
      const salt = `salt-${id}`;
      s.users.push({
        id,
        email: b.email!.toLowerCase(),
        displayName: b.displayName!.trim(),
        username: b.username!,
        salt,
        passwordHash: await sha256(salt + b.password),
      });
      s.wallets[id] = [];
      s.favorites[id] = [];
      return HttpResponse.json(newSession(id), { status: 201 });
    }),
  ),
  http.post(
    `${API}/auth/login`,
    withScenario(async ({ request }) => {
      const b = (await request.json()) as { email?: string; password?: string };
      if (!b.email || !EMAIL.test(b.email) || !b.password)
        return err(422, "VALIDATION", "Informe e-mail e senha", {
          fields: {
            ...(!b.email || !EMAIL.test(b.email) ? { email: "E-mail inválido" } : {}),
            ...(!b.password ? { password: "Informe a senha" } : {}),
          },
        });
      const u = db().users.find((x) => x.email === b.email!.toLowerCase());
      if (!u || (await sha256(u.salt + b.password)) !== u.passwordHash)
        return err(401, "UNAUTHORIZED", "E-mail ou senha incorretos");
      return HttpResponse.json(newSession(u.id));
    }),
  ),
  http.get(
    `${API}/auth/session`,
    withScenario(({ request }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      const token = request.headers.get("authorization")!.slice(7);
      const u = db().users.find((x) => x.id === a.userId)!;
      return HttpResponse.json<Session>({
        token,
        expiresAt: new Date(db().sessions[token].expiresAt).toISOString(),
        user: userPublic(u),
      });
    }),
  ),
  http.post(
    `${API}/auth/logout`,
    withScenario(({ request }) => {
      const token = request.headers.get("authorization")?.slice(7);
      if (token) delete db().sessions[token];
      save();
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  // ---------- Favorites ----------
  http.get(
    `${API}/favorites`,
    withScenario(({ request }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      return HttpResponse.json({ ids: db().favorites[a.userId] ?? [] });
    }),
  ),
  http.put(
    `${API}/favorites/:id`,
    withScenario(({ request, params }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      if (db().scenario === "favorite-fail")
        return err(500, "UNAVAILABLE", "Não foi possível salvar o favorito");
      if (!db().nfts.some((n) => n.id === params.id))
        return err(404, "NOT_FOUND", "NFT não encontrado");
      const list = (db().favorites[a.userId] ??= []);
      if (!list.includes(params.id as string)) list.push(params.id as string);
      save();
      return HttpResponse.json({ ids: list });
    }),
  ),
  http.delete(
    `${API}/favorites/:id`,
    withScenario(({ request, params }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      if (db().scenario === "favorite-fail")
        return err(500, "UNAVAILABLE", "Não foi possível remover o favorito");
      db().favorites[a.userId] = (db().favorites[a.userId] ?? []).filter((x) => x !== params.id);
      save();
      return HttpResponse.json({ ids: db().favorites[a.userId] });
    }),
  ),

  // ---------- Cart ----------
  http.get(
    `${API}/cart`,
    withScenario(({ request }) => {
      const key = cartKey(request);
      if (!key) return err(400, "VALIDATION", "Carrinho não identificado");
      const cart = refreshCart(cartFor(key));
      save();
      return HttpResponse.json(cart);
    }),
  ),
  http.post(
    `${API}/cart/items`,
    withScenario(async ({ request }) => {
      const key = cartKey(request);
      if (!key) return err(400, "VALIDATION", "Carrinho não identificado");
      const b = (await request.json()) as { nftId: string; edition: EditionKind; quantity: number };
      const nft = db().nfts.find((n) => n.id === b.nftId);
      const ed = nft?.editions.find((e) => e.kind === b.edition);
      if (!nft || !ed) return err(404, "NOT_FOUND", "NFT ou edição inexistente");
      if (!Number.isInteger(b.quantity) || b.quantity < 1)
        return err(422, "VALIDATION", "Quantidade inválida");
      const cart = cartFor(key);
      const existing = cart.items.find((i) => i.nftId === b.nftId && i.edition === b.edition);
      const nextQty = (existing?.quantity ?? 0) + b.quantity;
      const limit = Math.min(ed.available, ed.maxPerOrder);
      if (ed.available === 0) return err(409, "AVAILABILITY", "Esta edição está esgotada");
      if (nextQty > limit)
        return err(409, "AVAILABILITY", `Limite de ${limit} unidade(s) para esta edição`);
      if (existing) existing.quantity = nextQty;
      else
        cart.items.push({
          nftId: nft.id,
          edition: ed.kind,
          quantity: b.quantity,
          name: nft.name,
          image: nft.image,
          network: nft.network,
          unitPrice: ed.price,
          available: ed.available,
          maxPerOrder: ed.maxPerOrder,
        });
      cart.version++;
      save();
      return HttpResponse.json(refreshCart(cart));
    }),
  ),
  http.patch(
    `${API}/cart/items`,
    withScenario(async ({ request }) => {
      const key = cartKey(request);
      if (!key) return err(400, "VALIDATION", "Carrinho não identificado");
      const b = (await request.json()) as { nftId: string; edition: EditionKind; quantity: number };
      const cart = cartFor(key);
      const it = cart.items.find((i) => i.nftId === b.nftId && i.edition === b.edition);
      if (!it) return err(404, "NOT_FOUND", "Item não está no carrinho");
      const ed = db()
        .nfts.find((n) => n.id === b.nftId)
        ?.editions.find((e) => e.kind === b.edition);
      if (!Number.isInteger(b.quantity) || b.quantity < 1)
        return err(422, "VALIDATION", "Quantidade inválida");
      const limit = Math.min(ed?.available ?? 0, ed?.maxPerOrder ?? 0);
      if (b.quantity > limit)
        return err(409, "AVAILABILITY", `Limite de ${limit} unidade(s) para esta edição`);
      it.quantity = b.quantity;
      it.notice = undefined;
      cart.version++;
      save();
      return HttpResponse.json(refreshCart(cart));
    }),
  ),
  http.delete(
    `${API}/cart/items`,
    withScenario(({ request }) => {
      const key = cartKey(request);
      if (!key) return err(400, "VALIDATION", "Carrinho não identificado");
      const u = new URL(request.url);
      const cart = cartFor(key);
      cart.items = cart.items.filter(
        (i) =>
          !(i.nftId === u.searchParams.get("nftId") && i.edition === u.searchParams.get("edition")),
      );
      cart.version++;
      save();
      return HttpResponse.json(refreshCart(cart));
    }),
  ),
  http.post(
    `${API}/cart/merge`,
    withScenario(async ({ request }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      const { guestCartId } = (await request.json()) as { guestCartId?: string };
      const userCart = cartFor(`user:${a.userId}`);
      const guest = guestCartId ? db().carts[guestCartId] : undefined;
      if (guest) {
        for (const gi of guest.items) {
          const ed = db()
            .nfts.find((n) => n.id === gi.nftId)
            ?.editions.find((e) => e.kind === gi.edition);
          const limit = Math.min(ed?.available ?? 0, ed?.maxPerOrder ?? 0);
          const ex = userCart.items.find((i) => i.nftId === gi.nftId && i.edition === gi.edition);
          if (ex) ex.quantity = Math.min(limit, Math.max(ex.quantity, gi.quantity));
          else if (limit > 0)
            userCart.items.push({ ...gi, quantity: Math.min(gi.quantity, limit) });
        }
        delete db().carts[guestCartId!];
        userCart.version++;
      }
      save();
      return HttpResponse.json(refreshCart(userCart));
    }),
  ),

  // ---------- Quote ----------
  http.post(
    `${API}/quote`,
    withScenario(async ({ request }) => {
      const key = cartKey(request);
      if (!key) return err(400, "VALIDATION", "Carrinho não identificado");
      const b = (await request.json()) as { coupon?: string; network?: Network };
      const q = await buildQuote(cartFor(key), b.coupon || undefined, b.network ?? "ethereum");
      save();
      return q instanceof Response ? q : HttpResponse.json(q);
    }),
  ),

  // ---------- Orders ----------
  http.post(
    `${API}/orders`,
    withScenario(
      async ({ request }) => {
        const a = auth(request);
        if ("res" in a) return a.res;
        const s = db();
        const key = request.headers.get("idempotency-key");
        if (!key) return err(422, "VALIDATION", "Idempotency-Key obrigatório");
        const body = (await request.json()) as {
          quoteId: string;
          walletId: string;
          network: Network;
          coupon?: string;
          collector: { name: string; email: string; note?: string };
        };
        const hash = await sha256(JSON.stringify(body));
        const prior = s.idempotency[key];
        if (prior) {
          if (prior.userId !== a.userId || prior.hash !== hash)
            return err(
              409,
              "IDEMPOTENCY_CONFLICT",
              "Chave de idempotência reutilizada com outro conteúdo",
            );
          return HttpResponse.json(publicOrder(s.orders[prior.orderId]), { status: 200 });
        }
        const fields: Record<string, string> = {};
        if (!body.collector?.name || body.collector.name.trim().length < 2)
          fields.name = "Informe o nome do colecionador";
        if (!body.collector?.email || !EMAIL.test(body.collector.email))
          fields.email = "E-mail inválido";
        const wallet = (s.wallets[a.userId] ?? []).find((w) => w.id === body.walletId);
        if (!wallet) fields.walletId = "Selecione uma carteira cadastrada";
        if (Object.keys(fields).length)
          return err(422, "VALIDATION", "Verifique os dados do pagamento", { fields });
        const cart = cartFor(`user:${a.userId}`);
        if (!cart.items.length) return err(422, "VALIDATION", "Seu carrinho está vazio");

        // Scenario: catalog changes right before confirmation
        const first = cart.items[0];
        const nft0 = s.nfts.find((n) => n.id === first.nftId)!;
        const ed0 = nft0.editions.find((e) => e.kind === first.edition)!;
        if (s.scenario === "price-change" && !s.idempotency[`__pc_${a.userId}`]) {
          ed0.price = ethAdd(ed0.price, "0.10");
          s.idempotency[`__pc_${a.userId}`] = { userId: a.userId, hash: "", orderId: "" };
          bumpNft(nft0);
        }
        if (s.scenario === "sold-out" && ed0.available > 0) {
          ed0.available = 0;
          bumpNft(nft0);
        }
        const quote = await buildQuote(cart, body.coupon, body.network);
        if (quote instanceof Response) return quote;
        if (quote.issues.length) {
          save();
          return err(409, "AVAILABILITY", quote.issues[0].message, { quote });
        }
        if (quote.id !== body.quoteId) {
          save();
          return err(409, "QUOTE_STALE", "Preços ou taxas mudaram. Revise e confirme novamente.", {
            quote,
          });
        }
        const now = new Date().toISOString();
        const order: DbOrder = {
          id: `ord_${crypto.randomUUID().slice(0, 8)}`,
          status: "pending",
          createdAt: now,
          updatedAt: now,
          version: 1,
          lines: quote.lines,
          subtotal: quote.subtotal,
          discount: quote.discount,
          networkFee: quote.networkFee,
          total: quote.total,
          coupon: quote.coupon?.code,
          network: body.network,
          wallet: { label: wallet!.label, address: wallet!.address, provider: wallet!.provider },
          collector: body.collector,
          userId: a.userId,
          resolveAt: Date.now() + 2500,
          outcome: s.scenario === "payment-declined" ? "declined" : "confirmed",
        };
        s.orders[order.id] = order;
        s.idempotency[key] = { userId: a.userId, hash, orderId: order.id };
        save();
        setTimeout(() => resolveOrder(order.id), 2510);
        if (s.scenario === "order-timeout") await delay(12000); // client times out; order exists
        return HttpResponse.json(publicOrder(order), { status: 201 });
      },
      { kind: "write" },
    ),
  ),
  http.get(
    `${API}/orders/:id`,
    withScenario(({ request, params }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      resolveOrder(params.id as string);
      const o = db().orders[params.id as string];
      if (!o) return err(404, "NOT_FOUND", "Pedido não encontrado");
      if (o.userId !== a.userId) return err(403, "FORBIDDEN", "Este pedido pertence a outra conta");
      return HttpResponse.json(publicOrder(o));
    }),
  ),
  http.get(
    `${API}/orders`,
    withScenario(({ request }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      const list = Object.values(db().orders)
        .filter((o) => o.userId === a.userId)
        .sort((x, y) => y.createdAt.localeCompare(x.createdAt))
        .map(publicOrder);
      return HttpResponse.json({ items: list });
    }),
  ),

  // ---------- Profile ----------
  http.get(
    `${API}/me`,
    withScenario(({ request }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      return HttpResponse.json(userPublic(db().users.find((u) => u.id === a.userId)!));
    }),
  ),
  http.patch(
    `${API}/me`,
    withScenario(async ({ request }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      const b = (await request.json()) as Partial<User>;
      const fields: Record<string, string> = {};
      if (b.displayName !== undefined && b.displayName.trim().length < 2)
        fields.displayName = "Informe seu nome";
      if (b.username !== undefined && !USERNAME.test(b.username))
        fields.username = "Use 3–20 letras minúsculas, números, _ ou .";
      if (b.email !== undefined && !EMAIL.test(b.email)) fields.email = "E-mail inválido";
      if (b.bio !== undefined && b.bio.length > 160) fields.bio = "Máximo de 160 caracteres";
      Object.assign(fields, validateProfileMetadata(b));
      if (
        b.avatar !== undefined &&
        b.avatar &&
        (!b.avatar.startsWith("data:image/") || b.avatar.length > 400_000)
      )
        fields.avatar = "Imagem inválida ou muito grande";
      const s = db();
      if (b.username && s.users.some((u) => u.username === b.username && u.id !== a.userId))
        fields.username = "Este nome de usuário já está em uso";
      if (b.email && s.users.some((u) => u.email === b.email!.toLowerCase() && u.id !== a.userId))
        fields.email = "Este e-mail já está cadastrado";
      if (Object.keys(fields).length)
        return err(422, "VALIDATION", "Verifique os campos", { fields });
      const u = s.users.find((x) => x.id === a.userId)!;
      Object.assign(u, {
        ...(b.displayName !== undefined && { displayName: b.displayName.trim() }),
        ...(b.username !== undefined && { username: b.username }),
        ...(b.email !== undefined && { email: b.email.toLowerCase() }),
        ...(b.bio !== undefined && { bio: b.bio }),
        ...(b.avatar !== undefined && { avatar: b.avatar || undefined }),
        ...(b.ensName !== undefined && { ensName: b.ensName.trim() }),
        ...(b.walletNickname !== undefined && { walletNickname: b.walletNickname.trim() }),
      });
      save();
      return HttpResponse.json(userPublic(u));
    }),
  ),
  http.post(
    `${API}/me/password`,
    withScenario(async ({ request }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      const b = (await request.json()) as { current?: string; next?: string };
      const u = db().users.find((x) => x.id === a.userId)!;
      if (!b.current || (await sha256(u.salt + b.current)) !== u.passwordHash)
        return err(422, "VALIDATION", "Senha atual incorreta", {
          fields: { current: "Senha atual incorreta" },
        });
      if (!b.next || !PASSWORD.test(b.next))
        return err(422, "VALIDATION", "Senha fraca", {
          fields: { next: "Mínimo 8 caracteres com letras e números" },
        });
      if (b.next === b.current)
        return err(422, "VALIDATION", "Senha igual", {
          fields: { next: "A nova senha deve ser diferente da atual" },
        });
      u.passwordHash = await sha256(u.salt + b.next);
      save();
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  // ---------- Wallets ----------
  http.get(
    `${API}/wallets`,
    withScenario(({ request }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      return HttpResponse.json({ items: db().wallets[a.userId] ?? [] });
    }),
  ),
  http.post(
    `${API}/wallets`,
    withScenario(async ({ request }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      const b = (await request.json()) as Partial<Wallet>;
      const fields = validateWallet(b);
      const list = (db().wallets[a.userId] ??= []);
      if (!b.role || !["primary", "secondary"].includes(b.role)) fields.role = "Papel inválido";
      else if (list.some((w) => w.role === b.role))
        return err(
          409,
          "CONFLICT",
          `Já existe uma carteira ${b.role === "primary" ? "principal" : "secundária"}`,
        );
      if (list.some((w) => w.address.toLowerCase() === b.address?.toLowerCase()))
        fields.address = "Endereço já cadastrado";
      if (Object.keys(fields).length)
        return err(422, "VALIDATION", "Verifique os campos", { fields });
      const w: Wallet = {
        id: `w_${crypto.randomUUID().slice(0, 8)}`,
        role: b.role!,
        label: b.label!.trim(),
        address: b.address!,
        provider: b.provider!,
        network: b.network!,
      };
      list.push(w);
      save();
      return HttpResponse.json(w, { status: 201 });
    }),
  ),
  http.patch(
    `${API}/wallets/:id`,
    withScenario(async ({ request, params }) => {
      const a = auth(request);
      if ("res" in a) return a.res;
      const list = db().wallets[a.userId] ?? [];
      const w = list.find((x) => x.id === params.id);
      if (!w) return err(404, "NOT_FOUND", "Carteira não encontrada");
      const b = (await request.json()) as Partial<Wallet>;
      const merged = { ...w, ...b };
      const fields = validateWallet(merged);
      if (
        list.some((x) => x.id !== w.id && x.address.toLowerCase() === merged.address.toLowerCase())
      )
        fields.address = "Endereço já cadastrado";
      if (Object.keys(fields).length)
        return err(422, "VALIDATION", "Verifique os campos", { fields });
      if (b.role && b.role !== w.role) {
        const other = list.find((x) => x.role === b.role);
        if (other) other.role = w.role; // swap primary/secondary
      }
      Object.assign(w, {
        label: merged.label.trim(),
        address: merged.address,
        provider: merged.provider,
        network: merged.network,
        role: merged.role,
      });
      save();
      return HttpResponse.json(w);
    }),
  ),

  // ---------- Mock control (dev/demo/tests) ----------
  http.get(
    `${API}/__mock/scenario`,
    withScenario(() => HttpResponse.json({ scenario: db().scenario }), { dev: true }),
  ),
  http.post(
    `${API}/__mock/scenario`,
    withScenario(
      async ({ request }) => {
        const { scenario } = (await request.json()) as { scenario: ScenarioId };
        db().scenario = scenario;
        save();
        return HttpResponse.json({ scenario });
      },
      { dev: true },
    ),
  ),
  http.post(
    `${API}/__mock/reset`,
    withScenario(
      async ({ request }) => {
        const { scenario } = ((await request.json().catch(() => ({}))) ?? {}) as {
          scenario?: ScenarioId;
        };
        await resetDb(scenario ?? "default");
        return HttpResponse.json({ ok: true });
      },
      { dev: true },
    ),
  ),
  http.post(
    `${API}/__mock/nft-update`,
    withScenario(
      async ({ request }) => {
        const b = (await request.json()) as {
          nftId: string;
          edition?: EditionKind;
          price?: string;
          available?: number;
        };
        const nft = db().nfts.find((n) => n.id === b.nftId);
        if (!nft) return err(404, "NOT_FOUND", "NFT não encontrado");
        const ed = nft.editions.find((e) => e.kind === (b.edition ?? "1/50"))!;
        if (b.price) ed.price = b.price;
        if (b.available !== undefined) ed.available = b.available;
        bumpNft(nft);
        save();
        return HttpResponse.json(nft);
      },
      { dev: true },
    ),
  ),
  http.post(
    `${API}/__mock/socket`,
    withScenario(
      async ({ request }) => {
        const { action } = (await request.json()) as { action: "drop" | "duplicate" | "stale" };
        if (action === "drop") dropConnections();
        else replay(action);
        return HttpResponse.json({ ok: true });
      },
      { dev: true },
    ),
  ),
];
