// Entrada do servidor SSR: delega requisições ao TanStack Start, comprime HTML e trata erros fatais.
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

/** Remove modulepreloads bloqueantes no head e comprime respostas HTML do SSR com gzip. */
async function compressHtmlResponse(request: Request, response: Response): Promise<Response> {
  const acceptEncoding = request.headers.get("accept-encoding") ?? "";
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") || response.headers.has("content-encoding")) {
    return response;
  }
  const rawHtml = await response.text();
  const cleanHtml = rawHtml.replace(/<link rel="modulepreload"[^>]*>/g, "");
  const headers = new Headers(response.headers);
  headers.delete("content-length");

  if (!acceptEncoding.includes("gzip") || typeof CompressionStream === "undefined") {
    return new Response(cleanHtml, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  headers.set("content-encoding", "gzip");
  const stream = new Blob([cleanHtml]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Response(stream, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return await compressHtmlResponse(request, normalized);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
