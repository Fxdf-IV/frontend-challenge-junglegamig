// Cliente HTTP único (Axios) com interceptação de token/carrinho, espera do MSW e normalização de erros.
import axios, { AxiosError } from "axios";
import type { ApiErrorBody } from "./types";

/** Instância Axios única para todas as chamadas REST; interceptada na camada de rede pelo MSW. */
export const http = axios.create({ baseURL: "/api", timeout: 8000 });

const MOCKS = import.meta.env.VITE_ENABLE_MOCKS !== "false";
let mocksReadyPromise: Promise<unknown> | null = null;

const isRealBrowser =
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator &&
  !navigator.userAgent?.includes("jsdom");

/** Garante que o Service Worker do MSW iniciou antes de enviar requisições no navegador. */
export function ensureMocksReady(): Promise<unknown> {
  if (!MOCKS || import.meta.env.SSR || !isRealBrowser) {
    return Promise.resolve();
  }
  if (!mocksReadyPromise) {
    mocksReadyPromise = import("@/mocks/browser").then((m) => m.startMocks());
  }
  return mocksReadyPromise;
}

if (MOCKS && !import.meta.env.SSR && isRealBrowser) {
  void ensureMocksReady();
}

const TOKEN_KEY = "kurio.token";
const CART_KEY = "kurio.guestCart";

/** Acesso persistente ao token de sessão ativo no navegador. */
export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string | null) =>
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY),
};

/** Obtém ou cria o identificador persistente do carrinho anônimo. */
export function guestCartId() {
  let id = localStorage.getItem(CART_KEY);
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(CART_KEY, id);
  }
  return id;
}

/** Limpa o identificador do carrinho anônimo ao encerrar ou mesclar a sessão. */
export const clearGuestCart = () => localStorage.removeItem(CART_KEY);

type ExpiredListener = () => void;
const expiredListeners = new Set<ExpiredListener>();

/** Registra um ouvinte notificado quando a API retorna 401 SESSION_EXPIRED. */
export const onSessionExpired = (fn: ExpiredListener) => {
  expiredListeners.add(fn);
  return () => {
    expiredListeners.delete(fn);
  };
};

http.interceptors.request.use(async (config) => {
  await ensureMocksReady();
  const t = tokenStore.get();
  if (t) config.headers.set("Authorization", `Bearer ${t}`);
  else config.headers.set("X-Cart-Id", guestCartId());
  return config;
});

http.interceptors.response.use(undefined, (error: AxiosError<ApiErrorBody>) => {
  if (
    error.response?.status === 401 &&
    error.response.data?.error?.code === "SESSION_EXPIRED" &&
    tokenStore.get()
  ) {
    expiredListeners.forEach((fn) => fn());
  }
  return Promise.reject(error);
});

/** Erro padronizado de transporte com status HTTP, código semântico e erros por campo. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorBody["error"]["code"] | "NETWORK" | "TIMEOUT",
    message: string,
    public fields?: Record<string, string>,
    public body?: ApiErrorBody["error"],
  ) {
    super(message);
  }
}

/** Converte falhas do Axios (rede, timeout ou resposta estruturada) em ApiError. */
export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  const ax = e as AxiosError<ApiErrorBody>;
  if (ax?.code === "ECONNABORTED" || ax?.code === "ETIMEDOUT")
    return new ApiError(0, "TIMEOUT", "A requisição demorou demais");
  const body = ax?.response?.data?.error;
  if (body) return new ApiError(ax.response!.status, body.code, body.message, body.fields, body);
  return new ApiError(0, "NETWORK", "Sem conexão com o servidor");
}

/** Envolve uma chamada Axios garantindo retorno tipado ou lançamento de ApiError. */
export async function call<T>(p: Promise<{ data: T }>): Promise<T> {
  try {
    return (await p).data;
  } catch (e) {
    throw toApiError(e);
  }
}
