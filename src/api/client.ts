import axios, { AxiosError } from "axios";
import type { ApiErrorBody } from "./types";

/** Single Axios instance for every REST call. Mocks intercept at the network layer (MSW). */
export const http = axios.create({ baseURL: "/api", timeout: 8000 });

const TOKEN_KEY = "kurio.token";
const CART_KEY = "kurio.guestCart";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string | null) =>
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY),
};

export function guestCartId() {
  let id = localStorage.getItem(CART_KEY);
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(CART_KEY, id);
  }
  return id;
}
export const clearGuestCart = () => localStorage.removeItem(CART_KEY);

type ExpiredListener = () => void;
const expiredListeners = new Set<ExpiredListener>();
export const onSessionExpired = (fn: ExpiredListener) => {
  expiredListeners.add(fn);
  return () => {
    expiredListeners.delete(fn);
  };
};

http.interceptors.request.use((config) => {
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

export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  const ax = e as AxiosError<ApiErrorBody>;
  if (ax?.code === "ECONNABORTED" || ax?.code === "ETIMEDOUT")
    return new ApiError(0, "TIMEOUT", "A requisição demorou demais");
  const body = ax?.response?.data?.error;
  if (body) return new ApiError(ax.response!.status, body.code, body.message, body.fields, body);
  return new ApiError(0, "NETWORK", "Sem conexão com o servidor");
}

/** Wraps an Axios call so callers always receive typed data or an ApiError. */
export async function call<T>(p: Promise<{ data: T }>): Promise<T> {
  try {
    return (await p).data;
  } catch (e) {
    throw toApiError(e);
  }
}
