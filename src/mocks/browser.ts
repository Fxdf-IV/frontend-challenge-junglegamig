import { setupWorker } from "msw/browser";
import { loadDb, db, save } from "./db";
import { handlers, schedulePendingOrders } from "./handlers";
import { socketHandler } from "./realtime";
import type { ScenarioId } from "@/api/types";

/** Starts MSW (REST + Socket.IO). Enabled by VITE_ENABLE_MOCKS (default on). */
export async function startMocks() {
  await loadDb();
  // ?scenario=<id> lets demos and tests select a deterministic scenario
  const sp = new URLSearchParams(window.location.search).get("scenario") as ScenarioId | null;
  if (sp) {
    db().scenario = sp;
    save();
  }
  const worker = setupWorker(...handlers, socketHandler);
  await worker.start({ onUnhandledRequest: "bypass", quiet: true, serviceWorker: { url: "/mockServiceWorker.js" } });
  schedulePendingOrders();
  return worker;
}
