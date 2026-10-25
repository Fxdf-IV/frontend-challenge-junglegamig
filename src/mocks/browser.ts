// Inicialização do MSW no navegador: registra interceptores REST e WebSocket do Socket.IO.
import { setupWorker } from "msw/browser";
import { loadDb, db, save } from "./db";
import { handlers, schedulePendingOrders } from "./handlers";
import { socketHandler } from "./realtime";
import type { ScenarioId } from "@/api/types";

/** Inicia o Service Worker do MSW e interceptador Socket.IO com cenário determinístico. */
export async function startMocks() {
  await loadDb();
  // ?scenario=<id> lets demos and tests select a deterministic scenario
  const sp = new URLSearchParams(window.location.search).get("scenario") as ScenarioId | null;
  if (sp) {
    db().scenario = sp;
    save();
  }
  const worker = setupWorker(...handlers, socketHandler);
  await worker.start({
    onUnhandledFrame: "bypass",
    quiet: true,
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
  schedulePendingOrders();
  return worker;
}
